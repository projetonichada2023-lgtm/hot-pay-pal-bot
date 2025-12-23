import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cart recovery check...");

    // Get all clients with cart recovery enabled
    const { data: clientSettings, error: settingsError } = await supabase
      .from("client_settings")
      .select(`
        client_id,
        cart_reminder_enabled,
        clients!inner(telegram_bot_token)
      `)
      .eq("cart_reminder_enabled", true);

    if (settingsError) {
      console.error("Error fetching client settings:", settingsError);
      throw settingsError;
    }

    console.log(`Found ${clientSettings?.length || 0} clients with cart recovery enabled`);

    for (const setting of clientSettings || []) {
      const clientId = setting.client_id;
      const botToken = (setting.clients as any)?.telegram_bot_token;

      if (!botToken) {
        console.log(`Client ${clientId} has no bot token, skipping`);
        continue;
      }

      // Get recovery messages for this client
      const { data: recoveryMessages, error: messagesError } = await supabase
        .from("cart_recovery_messages")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_active", true)
        .order("delay_minutes", { ascending: true });

      if (messagesError) {
        console.error(`Error fetching recovery messages for client ${clientId}:`, messagesError);
        continue;
      }

      if (!recoveryMessages || recoveryMessages.length === 0) {
        console.log(`No active recovery messages for client ${clientId}`);
        continue;
      }

      console.log(`Client ${clientId} has ${recoveryMessages.length} recovery messages`);

      // Get pending orders that need recovery messages
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          telegram_customers!inner(telegram_id, first_name),
          products(name)
        `)
        .eq("client_id", clientId)
        .eq("status", "pending")
        .lt("recovery_messages_sent", recoveryMessages.length);

      if (ordersError) {
        console.error(`Error fetching pending orders for client ${clientId}:`, ordersError);
        continue;
      }

      console.log(`Found ${pendingOrders?.length || 0} pending orders for client ${clientId}`);

      for (const order of pendingOrders || []) {
        const messagesSent = order.recovery_messages_sent || 0;
        const nextMessage = recoveryMessages[messagesSent];
        
        if (!nextMessage) continue;

        // Calculate if it's time to send this message
        const orderCreatedAt = new Date(order.created_at);
        const now = new Date();
        const minutesSinceOrder = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60);
        
        // Check if we should send based on delay_minutes
        const lastRecoverySentAt = order.last_recovery_sent_at 
          ? new Date(order.last_recovery_sent_at) 
          : orderCreatedAt;
        const minutesSinceLastRecovery = (now.getTime() - lastRecoverySentAt.getTime()) / (1000 * 60);

        // For first message, check against order creation time
        // For subsequent messages, check against last recovery sent time
        const shouldSend = messagesSent === 0 
          ? minutesSinceOrder >= nextMessage.delay_minutes
          : minutesSinceLastRecovery >= nextMessage.delay_minutes;

        if (!shouldSend) {
          console.log(`Order ${order.id}: Not time yet for message ${messagesSent + 1} (${minutesSinceOrder.toFixed(1)} min elapsed, need ${nextMessage.delay_minutes} min)`);
          continue;
        }

        console.log(`Sending recovery message ${messagesSent + 1} to order ${order.id}`);

        // Personalize message
        const customer = order.telegram_customers as any;
        const product = order.products as any;
        let messageContent = nextMessage.message_content;
        messageContent = messageContent.replace("{nome}", customer?.first_name || "Cliente");
        messageContent = messageContent.replace("{produto}", product?.name || "produto");
        messageContent = messageContent.replace("{valor}", `R$ ${Number(order.amount).toFixed(2).replace(".", ",")}`);

        // Send message via Telegram
        try {
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const telegramResponse = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: customer.telegram_id,
              text: messageContent,
              parse_mode: "HTML",
            }),
          });

          if (telegramResponse.ok) {
            console.log(`Recovery message sent successfully for order ${order.id}`);
            
            // Update order with recovery message count
            await supabase
              .from("orders")
              .update({
                recovery_messages_sent: messagesSent + 1,
                last_recovery_sent_at: now.toISOString(),
              })
              .eq("id", order.id);
          } else {
            const errorText = await telegramResponse.text();
            console.error(`Failed to send Telegram message for order ${order.id}:`, errorText);
          }
        } catch (telegramError) {
          console.error(`Error sending Telegram message for order ${order.id}:`, telegramError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Cart recovery check completed" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Cart recovery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});