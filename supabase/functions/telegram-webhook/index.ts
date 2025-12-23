import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// =============== TELEGRAM HELPERS ===============

async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: object) {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data?.ok) {
    console.error('Telegram sendMessage failed:', JSON.stringify(data));
  }
  return data;
}

async function sendTelegramPhoto(botToken: string, chatId: number, photoUrl: string, caption: string, replyMarkup?: object) {
  const body: any = { chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

async function editMessageText(botToken: string, chatId: number, messageId: number, text: string, replyMarkup?: object) {
  const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  const res = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Add user directly to a Telegram group/channel
async function addUserToGroup(botToken: string, groupId: string, userId: number): Promise<boolean> {
  try {
    console.log('Adding user to group:', groupId, 'user:', userId);
    
    // First, unban the user to ensure they can be added (in case they were removed before)
    await fetch(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        user_id: userId,
        only_if_banned: true,
      }),
    });
    
    // Now add the user to the group
    const res = await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        user_id: userId,
      }),
    });
    
    const approveData = await res.json();
    console.log('Approve join request response:', JSON.stringify(approveData));
    
    // If approve didn't work, try creating an invite link as fallback
    // This is because approveChatJoinRequest only works if user requested to join
    if (!approveData.ok) {
      // Use createChatInviteLink with member_limit 1 as fallback
      const inviteRes = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          member_limit: 1,
          expire_date: Math.floor(Date.now() / 1000) + 300, // 5 minutes only
          creates_join_request: false,
        }),
      });
      
      const inviteData = await inviteRes.json();
      console.log('Created limited invite link:', JSON.stringify(inviteData));
      
      if (inviteData.ok && inviteData.result?.invite_link) {
        return inviteData.result.invite_link;
      }
    }
    
    return approveData.ok;
  } catch (error) {
    console.error('Error adding user to group:', error);
    return false;
  }
}

// =============== DATABASE HELPERS ===============

async function saveMessage(
  clientId: string, 
  chatId: number, 
  customerId: string | null, 
  direction: 'incoming' | 'outgoing', 
  content: string | null,
  messageId?: number
) {
  try {
    await supabase.from('telegram_messages').insert({
      client_id: clientId,
      telegram_chat_id: chatId,
      customer_id: customerId,
      direction,
      message_content: content,
      telegram_message_id: messageId || null,
    });
  } catch (e) {
    console.error('Failed to save message:', e);
  }
}

async function getClientMessage(clientId: string, messageType: string): Promise<string> {
  const { data } = await supabase
    .from('bot_messages')
    .select('message_content')
    .eq('client_id', clientId)
    .eq('message_type', messageType)
    .eq('is_active', true)
    .maybeSingle();
  
  return data?.message_content || '';
}

async function getOrCreateCustomer(clientId: string, telegramUser: any) {
  const { data: existing } = await supabase
    .from('telegram_customers')
    .select('*')
    .eq('client_id', clientId)
    .eq('telegram_id', telegramUser.id)
    .maybeSingle();

  if (existing) return existing;

  const { data: newCustomer } = await supabase
    .from('telegram_customers')
    .insert({
      client_id: clientId,
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
    })
    .select()
    .single();

  return newCustomer;
}

async function getProducts(clientId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('is_hot', { ascending: false })
    .order('created_at', { ascending: false });
  
  return data || [];
}

async function getClientSettings(clientId: string) {
  const { data } = await supabase
    .from('client_settings')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();
  
  return data;
}

async function getProductUpsells(productId: string) {
  const { data } = await supabase
    .from('product_upsells')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  return data || [];
}

async function getProduct(productId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();
  
  return data;
}

interface CreateOrderOptions {
  isUpsell?: boolean;
  isDownsell?: boolean;
  parentOrderId?: string;
}

