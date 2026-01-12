import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// CONFIGURATION
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

// =============================================================================
// TYPES
// =============================================================================

interface BotWithClient {
  id: string;
  client_id: string;
  telegram_bot_token: string;
  is_active: boolean;
}

interface RecoveryMessage {
  id: string;
  delay_minutes: number;
  time_unit: string | null;
  message_content: string;
  media_url: string | null;
  media_type: string | null;
  offer_product_id: string | null;
  offer_message: string | null;
  bot_id: string | null;
  offer_product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  } | null;
}

interface RecoveryTarget {
  id: string;
  telegram_id: number;
  first_name: string | null;
  created_at: string;
  recovery_messages_sent: number;
  last_recovery_sent_at: string | null;
  type: 'order' | 'customer';
  // Order-specific fields
  amount?: number;
  product_name?: string;
}

// =============================================================================
// UTILITIES
// =============================================================================

function calculateDelayMinutes(delayMinutes: number, timeUnit: string | null): number {
  switch (timeUnit) {
    case 'hours': return delayMinutes * 60;
    case 'days': return delayMinutes * 60 * 24;
    default: return delayMinutes;
  }
}

function shouldSendMessage(
  messagesSent: number,
  delayInMinutes: number,
  createdAt: Date,
  lastRecoverySentAt: Date | null,
  now: Date
): boolean {
  const referenceTime = messagesSent === 0 ? createdAt : (lastRecoverySentAt || createdAt);
  const minutesElapsed = (now.getTime() - referenceTime.getTime()) / (1000 * 60);
  return minutesElapsed >= delayInMinutes;
}

function personalizeMessage(
  content: string,
  firstName: string | null,
  productName: string | null,
  amount: number | null
): string {
  return content
    .replace("{nome}", firstName || "Cliente")
    .replace("{produto}", productName || "nossos produtos")
    .replace("{valor}", amount ? `R$ ${Number(amount).toFixed(2).replace(".", ",")}` : "");
}

// =============================================================================
// TELEGRAM API WITH RETRY
// =============================================================================

async function sendTelegramWithRetry(
  botToken: string,
  endpoint: string,
  body: Record<string, any>,
  retryCount = 0
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) return true;

    const errorText = await response.text();
    console.error(`Telegram API error (attempt ${retryCount + 1}):`, errorText);

    // Retry on rate limit or server errors
    if (retryCount < MAX_RETRIES && (response.status === 429 || response.status >= 500)) {
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendTelegramWithRetry(botToken, endpoint, body, retryCount + 1);
    }

    return false;
  } catch (error) {
    console.error(`Telegram request failed (attempt ${retryCount + 1}):`, error);

    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendTelegramWithRetry(botToken, endpoint, body, retryCount + 1);
    }

    return false;
  }
}

async function sendRecoveryMessage(
  botToken: string,
  chatId: number,
  message: RecoveryMessage,
  personalizedContent: string
): Promise<boolean> {
  // Send main message with media if available
  if (message.media_url && message.media_type) {
    const endpoint = message.media_type === 'image' ? 'sendPhoto' : 'sendAudio';
    const mediaKey = message.media_type === 'image' ? 'photo' : 'audio';

    return sendTelegramWithRetry(botToken, endpoint, {
      chat_id: chatId,
      [mediaKey]: message.media_url,
      caption: personalizedContent,
      parse_mode: "HTML",
    });
  }

  return sendTelegramWithRetry(botToken, 'sendMessage', {
    chat_id: chatId,
    text: personalizedContent,
    parse_mode: "HTML",
  });
}

async function sendOfferProduct(
  botToken: string,
  chatId: number,
  offerProduct: NonNullable<RecoveryMessage['offer_product']>,
  offerMessage: string | null
): Promise<void> {
  const message = offerMessage || "🔥 Aproveite também esta oferta especial:";
  const productText = `${message}\n\n📦 *${offerProduct.name}*\n💰 R$ ${Number(offerProduct.price).toFixed(2).replace(".", ",")}`;

  const replyMarkup = {
    inline_keyboard: [[{ text: "🛒 Comprar agora", callback_data: `buy_${offerProduct.id}` }]]
  };

  if (offerProduct.image_url) {
    await sendTelegramWithRetry(botToken, 'sendPhoto', {
      chat_id: chatId,
      photo: offerProduct.image_url,
      caption: productText,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    });
  } else {
    await sendTelegramWithRetry(botToken, 'sendMessage', {
      chat_id: chatId,
      text: productText,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    });
  }
}

