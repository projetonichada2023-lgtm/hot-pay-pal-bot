 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
 const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
 
 const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
 interface AsaasWebhookPayload {
   event: string;
   payment: {
     id: string;
     customer: string;
     value: number;
     netValue: number;
     billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
     status: string;
     externalReference: string | null;
     description: string | null;
   };
 }
 
 // Credit balance to client account
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
     const payload = await req.json() as AsaasWebhookPayload;
     
     console.log('Asaas webhook received:', JSON.stringify(payload, null, 2));
 
     const { event, payment } = payload;
 
     // Only process payment confirmation events
     if (!['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) {
       console.log(`Ignoring event: ${event}`);
       return new Response(JSON.stringify({ received: true, ignored: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     // Get client_id from externalReference
     const clientId = payment.externalReference;
     
     if (!clientId) {
       console.error('No client_id found in externalReference');
       return new Response(JSON.stringify({ error: 'Missing client reference' }), {
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
       console.error('Client not found:', clientId);
       return new Response(JSON.stringify({ error: 'Client not found' }), {
         status: 404,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     // Determine payment method for logging
     const paymentMethod = payment.billingType === 'PIX' ? 'asaas_pix' : 'asaas_card';
     
     // Credit the balance
     const success = await addCreditToBalance(
       clientId,
       payment.value,
       paymentMethod,
       `Recarga via ${payment.billingType === 'PIX' ? 'PIX' : 'Cartão'} - Asaas`,
       payment.id
     );
 
     if (!success) {
       return new Response(JSON.stringify({ error: 'Failed to credit balance' }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });
     }
 
     console.log(`Successfully credited R$ ${payment.value} to client ${clientId} via ${paymentMethod}`);
 
     return new Response(JSON.stringify({ 
       success: true, 
       clientId, 
       amount: payment.value,
       method: paymentMethod 
     }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
 
   } catch (error) {
     console.error('Error processing Asaas webhook:', error);
     return new Response(JSON.stringify({ 
       error: 'Internal error',
       message: error instanceof Error ? error.message : 'Unknown error'
     }), {
       status: 500,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     });
   }
 });