async function createOrder(clientId: string, customerId: string, productId: string, amount: number, options: CreateOrderOptions = {}) {
  // Generate a fake PIX code for demo purposes
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}5204000053039865406${amount.toFixed(2)}5802BR5913LOJA DIGITAL6009SAO PAULO62070503***6304`;
  
  const { data: order } = await supabase
    .from('orders')
    .insert({
      client_id: clientId,
      customer_id: customerId,
      product_id: productId,
      amount,
      status: 'pending',
      payment_method: 'pix',
      pix_code: pixCode,
      is_upsell: options.isUpsell || false,
      is_downsell: options.isDownsell || false,
      parent_order_id: options.parentOrderId || null,
    })
    .select()
    .single();

  return order;
}

async function getOrder(orderId: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', orderId)
    .maybeSingle();
  
  return data;
}

async function updateOrderStatus(orderId: string, status: string, extra: any = {}) {
  await supabase
    .from('orders')
    .update({ status, ...extra })
    .eq('id', orderId);
}

async function incrementProductViews(productId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('views_count')
    .eq('id', productId)
    .single();
  
  await supabase
    .from('products')
    .update({ views_count: (product?.views_count || 0) + 1 })
    .eq('id', productId);
}

async function incrementProductSales(productId: string) {
  const { data: product } = await supabase
    .from('products')
    .select('sales_count')
    .eq('id', productId)
    .single();
  
  await supabase
    .from('products')
    .update({ sales_count: (product?.sales_count || 0) + 1 })
    .eq('id', productId);
}

// =============== FORMAT HELPERS ===============

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

function uuidToB64(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function b64ToUuid(b64url: string): string {
  const padded = b64url.length % 4 === 0 ? b64url : b64url + '='.repeat(4 - (b64url.length % 4));
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// =============== MAIN HANDLER ===============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('client_id');
    
    if (!clientId) {
      throw new Error('Missing client_id');
    }

    // Get client info
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!client || !client.telegram_bot_token) {
      throw new Error('Client not found or bot not configured');
    }

    const update = await req.json();
    console.log('Webhook for client:', clientId, JSON.stringify(update));

    const botToken = client.telegram_bot_token;

    // =============== HANDLE MESSAGES ===============
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const telegramUser = update.message.from;
      const messageId = update.message.message_id;

      // Ensure customer exists
      const customer = await getOrCreateCustomer(clientId, telegramUser);

      // Save incoming message
      await saveMessage(clientId, chatId, customer?.id || null, 'incoming', text, messageId);

      // Handle /start command
      if (text.startsWith('/start')) {
        const welcomeMessage = await getClientMessage(clientId, 'welcome');
        const msgText = welcomeMessage || '👋 Bem-vindo! Use o botão abaixo para ver nossos produtos.';
        const sent = await sendTelegramMessage(botToken, chatId, msgText, {
          inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]]
        });
        if (sent?.result?.message_id) {
          await saveMessage(clientId, chatId, customer?.id || null, 'outgoing', msgText, sent.result.message_id);
        }
      }

      // Handle /produtos command
      if (text.startsWith('/produtos')) {
        await handleShowProducts(botToken, chatId, clientId, customer?.id || null);
      }
    }

    // =============== HANDLE CALLBACKS ===============
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const data = callbackQuery.data;
      const telegramUser = callbackQuery.from;

      // Answer callback to remove loading state
      await answerCallbackQuery(botToken, callbackQuery.id);

      // Ensure customer exists
      const customer = await getOrCreateCustomer(clientId, telegramUser);

      // Show products list
      if (data === 'products') {
        await handleShowProducts(botToken, chatId, clientId, customer?.id || null);
      }

      // Show single product details
      if (data.startsWith('product_')) {
        const productId = data.replace('product_', '');
        await handleShowProduct(botToken, chatId, clientId, productId);
      }

      // Buy upsell/downsell using compact callback_data (Telegram limit is 64 bytes)
      // Format: buyu_PRODUCTB64_PARENTB64_UPSELLINDEX
      if (data.startsWith('buyu_') || data.startsWith('buyd_')) {
        try {
          const parts = data.split('_');
          const prefix = parts[0];
          const productB64 = parts[1];
          const parentB64 = parts[2];
          const upsellIndex = parts[3] ? parseInt(parts[3]) : 0;
          
          const productId = b64ToUuid(productB64);
          const parentOrderId = b64ToUuid(parentB64);

          await handleBuyProduct(botToken, chatId, clientId, customer.id, productId, {
            isUpsell: prefix === 'buyu',
            isDownsell: prefix === 'buyd',
            parentOrderId,
            upsellIndex,
          });
        } catch (e) {
          console.error('Invalid buyu/buyd callback:', data, e);
          await sendTelegramMessage(botToken, chatId, '⚠️ Oferta expirada ou inválida.', {
            inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]],
          });
        }
      }

      // Buy product - create order (format: buy_PRODUCTID or buy_PRODUCTID_upsell_PARENTORDERID or buy_PRODUCTID_downsell_PARENTORDERID)
      if (data.startsWith('buy_')) {
        const parts = data.split('_');
        const productId = parts[1];
        let isUpsell = false;
        let isDownsell = false;
        let parentOrderId: string | undefined;
        
        if (parts.length >= 4) {
          if (parts[2] === 'upsell') {
            isUpsell = true;
            parentOrderId = parts[3];
          } else if (parts[2] === 'downsell') {
            isDownsell = true;
            parentOrderId = parts[3];
          }
        }
        
        await handleBuyProduct(botToken, chatId, clientId, customer.id, productId, { isUpsell, isDownsell, parentOrderId });
      }
      // Confirm payment (demo mode)
      if (data.startsWith('paid_')) {
        const orderId = data.replace('paid_', '');
        await handlePaymentConfirmed(botToken, chatId, clientId, orderId, telegramUser.id);
      }

      // Cancel order
      if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '');
        await handleCancelOrder(botToken, chatId, clientId, orderId, messageId);
      }

      // Decline upsell - show next upsell or downsell (compact format: declu_PARENTB64_INDEX)
      if (data.startsWith('declu_')) {
        try {
          const parts = data.replace('declu_', '').split('_');
          const parentOrderId = b64ToUuid(parts[0]);
          const currentIndex = parts[1] ? parseInt(parts[1]) : 0;
          await handleDeclineUpsellFromOrder(botToken, chatId, clientId, parentOrderId, currentIndex);
        } catch (e) {
          console.error('Invalid declu callback:', data, e);
        }
      }

      // Decline upsell - show downsell (legacy format: decline_upsell_PRODUCTID_PARENTORDERID)
      if (data.startsWith('decline_upsell_')) {
        const parts = data.replace('decline_upsell_', '').split('_');
        const productId = parts[0];
        const parentOrderId = parts[1];
        await handleDeclineUpsell(botToken, chatId, clientId, productId, parentOrderId);
      }

      // Back to menu
      if (data === 'menu') {
        const welcomeMessage = await getClientMessage(clientId, 'welcome');
        await editMessageText(botToken, chatId, messageId, welcomeMessage || '👋 O que deseja fazer?', {
          inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]]
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error processing' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// =============== HANDLER FUNCTIONS ===============

async function handleShowProducts(botToken: string, chatId: number, clientId: string, customerId?: string | null) {
  const products = await getProducts(clientId);
  
  if (products.length === 0) {
    const noProductsMessage = await getClientMessage(clientId, 'no_products');
    const msgText = noProductsMessage || '😕 Nenhum produto disponível no momento.';
    const sent = await sendTelegramMessage(botToken, chatId, msgText, {
      inline_keyboard: [[{ text: '🔙 Voltar ao Menu', callback_data: 'menu' }]]
    });
    if (sent?.result?.message_id && customerId) {
      await saveMessage(clientId, chatId, customerId, 'outgoing', msgText, sent.result.message_id);
    }
    return;
  }

  // Send products as inline buttons
  const keyboard = products.map(product => [{
    text: `${product.is_hot ? '🔥 ' : ''}${product.name} - ${formatPrice(Number(product.price))}`,
    callback_data: `product_${product.id}`
  }]);
  
  keyboard.push([{ text: '🔙 Voltar ao Menu', callback_data: 'menu' }]);

  const msgText = '🛍️ <b>Nossos Produtos</b>\n\nEscolha um produto para ver mais detalhes:';
  const sent = await sendTelegramMessage(
    botToken, 
    chatId, 
    msgText, 
    { inline_keyboard: keyboard }
  );
  if (sent?.result?.message_id && customerId) {
    await saveMessage(clientId, chatId, customerId, 'outgoing', msgText, sent.result.message_id);
  }
}

async function handleShowProduct(botToken: string, chatId: number, clientId: string, productId: string) {
  const product = await getProduct(productId);
  
  if (!product) {
    await sendTelegramMessage(botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  // Increment views
  await incrementProductViews(productId);

  const description = product.description || 'Sem descrição';
  const caption = `${product.is_hot ? '🔥 <b>DESTAQUE</b>\n\n' : ''}<b>${product.name}</b>\n\n${description}\n\n💰 <b>Preço: ${formatPrice(Number(product.price))}</b>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }],
      [{ text: '🔙 Ver Outros Produtos', callback_data: 'products' }]
    ]
  };

  if (product.image_url) {
    await sendTelegramPhoto(botToken, chatId, product.image_url, caption, keyboard);
  } else {
    await sendTelegramMessage(botToken, chatId, caption, keyboard);
  }
}

