import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting expire-pending-orders function');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the cutoff time (15 minutes ago)
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    console.log(`Looking for pending orders created before: ${cutoffTime}`);

    // Find all pending orders older than 15 minutes
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_id, client_id, amount, product_id, telegram_message_id')
      .eq('status', 'pending')
      .lt('created_at', cutoffTime);

    if (fetchError) {
      console.error('Error fetching expired orders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredOrders?.length || 0} expired pending orders`);

    if (!expiredOrders || expiredOrders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired orders found',
          expiredCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all expired orders to cancelled status
    const orderIds = expiredOrders.map(order => order.id);
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .in('id', orderIds);

    if (updateError) {
      console.error('Error updating orders:', updateError);
      throw updateError;
    }

    console.log(`Successfully cancelled ${orderIds.length} expired orders`);

    // Optionally notify customers via Telegram about expired orders
    for (const order of expiredOrders) {
      try {
        // Get client's bot token
        const { data: clientData } = await supabase
          .from('clients')
          .select('telegram_bot_token')
          .eq('id', order.client_id)
          .single();

        if (!clientData?.telegram_bot_token) {
          console.log(`No bot token for client ${order.client_id}, skipping notification`);
          continue;
        }

        // Get customer's telegram_id
        const { data: customerData } = await supabase
          .from('telegram_customers')
          .select('telegram_id')
          .eq('id', order.customer_id)
          .single();

        if (!customerData?.telegram_id) {
          console.log(`No customer data for order ${order.id}, skipping notification`);
          continue;
        }

        // Get bot message for cancelled orders
        const { data: messageData } = await supabase
          .from('bot_messages')
          .select('message_content')
          .eq('client_id', order.client_id)
          .eq('message_type', 'order_cancelled')
          .eq('is_active', true)
          .single();

        const cancelMessage = messageData?.message_content || '⏰ Seu pedido foi cancelado por expiração (15 minutos sem pagamento).';

        // Send notification to customer
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${clientData.telegram_bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: customerData.telegram_id,
              text: `${cancelMessage}\n\n⏰ <i>Pedido expirado por falta de pagamento.</i>`,
              parse_mode: 'HTML',
            }),
          }
        );

        if (!telegramResponse.ok) {
          const errorText = await telegramResponse.text();
          console.error(`Failed to send Telegram notification for order ${order.id}:`, errorText);
        } else {
          console.log(`Sent expiration notification for order ${order.id}`);
        }

        // Delete the original order message if we have the message_id
        if (order.telegram_message_id) {
          await fetch(
            `https://api.telegram.org/bot${clientData.telegram_bot_token}/deleteMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: customerData.telegram_id,
                message_id: order.telegram_message_id,
              }),
            }
          );
        }
      } catch (notifyError) {
        console.error(`Error notifying customer for order ${order.id}:`, notifyError);
        // Continue with other orders even if notification fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cancelled ${orderIds.length} expired orders`,
        expiredCount: orderIds.length,
        orderIds 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in expire-pending-orders:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
