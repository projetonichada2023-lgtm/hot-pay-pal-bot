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
  return res.json();
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

// Create a unique invite link for a Telegram group/channel
async function createGroupInviteLink(botToken: string, chatId: string, userId: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        member_limit: 1, // Only 1 use allowed
        expire_date: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
        creates_join_request: false,
      }),
    });
    
    const data = await res.json();
    console.log('Create invite link response:', JSON.stringify(data));
    
    if (data.ok && data.result?.invite_link) {
      return data.result.invite_link;
    }
    return null;
  } catch (error) {
    console.error('Error creating invite link:', error);
    return null;
  }
}

// =============== DATABASE HELPERS ===============

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

async function getProduct(productId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();
  
  return data;
}

async function createOrder(clientId: string, customerId: string, productId: string, amount: number) {
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

      // Ensure customer exists
      await getOrCreateCustomer(clientId, telegramUser);

      // Handle /start command
      if (text.startsWith('/start')) {
        const welcomeMessage = await getClientMessage(clientId, 'welcome');
        await sendTelegramMessage(botToken, chatId, welcomeMessage || '👋 Bem-vindo! Use o botão abaixo para ver nossos produtos.', {
          inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]]
        });
      }

      // Handle /produtos command
      if (text.startsWith('/produtos')) {
        await handleShowProducts(botToken, chatId, clientId);
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
        await handleShowProducts(botToken, chatId, clientId);
      }

      // Show single product details
      if (data.startsWith('product_')) {
        const productId = data.replace('product_', '');
        await handleShowProduct(botToken, chatId, clientId, productId);
      }

      // Buy product - create order
      if (data.startsWith('buy_')) {
        const productId = data.replace('buy_', '');
        await handleBuyProduct(botToken, chatId, clientId, customer.id, productId);
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

async function handleShowProducts(botToken: string, chatId: number, clientId: string) {
  const products = await getProducts(clientId);
  
  if (products.length === 0) {
    const noProductsMessage = await getClientMessage(clientId, 'no_products');
    await sendTelegramMessage(botToken, chatId, noProductsMessage || '😕 Nenhum produto disponível no momento.', {
      inline_keyboard: [[{ text: '🔙 Voltar ao Menu', callback_data: 'menu' }]]
    });
    return;
  }

  // Send products as inline buttons
  const keyboard = products.map(product => [{
    text: `${product.is_hot ? '🔥 ' : ''}${product.name} - ${formatPrice(Number(product.price))}`,
    callback_data: `product_${product.id}`
  }]);
  
  keyboard.push([{ text: '🔙 Voltar ao Menu', callback_data: 'menu' }]);

  await sendTelegramMessage(
    botToken, 
    chatId, 
    '🛍️ <b>Nossos Produtos</b>\n\nEscolha um produto para ver mais detalhes:', 
    { inline_keyboard: keyboard }
  );
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

async function handleBuyProduct(botToken: string, chatId: number, clientId: string, customerId: string, productId: string) {
  const product = await getProduct(productId);
  
  if (!product) {
    await sendTelegramMessage(botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  // Create order
  const order = await createOrder(clientId, customerId, productId, Number(product.price));
  
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
    console.log('Creating invite link for group:', product.telegram_group_id, 'user:', telegramUserId);
    const inviteLink = await createGroupInviteLink(botToken, product.telegram_group_id, telegramUserId);
    
    if (inviteLink) {
      deliveryMessages.push(`👥 <b>Acesso ao Grupo VIP:</b>\n${inviteLink}\n\n⚠️ <i>Este link é único e expira em 24 horas!</i>`);
    } else {
      deliveryMessages.push(`👥 <b>Grupo VIP:</b> Houve um problema ao gerar seu convite. Entre em contato com o suporte.`);
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