interface BuyOptions extends CreateOrderOptions {
  upsellIndex?: number;
}

async function handleBuyProduct(botToken: string, chatId: number, clientId: string, customerId: string, productId: string, options: BuyOptions = {}) {
  const product = await getProduct(productId);
  
  if (!product) {
    await sendTelegramMessage(botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  // Create order with upsell/downsell tracking
  const order = await createOrder(clientId, customerId, productId, Number(product.price), options);
  
  if (!order) {
    await sendTelegramMessage(botToken, chatId, '❌ Erro ao criar pedido. Tente novamente.');
    return;
  }

  const orderCreatedMessage = await getClientMessage(clientId, 'order_created');
  const paymentInstructions = await getClientMessage(clientId, 'payment_instructions');

  const message = `${orderCreatedMessage || '🛒 Pedido criado com sucesso!'}\n\n` +
    `<b>Produto:</b> ${product.name}\n` +
    `<b>Valor:</b> ${formatPrice(Number(product.price))}\n\n` +
    `${paymentInstructions || '📱 Escaneie o QR Code ou copie o código PIX abaixo:'}\n\n` +
    `<code>${order.pix_code}</code>\n\n` +
    `⏰ <i>Você tem 15 minutos para efetuar o pagamento.</i>`;

  await sendTelegramMessage(botToken, chatId, message, {
    inline_keyboard: [
      [{ text: '✅ Já Paguei', callback_data: `paid_${order.id}` }],
      [{ text: '❌ Cancelar Pedido', callback_data: `cancel_${order.id}` }]
    ]
  });
}

async function handlePaymentConfirmed(botToken: string, chatId: number, clientId: string, orderId: string, telegramUserId: number) {
  const order = await getOrder(orderId);
  
  if (!order) {
    await sendTelegramMessage(botToken, chatId, '❌ Pedido não encontrado.');
    return;
  }

  if (order.status !== 'pending') {
    await sendTelegramMessage(botToken, chatId, '⚠️ Este pedido já foi processado.');
    return;
  }

  // Update order to paid
  await updateOrderStatus(orderId, 'paid', { paid_at: new Date().toISOString() });

  const paymentSuccessMessage = await getClientMessage(clientId, 'payment_success');
  await sendTelegramMessage(botToken, chatId, paymentSuccessMessage || '✅ Pagamento confirmado!');

  // Auto-deliver the product
  const product = order.products as any;
  
  let deliveryMessages: string[] = [];
  
  // Check for file URL delivery
  if (product?.file_url) {
    deliveryMessages.push(`🔗 <b>Link de acesso:</b>\n${product.file_url}`);
  }
  
  // Check for VIP group access
  if (product?.telegram_group_id) {
    console.log('Adding user to VIP group:', product.telegram_group_id, 'user:', telegramUserId);
    const result = await addUserToGroup(botToken, product.telegram_group_id, telegramUserId);
    
    if (typeof result === 'string') {
      // Got an invite link as fallback (expires in 5 min, 1 use only)
      deliveryMessages.push(`👥 <b>Acesso ao Grupo VIP:</b>\n${result}\n\n⚠️ <i>Link único! Expira em 5 minutos. Use agora!</i>`);
    } else if (result === true) {
      deliveryMessages.push(`👥 <b>Grupo VIP:</b> Você foi adicionado ao grupo automaticamente! Verifique sua lista de chats.`);
    } else {
      deliveryMessages.push(`👥 <b>Grupo VIP:</b> Houve um problema ao te adicionar. Entre em contato com o suporte.`);
    }
  }
  
  if (deliveryMessages.length > 0) {
    await updateOrderStatus(orderId, 'delivered', { delivered_at: new Date().toISOString() });
    await incrementProductSales(product.id);
    
    const deliveredMessage = await getClientMessage(clientId, 'product_delivered');
    
    await sendTelegramMessage(
      botToken, 
      chatId, 
      `${deliveredMessage || '📦 Produto entregue!'}\n\n${deliveryMessages.join('\n\n')}`,
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
  } else {
    await sendTelegramMessage(
      botToken, 
      chatId, 
      '📦 Seu produto será entregue em breve pelo vendedor.',
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
  }
  
  // Check for upsells - start with index 0
  await handleUpsell(botToken, chatId, clientId, product.id, product, orderId, 0);
}

async function handleCancelOrder(botToken: string, chatId: number, clientId: string, orderId: string, messageId: number) {
  const order = await getOrder(orderId);
  
  if (!order) {
    await sendTelegramMessage(botToken, chatId, '❌ Pedido não encontrado.');
    return;
  }

  if (order.status !== 'pending') {
    await sendTelegramMessage(botToken, chatId, '⚠️ Este pedido já foi processado e não pode ser cancelado.');
    return;
  }

  await updateOrderStatus(orderId, 'cancelled');

  const cancelledMessage = await getClientMessage(clientId, 'order_cancelled');
  await editMessageText(botToken, chatId, messageId, cancelledMessage || '❌ Pedido cancelado.', {
    inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]]
  });
}

async function handleUpsell(botToken: string, chatId: number, clientId: string, purchasedProductId: string, purchasedProduct: any, parentOrderId: string, upsellIndex: number) {
  // First check the new product_upsells table
  const productUpsells = await getProductUpsells(purchasedProductId);
  
  if (productUpsells.length > 0) {
    // Use new multi-upsell system
    if (upsellIndex >= productUpsells.length) {
      // No more upsells, check for downsell
      await handleShowDownsell(botToken, chatId, clientId, purchasedProductId, parentOrderId);
      return;
    }
    
    const currentUpsell = productUpsells[upsellIndex];
    const upsellProduct = await getProduct(currentUpsell.upsell_product_id);
    
    if (!upsellProduct || !upsellProduct.is_active) {
      // Skip to next upsell
      await handleUpsell(botToken, chatId, clientId, purchasedProductId, purchasedProduct, parentOrderId, upsellIndex + 1);
      return;
    }
    
    // Use custom upsell message from the upsell config, or fallback to client message, or default
    let upsellMessage = currentUpsell.upsell_message;
    if (!upsellMessage) {
      upsellMessage = await getClientMessage(clientId, 'upsell');
    }
    if (!upsellMessage) {
      upsellMessage = '🔥 <b>Oferta Especial!</b>\n\nQue tal aproveitar e levar mais um produto?';
    }
    
    const keyboard = [
      [{
        text: `✅ ${upsellProduct.is_hot ? '🔥 ' : ''}${upsellProduct.name} - ${formatPrice(Number(upsellProduct.price))}`,
        callback_data: `buyu_${uuidToB64(upsellProduct.id)}_${uuidToB64(parentOrderId)}_${upsellIndex}`,
      }],
      [{ text: '❌ Não, obrigado', callback_data: `declu_${uuidToB64(parentOrderId)}_${upsellIndex}` }],
    ];

    await sendTelegramMessage(
      botToken,
      chatId,
      upsellMessage,
      { inline_keyboard: keyboard }
    );
    return;
  }
  
  // Fallback to legacy single upsell system (product.upsell_product_id)
  const upsellProductId = purchasedProduct?.upsell_product_id;
  if (!upsellProductId) return;

  const upsellProduct = await getProduct(upsellProductId);
  if (!upsellProduct || !upsellProduct.is_active) return;

  // Use custom upsell message from the product, or fallback to client message, or default
  let upsellMessage = purchasedProduct?.upsell_message;
  if (!upsellMessage) {
    upsellMessage = await getClientMessage(clientId, 'upsell');
  }
  if (!upsellMessage) {
    upsellMessage = '🔥 <b>Oferta Especial!</b>\n\nQue tal aproveitar e levar mais um produto?';
  }

  const keyboard = [
    [{
      text: `✅ ${upsellProduct.is_hot ? '🔥 ' : ''}${upsellProduct.name} - ${formatPrice(Number(upsellProduct.price))}`,
      callback_data: `buyu_${uuidToB64(upsellProduct.id)}_${uuidToB64(parentOrderId)}`,
    }],
    [{ text: '❌ Não, obrigado', callback_data: `declu_${uuidToB64(parentOrderId)}` }],
  ];

  await sendTelegramMessage(
    botToken,
    chatId,
    upsellMessage,
    { inline_keyboard: keyboard }
  );
}

async function handleShowDownsell(botToken: string, chatId: number, clientId: string, purchasedProductId: string, parentOrderId: string) {
  const purchasedProduct = await getProduct(purchasedProductId);
  
  if (!purchasedProduct?.downsell_product_id) {
    // No downsell configured, just show thank you message
    await sendTelegramMessage(
      botToken,
      chatId,
      '👍 Tudo bem! Obrigado pela sua compra.',
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
    return;
  }
  
  const downsellProduct = await getProduct(purchasedProduct.downsell_product_id);
  
  if (!downsellProduct || !downsellProduct.is_active) {
    await sendTelegramMessage(
      botToken,
      chatId,
      '👍 Tudo bem! Obrigado pela sua compra.',
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
    return;
  }
  
  // Use custom downsell message from the product, or default
  const description = downsellProduct.description || 'Sem descrição';
  let downsellMessage = (purchasedProduct as any)?.downsell_message;
  if (!downsellMessage) {
    downsellMessage = `💰 <b>Última Oferta!</b>\n\nQue tal este produto com um preço especial?\n\n${downsellProduct.is_hot ? '🔥 ' : ''}<b>${downsellProduct.name}</b>\n\n${description}\n\n💰 <b>Apenas ${formatPrice(Number(downsellProduct.price))}</b>`;
  } else {
    // Append product info to custom message
    downsellMessage = `${downsellMessage}\n\n${downsellProduct.is_hot ? '🔥 ' : ''}<b>${downsellProduct.name}</b>\n\n${description}\n\n💰 <b>Apenas ${formatPrice(Number(downsellProduct.price))}</b>`;
  }
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Quero esse!', callback_data: `buyd_${uuidToB64(downsellProduct.id)}_${uuidToB64(parentOrderId)}` }],
      [{ text: '❌ Não, obrigado', callback_data: 'menu' }]
    ]
  };
  
  if (downsellProduct.image_url) {
    await sendTelegramPhoto(botToken, chatId, downsellProduct.image_url, downsellMessage, keyboard);
  } else {
    await sendTelegramMessage(botToken, chatId, downsellMessage, keyboard);
  }
}

async function handleDeclineUpsellFromOrder(botToken: string, chatId: number, clientId: string, parentOrderId: string, currentIndex: number = 0) {
  const parentOrder = await getOrder(parentOrderId);

  if (!parentOrder?.product_id) {
    await sendTelegramMessage(botToken, chatId, '⚠️ Oferta expirada. Volte aos produtos.', {
      inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]],
    });
    return;
  }

  // Check for more upsells in the new system
  const productUpsells = await getProductUpsells(parentOrder.product_id);
  
  if (productUpsells.length > 0) {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < productUpsells.length) {
      // Show next upsell
      const purchasedProduct = await getProduct(parentOrder.product_id);
      await handleUpsell(botToken, chatId, clientId, parentOrder.product_id, purchasedProduct, parentOrderId, nextIndex);
      return;
    }
    
    // No more upsells, show downsell
    await handleShowDownsell(botToken, chatId, clientId, parentOrder.product_id, parentOrderId);
    return;
  }

  // Fallback to legacy system
  await handleDeclineUpsell(botToken, chatId, clientId, parentOrder.product_id, parentOrderId);
}