// =============================================================================
// MAIN RECOVERY LOGIC
// =============================================================================

async function processBot(
  supabase: any,
  bot: BotWithClient
): Promise<{ ordersProcessed: number; customersProcessed: number }> {
  const stats = { ordersProcessed: 0, customersProcessed: 0 };
  const now = new Date();

  const clientId = bot.client_id;
  const botId = bot.id;
  const botToken = bot.telegram_bot_token;

  // Fetch recovery messages for this bot (or global messages without bot_id)
  const { data: recoveryMessages, error: messagesError } = await supabase
    .from("cart_recovery_messages")
    .select(`
      id, delay_minutes, time_unit, message_content, media_url, media_type,
      offer_product_id, offer_message, bot_id,
      offer_product:products!cart_recovery_messages_offer_product_id_fkey(id, name, price, image_url)
    `)
    .eq("client_id", clientId)
    .or(`bot_id.eq.${botId},bot_id.is.null`)
    .eq("is_active", true)
    .order("delay_minutes", { ascending: true });

  if (messagesError || !recoveryMessages?.length) {
    if (messagesError) console.error(`Error fetching recovery messages for bot ${botId}:`, messagesError);
    return stats;
  }

  console.log(`Bot ${botId}: ${recoveryMessages.length} active recovery messages`);

  // Fetch pending orders and customers without orders in parallel
  const [ordersResult, customersResult] = await Promise.all([
    // Orders query with joins - filter by bot_id
    supabase
      .from("orders")
      .select(`
        id, created_at, recovery_messages_sent, last_recovery_sent_at, amount, product_id,
        telegram_customers!inner(telegram_id, first_name),
        products(name)
      `)
      .eq("client_id", clientId)
      .eq("bot_id", botId)
      .in("status", ["pending", "cancelled"])
      .lt("recovery_messages_sent", recoveryMessages.length),

    // Customers query - filter by bot_id
    supabase
      .from("telegram_customers")
      .select("id, telegram_id, first_name, created_at, recovery_messages_sent, last_recovery_sent_at")
      .eq("client_id", clientId)
      .eq("bot_id", botId)
      .lt("recovery_messages_sent", recoveryMessages.length)
  ]);

  if (ordersResult.error) console.error(`Error fetching orders for bot ${botId}:`, ordersResult.error);
  if (customersResult.error) console.error(`Error fetching customers for bot ${botId}:`, customersResult.error);

  const pendingOrders: any[] = ordersResult.data || [];
  const allCustomers: any[] = customersResult.data || [];

  console.log(`Bot ${botId}: ${pendingOrders.length} pending orders, ${allCustomers.length} potential customers`);

  // Get customer IDs that have orders (to exclude from customer-only recovery)
  const customerIdsWithOrders = new Set(pendingOrders.map((o: any) => o.telegram_customers?.id).filter(Boolean));

  // Process orders
  for (const order of pendingOrders) {
    const messagesSent = order.recovery_messages_sent || 0;
    const nextMessage = recoveryMessages[messagesSent] as RecoveryMessage;
    if (!nextMessage) continue;

    const delayInMinutes = calculateDelayMinutes(nextMessage.delay_minutes, nextMessage.time_unit);
    const orderCreatedAt = new Date(order.created_at);
    const lastRecoverySentAt = order.last_recovery_sent_at ? new Date(order.last_recovery_sent_at) : null;

    if (!shouldSendMessage(messagesSent, delayInMinutes, orderCreatedAt, lastRecoverySentAt, now)) {
      continue;
    }

    const customer = order.telegram_customers as any;
    const product = order.products as any;
    const personalizedContent = personalizeMessage(
      nextMessage.message_content,
      customer?.first_name,
      product?.name,
      order.amount
    );

    console.log(`Sending recovery message ${messagesSent + 1} for order ${order.id}`);

    const success = await sendRecoveryMessage(botToken, customer.telegram_id, nextMessage, personalizedContent);

    if (success) {
      // Send offer product if configured
      if (nextMessage.offer_product && nextMessage.offer_product_id) {
        await sendOfferProduct(botToken, customer.telegram_id, nextMessage.offer_product, nextMessage.offer_message);
      }

      // Update order
      await supabase
        .from("orders")
        .update({
          recovery_messages_sent: messagesSent + 1,
          last_recovery_sent_at: now.toISOString(),
        })
        .eq("id", order.id);

      stats.ordersProcessed++;
    }
  }

  // Process customers without orders (batch check for efficiency)
  const customersWithoutOrders = allCustomers.filter(c => !customerIdsWithOrders.has(c.id));

  // Batch check which customers have ANY orders
  if (customersWithoutOrders.length > 0) {
    const customerIds = customersWithoutOrders.map(c => c.id);

    const { data: ordersForCustomers } = await supabase
      .from("orders")
      .select("customer_id")
      .in("customer_id", customerIds);

    const customerIdsWithAnyOrders = new Set((ordersForCustomers || []).map((o: any) => o.customer_id));

    for (const customer of customersWithoutOrders) {
      // Skip if customer has any orders
      if (customerIdsWithAnyOrders.has(customer.id)) continue;

      const messagesSent = customer.recovery_messages_sent || 0;
      const nextMessage = recoveryMessages[messagesSent] as RecoveryMessage;
      if (!nextMessage) continue;

      const delayInMinutes = calculateDelayMinutes(nextMessage.delay_minutes, nextMessage.time_unit);
      const customerCreatedAt = new Date(customer.created_at);
      const lastRecoverySentAt = customer.last_recovery_sent_at ? new Date(customer.last_recovery_sent_at) : null;

      if (!shouldSendMessage(messagesSent, delayInMinutes, customerCreatedAt, lastRecoverySentAt, now)) {
        continue;
      }

      const personalizedContent = personalizeMessage(
        nextMessage.message_content,
        customer.first_name,
        null,
        null
      );

      console.log(`Sending recovery message ${messagesSent + 1} for customer ${customer.id}`);

      const success = await sendRecoveryMessage(botToken, customer.telegram_id, nextMessage, personalizedContent);

      if (success) {
        // Send offer product if configured
        if (nextMessage.offer_product && nextMessage.offer_product_id) {
          await sendOfferProduct(botToken, customer.telegram_id, nextMessage.offer_product, nextMessage.offer_message);
        }

        // Update customer
        await supabase
          .from("telegram_customers")
          .update({
            recovery_messages_sent: messagesSent + 1,
            last_recovery_sent_at: now.toISOString(),
          })
          .eq("id", customer.id);

        stats.customersProcessed++;
      }
    }
  }

  return stats;
}

