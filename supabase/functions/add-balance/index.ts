import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!;
const ASAAS_API_URL = 'https://api.asaas.com/v3';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AddBalanceRequest {
  clientId: string;
  amount: number;
  method: 'pix' | 'card';
  cpfCnpj?: string;
}

// Find or create Asaas customer for the platform
async function getOrCreateAsaasCustomer(
  clientId: string,
  businessName: string,
  cpfCnpj?: string
): Promise<string | null> {
  try {
    // Check if client has asaas_customer_id
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id, business_email, business_phone')
      .eq('id', clientId)
      .single();

    // Using stripe_customer_id field to store asaas customer id temporarily
    if (client?.stripe_customer_id?.startsWith('cus_')) {
      // Update cpfCnpj if provided
      if (cpfCnpj) {
        await fetch(`${ASAAS_API_URL}/customers/${client.stripe_customer_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY,
          },
          body: JSON.stringify({ cpfCnpj: cpfCnpj.replace(/\D/g, '') }),
        });
      }
      return client.stripe_customer_id;
    }

    const email = client?.business_email || `cliente_${clientId.slice(0, 8)}@plataforma.com`;
    const phone = client?.business_phone?.replace(/\D/g, '') || undefined;

    // Create new customer in Asaas
    const customerBody: Record<string, unknown> = {
      name: businessName || 'Cliente Plataforma',
      email,
      notificationDisabled: true,
    };
    if (cpfCnpj) {
      customerBody.cpfCnpj = cpfCnpj.replace(/\D/g, '');
    }
    if (phone && phone.length >= 10) {
      customerBody.mobilePhone = phone;
    }

    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(customerBody),
    });

    const data = await response.json();
    console.log('Asaas customer creation response:', data);

    if (data.id) {
      // Store the customer ID
      await supabase
        .from('clients')
        .update({ stripe_customer_id: data.id })
        .eq('id', clientId);
      
      return data.id;
    }

    return null;
  } catch (error) {
    console.error('Error creating Asaas customer:', error);
    return null;
  }
}

// Generate PIX payment via Asaas
async function generateAsaasPix(
  clientId: string,
  amount: number,
  customerId: string
): Promise<{ pixCode: string; pixQrcode: string; paymentId: string } | null> {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: amount,
        dueDate: dueDate.toISOString().split('T')[0],
        description: 'Recarga de Saldo - Plataforma',
        externalReference: clientId,
      }),
    });

    const payment = await response.json();
    console.log('Asaas payment response:', payment);

    if (!payment.id) {
      console.error('Failed to create Asaas payment:', payment);
      return null;
    }

    // Get PIX QR Code
    const pixResponse = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`, {
      headers: {
        'access_token': ASAAS_API_KEY,
      },
    });

    const pixData = await pixResponse.json();
    console.log('Asaas PIX QR Code response:', pixData);

    if (!pixData.encodedImage || !pixData.payload) {
      console.error('Failed to get PIX QR code:', pixData);
      return null;
    }

    return {
      pixCode: pixData.payload,
      pixQrcode: `data:image/png;base64,${pixData.encodedImage}`,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error generating Asaas PIX:', error);
    return null;
  }
}

// Generate credit card payment link via Asaas
async function generateAsaasCardPayment(
  clientId: string,
  amount: number,
  customerId: string
): Promise<{ invoiceUrl: string; paymentId: string } | null> {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: amount,
        dueDate: dueDate.toISOString().split('T')[0],
        description: 'Recarga de Saldo - Plataforma',
        externalReference: clientId,
      }),
    });

    const payment = await response.json();
    console.log('Asaas card payment response:', payment);

    if (!payment.id || !payment.invoiceUrl) {
      console.error('Failed to create Asaas card payment:', payment);
      return null;
    }

    return {
      invoiceUrl: payment.invoiceUrl,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error('Error generating Asaas card payment:', error);
    return null;
  }
}

// Add credit to client balance (used by admin or after payment confirmation)
async function addCreditToBalance(
  clientId: string,
  amount: number,
  paymentMethod: string,
  description: string,
  referenceId?: string
): Promise<boolean> {
  const { data: balance, error: balanceError } = await supabase
    .from('client_balances')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (balanceError) {
    console.error('Error fetching balance:', balanceError);
    return false;
  }

  const currentBalance = Number(balance?.balance) || 0;
  const currentDebt = Number(balance?.debt_amount) || 0;
  
  let newBalance = currentBalance;
  let newDebt = currentDebt;
  let creditDescription = description;

  if (currentDebt > 0) {
    if (amount >= currentDebt) {
      newDebt = 0;
      newBalance = currentBalance + (amount - currentDebt);
      creditDescription = `${description} (R$ ${currentDebt.toFixed(2)} para dívida, R$ ${(amount - currentDebt).toFixed(2)} para saldo)`;
    } else {
      newDebt = currentDebt - amount;
      creditDescription = `${description} (pagamento parcial de dívida)`;
    }
  } else {
    newBalance = currentBalance + amount;
  }

  const { error: updateError } = await supabase
    .from('client_balances')
    .update({
      balance: newBalance,
      debt_amount: newDebt,
      debt_started_at: newDebt === 0 ? null : balance.debt_started_at,
      is_blocked: newDebt === 0 ? false : balance.is_blocked,
      blocked_at: newDebt === 0 ? null : balance.blocked_at,
    })
    .eq('client_id', clientId);

  if (updateError) {
    console.error('Error updating balance:', updateError);
    return false;
  }

  const { error: txError } = await supabase
    .from('balance_transactions')
    .insert({
      client_id: clientId,
      type: 'credit',
      amount: amount,
      description: creditDescription,
      reference_id: referenceId,
      payment_method: paymentMethod,
    });

  if (txError) {
    console.error('Error recording transaction:', txError);
  }

  console.log(`Added R$ ${amount.toFixed(2)} to client ${clientId}. New balance: R$ ${newBalance.toFixed(2)}, Debt: R$ ${newDebt.toFixed(2)}`);
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as AddBalanceRequest;
    const { clientId, amount, method, cpfCnpj } = body;

    console.log('Add balance request:', { clientId, amount, method, hasCpfCnpj: !!cpfCnpj });

    if (!clientId || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, business_name')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create Asaas customer
    const asaasCustomerId = await getOrCreateAsaasCustomer(clientId, client.business_name, cpfCnpj);
    
    if (!asaasCustomerId) {
      return new Response(JSON.stringify({ error: 'Não foi possível criar cliente no gateway de pagamento. Verifique seu CPF/CNPJ.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'pix') {
      const pix = await generateAsaasPix(clientId, amount, asaasCustomerId);

      if (!pix) {
        return new Response(JSON.stringify({ error: 'Falha ao gerar PIX' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        method: 'pix',
        pixCode: pix.pixCode,
        pixQrcode: pix.pixQrcode,
        paymentId: pix.paymentId,
        amount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (method === 'card') {
      const cardPayment = await generateAsaasCardPayment(clientId, amount, asaasCustomerId);

      if (!cardPayment) {
        return new Response(JSON.stringify({ error: 'Falha ao criar pagamento com cartão' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        method: 'card',
        invoiceUrl: cardPayment.invoiceUrl,
        paymentId: cardPayment.paymentId,
        amount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid payment method' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in add-balance:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

export { addCreditToBalance };