async function handleDeclineUpsell(botToken: string, chatId: number, clientId: string, purchasedProductId: string, parentOrderId?: string) {
  // Get the purchased product to check for downsell
  const purchasedProduct = await getProduct(purchasedProductId);
  
  if (!purchasedProduct?.downsell_product_id) {
    // No downsell configured, just show menu
    await sendTelegramMessage(
      botToken,
      chatId,
      '👍 Tudo bem! Obrigado pela sua compra.',
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
    return;
  }
  
  // Get the downsell product
  const downsellProduct = await getProduct(purchasedProduct.downsell_product_id);
  
  if (!downsellProduct || !downsellProduct.is_active) {
    await sendTelegramMessage(
      botToken,
      chatId,
      '👍 Tudo bem! Obrigado pela sua compra.',
      { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
    );
    return;
  }
  
  // Use custom downsell message from the product, or default
  const description = downsellProduct.description || 'Sem descrição';
  let downsellMessage = (purchasedProduct as any)?.downsell_message;
  if (!downsellMessage) {
    downsellMessage = `💰 <b>Última Oferta!</b>\n\nQue tal este produto com um preço especial?\n\n${downsellProduct.is_hot ? '🔥 ' : ''}<b>${downsellProduct.name}</b>\n\n${description}\n\n💰 <b>Apenas ${formatPrice(Number(downsellProduct.price))}</b>`;
  } else {
    // Append product info to custom message
    downsellMessage = `${downsellMessage}\n\n${downsellProduct.is_hot ? '🔥 ' : ''}<b>${downsellProduct.name}</b>\n\n${description}\n\n💰 <b>Apenas ${formatPrice(Number(downsellProduct.price))}</b>`;
  }
  
  // Show downsell offer - include parent order id for tracking
  const buyDownsellCallback = parentOrderId
    ? `buyd_${uuidToB64(downsellProduct.id)}_${uuidToB64(parentOrderId)}`
    : `buy_${downsellProduct.id}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Quero esse!', callback_data: buyDownsellCallback }],
      [{ text: '❌ Não, obrigado', callback_data: 'menu' }]
    ]
  };
  
  if (downsellProduct.image_url) {
    await sendTelegramPhoto(botToken, chatId, downsellProduct.image_url, downsellMessage, keyboard);
  } else {
    await sendTelegramMessage(botToken, chatId, downsellMessage, keyboard);
  }
}
