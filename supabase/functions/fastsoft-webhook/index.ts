import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Send Telegram message
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
  return response.json();
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('FastSoft webhook received:', JSON.stringify(payload, null, 2));

    // Validate webhook structure
    if (payload.type !== 'transaction' || !payload.data) {
      console.log('Invalid webhook type or missing data');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transaction = payload.data;
    const transactionId = transaction.id;
    const status = transaction.status?.toUpperCase();

    console.log(`Processing transaction ${transactionId} with status ${status}`);

    // Find order by payment_id (which is the FastSoft transaction ID)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(*), telegram_customers(*), clients(*)')
      .eq('payment_id', transactionId)
      .single();

    if (orderError || !order) {
      console.log('Order not found for transaction:', transactionId);
      // Try finding by metadata if available
      if (transaction.metadata) {
        try {
          const metadata = typeof transaction.metadata === 'string' 
            ? JSON.parse(transaction.metadata) 
            : transaction.metadata;
          
          if (metadata.order_id) {
            const { data: orderByMeta } = await supabase
              .from('orders')
              .select('*, products(*), telegram_customers(*), clients(*)')
              .eq('id', metadata.order_id)
              .single();
            
            if (orderByMeta) {
              console.log('Found order by metadata:', orderByMeta.id);
              // Continue processing with this order
              await processPaymentUpdate(orderByMeta, status, transaction);
            }
          }
        } catch (e) {
          console.error('Error parsing metadata:', e);
        }
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await processPaymentUpdate(order, status, transaction);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processPaymentUpdate(order: any, status: string, transaction: any) {
  const orderId = order.id;
  const clientId = order.client_id;

  // Get client info for bot token
  const { data: client } = await supabase
    .from('clients')
    .select('telegram_bot_token')
    .eq('id', clientId)
    .single();

  // Get client settings for auto_delivery
  const { data: settings } = await supabase
    .from('client_settings')
    .select('auto_delivery')
    .eq('client_id', clientId)
    .single();

  // Get bot message templates
  const { data: messages } = await supabase
    .from('bot_messages')
    .select('message_type, message_content')
    .eq('client_id', clientId);

  const getMessageContent = (type: string, defaultMsg: string) => {
    const msg = messages?.find(m => m.message_type === type);
    return msg?.message_content || defaultMsg;
  };

  const botToken = client?.telegram_bot_token;
  const customerTelegramId = order.telegram_customers?.telegram_id;

  if (status === 'PAID' || status === 'AUTHORIZED') {
    console.log(`Payment confirmed for order ${orderId}`);
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Notify customer via Telegram
    if (botToken && customerTelegramId) {
      const successMsg = getMessageContent('payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.');
      await sendTelegramMessage(botToken, customerTelegramId, successMsg);

      // Auto delivery if enabled
      if (settings?.auto_delivery && order.products?.file_url) {
        await supabase
          .from('orders')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        // Increment sales count
        await supabase
          .from('products')
          .update({ sales_count: (order.products.sales_count || 0) + 1 })
          .eq('id', order.product_id);

        const deliveryMsg = getMessageContent('product_delivered', '📦 Produto entregue! Obrigado pela compra!');
        await sendTelegramMessage(
          botToken,
          customerTelegramId,
          `${deliveryMsg}\n\n🔗 Acesse seu produto:\n${order.products.file_url}`
        );
      } else {
        // Manual delivery notification
        const manualDeliveryMsg = '📦 Seu produto será entregue em breve pelo vendedor.';
        await sendTelegramMessage(botToken, customerTelegramId, manualDeliveryMsg);
      }
    }

    // Log message
    if (customerTelegramId) {
      await supabase.from('telegram_messages').insert({
        client_id: clientId,
        customer_id: order.customer_id,
        telegram_chat_id: customerTelegramId,
        direction: 'outgoing',
        message_type: 'text',
        message_content: '[Sistema] Pagamento confirmado via FastSoft webhook',
      });
    }
  } else if (status === 'REFUSED' || status === 'CANCELED') {
    console.log(`Payment failed/cancelled for order ${orderId}`);
    
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (botToken && customerTelegramId) {
      const cancelMsg = getMessageContent('order_cancelled', '❌ Pedido cancelado.');
      await sendTelegramMessage(botToken, customerTelegramId, cancelMsg);
    }
  } else if (status === 'REFUNDED' || status === 'CHARGEDBACK') {
    console.log(`Order refunded/chargedback ${orderId}`);
    
    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId);

    if (botToken && customerTelegramId) {
      await sendTelegramMessage(
        botToken,
        customerTelegramId,
        '💸 Seu pagamento foi estornado. Em caso de dúvidas, entre em contato.'
      );
    }
  }
}