// =============================================================================
// MAIN SERVER
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cart recovery check...");

    // Get all active bots with cart recovery enabled for their clients
    const { data: clientSettings, error: settingsError } = await supabase
      .from("client_settings")
      .select("client_id")
      .eq("cart_reminder_enabled", true);

    if (settingsError) {
      console.error("Error fetching client settings:", settingsError);
      throw settingsError;
    }

    const enabledClientIds = (clientSettings || []).map((s: any) => s.client_id);

    if (enabledClientIds.length === 0) {
      console.log("No clients with cart recovery enabled");
      return new Response(
        JSON.stringify({ success: true, message: "No clients with cart recovery enabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all active bots for these clients
    const { data: activeBots, error: botsError } = await supabase
      .from("client_bots")
      .select("id, client_id, telegram_bot_token, is_active")
      .in("client_id", enabledClientIds)
      .eq("is_active", true)
      .not("telegram_bot_token", "is", null);

    if (botsError) {
      console.error("Error fetching bots:", botsError);
      throw botsError;
    }

    const bots = (activeBots || []) as BotWithClient[];
    console.log(`Found ${bots.length} active bots for cart recovery`);

    // Process bots in parallel batches (max 5 concurrent)
    const BATCH_SIZE = 5;
    const results = { totalOrders: 0, totalCustomers: 0 };

    for (let i = 0; i < bots.length; i += BATCH_SIZE) {
      const batch = bots.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(bot =>
          processBot(supabase, bot).catch(error => {
            console.error(`Error processing bot ${bot.id}:`, error);
            return { ordersProcessed: 0, customersProcessed: 0 };
          })
        )
      );

      for (const result of batchResults) {
        results.totalOrders += result.ordersProcessed;
        results.totalCustomers += result.customersProcessed;
      }
    }

    console.log(`Cart recovery complete. Orders: ${results.totalOrders}, Customers: ${results.totalCustomers}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cart recovery check completed",
        stats: {
          botsProcessed: bots.length,
          ordersRecovered: results.totalOrders,
          customersRecovered: results.totalCustomers,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cart recovery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
