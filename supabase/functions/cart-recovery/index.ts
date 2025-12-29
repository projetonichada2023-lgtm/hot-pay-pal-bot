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
        .select("*, offer_product:products!cart_recovery_messages_offer_product_id_fkey(id, name, price, image_url)")
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

      // Get orders that need recovery messages (pending or cancelled - not paid)
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          telegram_customers!inner(telegram_id, first_name),
          products(name)
        `)
        .eq("client_id", clientId)
        .in("status", ["pending", "cancelled"])
        .lt("recovery_messages_sent", recoveryMessages.length);

      if (ordersError) {
        console.error(`Error fetching orders for client ${clientId}:`, ordersError);
        continue;
      }

      console.log(`Found ${pendingOrders?.length || 0} pending/cancelled orders for client ${clientId}`);

      for (const order of pendingOrders || []) {
        const messagesSent = order.recovery_messages_sent || 0;
        const nextMessage = recoveryMessages[messagesSent];
        
        if (!nextMessage) continue;

        // Calculate if it's time to send this message
        const orderCreatedAt = new Date(order.created_at);
        const now = new Date();
        
        // Convert delay to minutes based on time_unit
        const timeUnit = nextMessage.time_unit || 'minutes';
        let delayInMinutes = nextMessage.delay_minutes;
        if (timeUnit === 'hours') {
          delayInMinutes = nextMessage.delay_minutes * 60;
        } else if (timeUnit === 'days') {
          delayInMinutes = nextMessage.delay_minutes * 60 * 24;
        }
        
        const minutesSinceOrder = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60);
        
        // Check if we should send based on delay_minutes
        const lastRecoverySentAt = order.last_recovery_sent_at 
          ? new Date(order.last_recovery_sent_at) 
          : orderCreatedAt;
        const minutesSinceLastRecovery = (now.getTime() - lastRecoverySentAt.getTime()) / (1000 * 60);

        // For first message, check against order creation time
        // For subsequent messages, check against last recovery sent time
        const shouldSend = messagesSent === 0 
          ? minutesSinceOrder >= delayInMinutes
          : minutesSinceLastRecovery >= delayInMinutes;

        if (!shouldSend) {
          console.log(`Order ${order.id}: Not time yet for message ${messagesSent + 1} (${minutesSinceOrder.toFixed(1)} min elapsed, need ${delayInMinutes} min)`);
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
          // Check if there's media to send
          const mediaUrl = nextMessage.media_url;
          const mediaType = nextMessage.media_type;
          
          if (mediaUrl && mediaType) {
            // Send media first
            if (mediaType === 'image') {
              const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  photo: mediaUrl,
                  caption: messageContent,
                  parse_mode: "HTML",
                }),
              });
              
              if (!photoResponse.ok) {
                console.error(`Failed to send photo for order ${order.id}:`, await photoResponse.text());
              }
            } else if (mediaType === 'audio') {
              // Send audio
              const audioResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  audio: mediaUrl,
                  caption: messageContent,
                  parse_mode: "HTML",
                }),
              });
              
              if (!audioResponse.ok) {
                console.error(`Failed to send audio for order ${order.id}:`, await audioResponse.text());
              }
            }
          } else {
            // Send text only
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

            if (!telegramResponse.ok) {
              const errorText = await telegramResponse.text();
              console.error(`Failed to send Telegram message for order ${order.id}:`, errorText);
            }
          }

          console.log(`Recovery message sent successfully for order ${order.id}`);

          // Check if there's an offer product to send
          const offerProduct = nextMessage.offer_product as any;
          if (offerProduct && nextMessage.offer_product_id) {
            console.log(`Sending offer product ${offerProduct.name} for order ${order.id}`);
            
            const offerMessage = nextMessage.offer_message || "🔥 Aproveite também esta oferta especial:";
            const productText = `${offerMessage}\n\n📦 *${offerProduct.name}*\n💰 R$ ${Number(offerProduct.price).toFixed(2).replace(".", ",")}`;
            
            // If product has image, send with photo
            if (offerProduct.image_url) {
              const offerPhotoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  photo: offerProduct.image_url,
                  caption: productText,
                  parse_mode: "Markdown",
                  reply_markup: {
                    inline_keyboard: [[
                      { text: "🛒 Comprar agora", callback_data: `buy_${offerProduct.id}` }
                    ]]
                  }
                }),
              });
              
              if (!offerPhotoResponse.ok) {
                console.error(`Failed to send offer photo for order ${order.id}:`, await offerPhotoResponse.text());
              }
            } else {
              // Send text only
              const offerTextResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  text: productText,
                  parse_mode: "Markdown",
                  reply_markup: {
                    inline_keyboard: [[
                      { text: "🛒 Comprar agora", callback_data: `buy_${offerProduct.id}` }
                    ]]
                  }
                }),
              });
              
              if (!offerTextResponse.ok) {
                console.error(`Failed to send offer text for order ${order.id}:`, await offerTextResponse.text());
              }
            }
          }
          
          // Update order with recovery message count
          await supabase
            .from("orders")
            .update({
              recovery_messages_sent: messagesSent + 1,
              last_recovery_sent_at: now.toISOString(),
            })
            .eq("id", order.id);
        } catch (telegramError) {
          console.error(`Error sending Telegram message for order ${order.id}:`, telegramError);
        }
      }

      // ========== RECOVERY FOR CUSTOMERS WITHOUT ORDERS ==========
      // Get customers who interacted but never ordered (or have no pending/paid orders)
      const { data: customersWithoutOrders, error: customersError } = await supabase
        .from("telegram_customers")
        .select("id, telegram_id, first_name, created_at, recovery_messages_sent, last_recovery_sent_at")
        .eq("client_id", clientId)
        .lt("recovery_messages_sent", recoveryMessages.length);

      if (customersError) {
        console.error(`Error fetching customers without orders for client ${clientId}:`, customersError);
        continue;
      }

      // Filter customers who have no orders at all
      for (const customer of customersWithoutOrders || []) {
        // Check if this customer has any orders
        const { count: orderCount } = await supabase
          .from("orders")
          .select("id", { count: 'exact', head: true })
          .eq("customer_id", customer.id);

        if (orderCount && orderCount > 0) {
          // Customer has orders, skip (they're handled in the order recovery loop above)
          continue;
        }

        const messagesSent = customer.recovery_messages_sent || 0;
        const nextMessage = recoveryMessages[messagesSent];
        
        if (!nextMessage) continue;

        // Calculate if it's time to send this message
        const customerCreatedAt = new Date(customer.created_at);
        const now = new Date();
        
        // Convert delay to minutes based on time_unit
        const timeUnit = nextMessage.time_unit || 'minutes';
        let delayInMinutes = nextMessage.delay_minutes;
        if (timeUnit === 'hours') {
          delayInMinutes = nextMessage.delay_minutes * 60;
        } else if (timeUnit === 'days') {
          delayInMinutes = nextMessage.delay_minutes * 60 * 24;
        }
        
        const minutesSinceCreation = (now.getTime() - customerCreatedAt.getTime()) / (1000 * 60);
        
        const lastRecoverySentAt = customer.last_recovery_sent_at 
          ? new Date(customer.last_recovery_sent_at) 
          : customerCreatedAt;
        const minutesSinceLastRecovery = (now.getTime() - lastRecoverySentAt.getTime()) / (1000 * 60);

        const shouldSend = messagesSent === 0 
          ? minutesSinceCreation >= delayInMinutes
          : minutesSinceLastRecovery >= delayInMinutes;

        if (!shouldSend) {
          console.log(`Customer ${customer.id}: Not time yet for message ${messagesSent + 1} (${minutesSinceCreation.toFixed(1)} min elapsed, need ${delayInMinutes} min)`);
          continue;
        }

        console.log(`Sending recovery message ${messagesSent + 1} to customer without order ${customer.id}`);

        // Personalize message (no product info since no order)
        let messageContent = nextMessage.message_content;
        messageContent = messageContent.replace("{nome}", customer?.first_name || "Cliente");
        messageContent = messageContent.replace("{produto}", "nossos produtos");
        messageContent = messageContent.replace("{valor}", "");

        try {
          const mediaUrl = nextMessage.media_url;
          const mediaType = nextMessage.media_type;
          
          if (mediaUrl && mediaType) {
            if (mediaType === 'image') {
              const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  photo: mediaUrl,
                  caption: messageContent,
                  parse_mode: "HTML",
                }),
              });
              
              if (!photoResponse.ok) {
                console.error(`Failed to send photo for customer ${customer.id}:`, await photoResponse.text());
              }
            } else if (mediaType === 'audio') {
              const audioResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendAudio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  audio: mediaUrl,
                  caption: messageContent,
                  parse_mode: "HTML",
                }),
              });
              
              if (!audioResponse.ok) {
                console.error(`Failed to send audio for customer ${customer.id}:`, await audioResponse.text());
              }
            }
          } else {
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

            if (!telegramResponse.ok) {
              const errorText = await telegramResponse.text();
              console.error(`Failed to send Telegram message for customer ${customer.id}:`, errorText);
            }
          }

          console.log(`Recovery message sent successfully for customer without order ${customer.id}`);

          // Send offer product if configured
          const offerProduct = nextMessage.offer_product as any;
          if (offerProduct && nextMessage.offer_product_id) {
            console.log(`Sending offer product ${offerProduct.name} for customer ${customer.id}`);
            
            const offerMessage = nextMessage.offer_message || "🔥 Confira esta oferta especial:";
            const productText = `${offerMessage}\n\n📦 *${offerProduct.name}*\n💰 R$ ${Number(offerProduct.price).toFixed(2).replace(".", ",")}`;
            
            if (offerProduct.image_url) {
              await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  photo: offerProduct.image_url,
                  caption: productText,
                  parse_mode: "Markdown",
                  reply_markup: {
                    inline_keyboard: [[
                      { text: "🛒 Comprar agora", callback_data: `buy_${offerProduct.id}` }
                    ]]
                  }
                }),
              });
            } else {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: customer.telegram_id,
                  text: productText,
                  parse_mode: "Markdown",
                  reply_markup: {
                    inline_keyboard: [[
                      { text: "🛒 Comprar agora", callback_data: `buy_${offerProduct.id}` }
                    ]]
                  }
                }),
              });
            }
          }
          
          // Update customer with recovery message count
          await supabase
            .from("telegram_customers")
            .update({
              recovery_messages_sent: messagesSent + 1,
              last_recovery_sent_at: now.toISOString(),
            })
            .eq("id", customer.id);
        } catch (telegramError) {
          console.error(`Error sending Telegram message for customer ${customer.id}:`, telegramError);
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