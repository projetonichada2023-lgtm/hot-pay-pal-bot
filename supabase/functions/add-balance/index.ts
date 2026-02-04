import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FASTSOFT_API_URL = 'https://api.fastsoftbrasil.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AddBalanceRequest {
  clientId: string;
  amount: number;
  method: 'pix' | 'stripe';
}

// Generate PIX for balance top-up via FastSoft
async function generateBalancePix(
  clientId: string,
  amount: number,
  clientSettings: any
): Promise<{ pixCode: string; pixQrcode: string; paymentId: string } | null> {
  if (!clientSettings?.fastsoft_public_key || !clientSettings?.fastsoft_api_key) {
    console.log('FastSoft not configured, generating mock PIX');
    return generateMockPix(clientId, amount);
  }

  try {
    const authHeader = 'Basic ' + btoa(`${clientSettings.fastsoft_public_key}:${clientSettings.fastsoft_api_key}`);

    const requestBody = {
      amount: Math.round(amount * 100),
      currency: 'BRL',
      paymentMethod: 'PIX',
      customer: {
        name: 'Recarga de Saldo',
        email: 'recarga@plataforma.com',
        document: { number: '00000000000', type: 'CPF' },
      },
      items: [{
        title: 'Recarga de Saldo - Taxas da Plataforma',
        unitPrice: Math.round(amount * 100),
        quantity: 1,
        tangible: false,
      }],
      pix: { expiresInDays: 1 },
      metadata: JSON.stringify({ 
        type: 'balance_topup',
        client_id: clientId 
      }),
      postbackUrl: `${SUPABASE_URL}/functions/v1/balance-webhook`,
    };

    const response = await fetch(`${FASTSOFT_API_URL}/api/user/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('FastSoft balance PIX response:', response.status, responseText);

    if (!response.ok) return generateMockPix(clientId, amount);

    const data = JSON.parse(responseText);
    const pixCode = data.pix?.qrcode || data.pixCode || '';
    const pixQrcode = data.pix?.receiptUrl || 
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

    return { pixCode, pixQrcode, paymentId: data.id };
  } catch (error) {
    console.error('Error generating balance PIX:', error);
    return generateMockPix(clientId, amount);
  }
}

// Generate mock PIX for testing
function generateMockPix(clientId: string, amount: number): { pixCode: string; pixQrcode: string; paymentId: string } {
  const randomId = crypto.randomUUID();
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${randomId}52040000530398654${amount.toFixed(2).replace('.', '')}5802BR5916RECARGA SALDO6009SAO PAULO62070503***6304`;
  const pixQrcode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

  return { 
    pixCode, 
    pixQrcode, 
    paymentId: `BALANCE_${clientId.slice(0, 8)}_${Date.now()}` 
  };
}

// Add credit to client balance (used by admin or after payment confirmation)
async function addCreditToBalance(
  clientId: string,
  amount: number,
  paymentMethod: string,
  description: string,
  referenceId?: string
): Promise<boolean> {
  // Get current balance
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

  // If there's debt, pay it off first
  if (currentDebt > 0) {
    if (amount >= currentDebt) {
      // Pay off all debt and add remaining to balance
      newDebt = 0;
      newBalance = currentBalance + (amount - currentDebt);
      creditDescription = `${description} (R$ ${currentDebt.toFixed(2)} para dívida, R$ ${(amount - currentDebt).toFixed(2)} para saldo)`;
    } else {
      // Partial debt payment
      newDebt = currentDebt - amount;
      creditDescription = `${description} (pagamento parcial de dívida)`;
    }
  } else {
    // No debt, add directly to balance
    newBalance = currentBalance + amount;
  }

  // Update balance
  const { error: updateError } = await supabase
    .from('client_balances')
    .update({
      balance: newBalance,
      debt_amount: newDebt,
      // Clear debt start date and unblock if debt is paid
      debt_started_at: newDebt === 0 ? null : balance.debt_started_at,
      is_blocked: newDebt === 0 ? false : balance.is_blocked,
      blocked_at: newDebt === 0 ? null : balance.blocked_at,
    })
    .eq('client_id', clientId);

  if (updateError) {
    console.error('Error updating balance:', updateError);
    return false;
  }

  // Record transaction
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
    const { clientId, amount, method } = body;

    console.log('Add balance request:', { clientId, amount, method });

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

    if (method === 'pix') {
      // Get client settings for FastSoft
      const { data: settings } = await supabase
        .from('client_settings')
        .select('fastsoft_public_key, fastsoft_api_key, fastsoft_enabled')
        .eq('client_id', clientId)
        .single();

      const pix = await generateBalancePix(clientId, amount, settings);

      if (!pix) {
        return new Response(JSON.stringify({ error: 'Failed to generate PIX' }), {
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
    } else if (method === 'stripe') {
      // TODO: Implement Stripe payment intent
      return new Response(JSON.stringify({ 
        error: 'Stripe payment not yet implemented',
        message: 'Use PIX for now'
      }), {
        status: 501,
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

// Export for use in other functions
export { addCreditToBalance };
