import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || 'BOT_TOKEN_FICTICIO';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// EFI/Gerencianet credentials (fictitious for now)
const EFI_CLIENT_ID = Deno.env.get('EFI_CLIENT_ID') || 'Client_Id_ficticio_12345';
const EFI_CLIENT_SECRET = Deno.env.get('EFI_CLIENT_SECRET') || 'Client_Secret_ficticio_67890';
const EFI_PIX_KEY = Deno.env.get('EFI_PIX_KEY') || 'chave-pix-ficticia@email.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Telegram API helper
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const result = await response.json();
  console.log('Telegram sendMessage response:', result);
  return result;
}

async function sendTelegramPhoto(chatId: number, photoUrl: string, caption: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const body: any = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return response.json();
}

// Get or create customer
async function getOrCreateCustomer(telegramUser: any) {
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('telegram_id', telegramUser.id)
    .single();

  if (existing) return existing;

  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }
  
  return newCustomer;
}

// Get bot settings
async function getBotSettings() {
  const { data } = await supabase
    .from('bot_settings')
    .select('*')
    .limit(1)
    .single();
  
  return data || {
    welcome_message: 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.',
    payment_instructions: 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.',
    success_message: '✅ Pagamento confirmado! Seu produto será entregue em instantes.',
    auto_delivery: true,
  };
}

// Get products
async function getProducts() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  return data || [];
}

// Get product by ID
async function getProduct(productId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  return data;
}

// Generate PIX (mock for now - will be replaced with real EFI API)
async function generatePix(amount: number, orderId: string) {
  console.log('Generating PIX with EFI credentials:', { EFI_CLIENT_ID, EFI_PIX_KEY });
  
  // Mock PIX data - replace with real EFI API integration
  const pixCode = `00020126580014br.gov.bcb.pix0136${EFI_PIX_KEY}5204000053039865404${amount.toFixed(2)}5802BR5913LOJA DIGITAL6008BRASILIA62070503***6304`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
  
  return {
    pixCode,
    qrCodeUrl,
    paymentId: `PIX_${orderId}_${Date.now()}`,
  };
}

// Create order
async function createOrder(customerId: string, productId: string, amount: number) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      product_id: productId,
      amount,
      status: 'pending',
      payment_method: 'pix',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  // Generate PIX
  const pix = await generatePix(amount, order.id);
  
  // Update order with PIX data
  await supabase
    .from('orders')
    .update({
      pix_code: pix.pixCode,
      pix_qrcode: pix.qrCodeUrl,
      payment_id: pix.paymentId,
    })
    .eq('id', order.id);

  return { ...order, ...pix };
}

// Handle /start command
async function handleStart(chatId: number, telegramUser: any) {
  await getOrCreateCustomer(telegramUser);
  const settings = await getBotSettings();
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛍️ Ver Produtos', callback_data: 'products' }],
      [{ text: '📦 Meus Pedidos', callback_data: 'my_orders' }],
      [{ text: '❓ Ajuda', callback_data: 'help' }],
    ],
  };
  
  await sendTelegramMessage(chatId, settings.welcome_message, keyboard);
}

// Handle /produtos command
async function handleProducts(chatId: number) {
  const products = await getProducts();
  
  if (products.length === 0) {
    await sendTelegramMessage(chatId, '😕 Nenhum produto disponível no momento.');
    return;
  }
  
  for (const product of products) {
    const price = Number(product.price).toFixed(2);
    const caption = `<b>${product.name}</b>\n\n${product.description || ''}\n\n💰 <b>R$ ${price}</b>${product.is_hot ? '\n\n🔥 PRODUTO EM DESTAQUE!' : ''}`;
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }],
      ],
    };
    
    if (product.image_url) {
      await sendTelegramPhoto(chatId, product.image_url, caption, keyboard);
    } else {
      await sendTelegramMessage(chatId, caption, keyboard);
    }
  }
}

// Handle buy action
async function handleBuy(chatId: number, productId: string, telegramUser: any) {
  const customer = await getOrCreateCustomer(telegramUser);
  if (!customer) {
    await sendTelegramMessage(chatId, '❌ Erro ao processar. Tente novamente.');
    return;
  }
  
  const product = await getProduct(productId);
  if (!product) {
    await sendTelegramMessage(chatId, '❌ Produto não encontrado.');
    return;
  }
  
  // Increment views
  await supabase
    .from('products')
    .update({ views_count: (product.views_count || 0) + 1 })
    .eq('id', productId);
  
  const order = await createOrder(customer.id, productId, Number(product.price));
  if (!order) {
    await sendTelegramMessage(chatId, '❌ Erro ao criar pedido. Tente novamente.');
    return;
  }
  
  const settings = await getBotSettings();
  
  const message = `🛒 <b>Pedido Criado!</b>\n\n` +
    `📦 Produto: <b>${product.name}</b>\n` +
    `💰 Valor: <b>R$ ${Number(product.price).toFixed(2)}</b>\n\n` +
    `${settings.payment_instructions}\n\n` +
    `📋 <b>Código PIX (Copia e Cola):</b>\n<code>${order.pixCode}</code>`;
  
  // Send QR Code
  await sendTelegramPhoto(chatId, order.qrCodeUrl, message, {
    inline_keyboard: [
      [{ text: '✅ Já Paguei', callback_data: `paid_${order.id}` }],
      [{ text: '❌ Cancelar', callback_data: `cancel_${order.id}` }],
    ],
  });
}

// Handle payment confirmation (mock - in production would verify with EFI API)
async function handlePaidConfirmation(chatId: number, orderId: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', orderId)
    .single();
  
  if (!order) {
    await sendTelegramMessage(chatId, '❌ Pedido não encontrado.');
    return;
  }
  
  // In production, here we would verify with EFI API if payment was received
  // For now, we'll simulate automatic confirmation
  
  const settings = await getBotSettings();
  
  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  
  await sendTelegramMessage(chatId, settings.success_message);
  
  // Auto delivery if enabled
  if (settings.auto_delivery && order.products?.file_url) {
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
    
    await sendTelegramMessage(
      chatId,
      `📦 <b>Entrega Automática</b>\n\n🔗 Acesse seu produto:\n${order.products.file_url}`
    );
  }
}

// Handle order cancellation
async function handleCancel(chatId: number, orderId: string) {
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  
  await sendTelegramMessage(chatId, '❌ Pedido cancelado.');
}

// Handle my orders
async function handleMyOrders(chatId: number, telegramUser: any) {
  const customer = await getOrCreateCustomer(telegramUser);
  if (!customer) {
    await sendTelegramMessage(chatId, '❌ Erro ao buscar pedidos.');
    return;
  }
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(name)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (!orders || orders.length === 0) {
    await sendTelegramMessage(chatId, '📭 Você ainda não tem pedidos.');
    return;
  }
  
  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    paid: '✅',
    delivered: '📦',
    cancelled: '❌',
  };
  
  let message = '📋 <b>Seus Últimos Pedidos:</b>\n\n';
  for (const order of orders) {
    const emoji = statusEmoji[order.status] || '❓';
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');
    message += `${emoji} ${order.products?.name || 'Produto'} - R$ ${Number(order.amount).toFixed(2)} (${date})\n`;
  }
  
  await sendTelegramMessage(chatId, message);
}

// Handle help
async function handleHelp(chatId: number) {
  const message = `❓ <b>Ajuda</b>\n\n` +
    `<b>Comandos disponíveis:</b>\n` +
    `/start - Iniciar bot\n` +
    `/produtos - Ver catálogo\n` +
    `/pedidos - Ver meus pedidos\n` +
    `/ajuda - Esta mensagem\n\n` +
    `<b>Como comprar:</b>\n` +
    `1️⃣ Escolha um produto\n` +
    `2️⃣ Clique em "Comprar Agora"\n` +
    `3️⃣ Pague via PIX\n` +
    `4️⃣ Receba seu produto!\n\n` +
    `💬 Dúvidas? Entre em contato com o suporte.`;
  
  await sendTelegramMessage(chatId, message);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram update received:', JSON.stringify(update, null, 2));

    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const telegramUser = update.message.from;

      if (text.startsWith('/start')) {
        await handleStart(chatId, telegramUser);
      } else if (text.startsWith('/produtos') || text.startsWith('/products')) {
        await handleProducts(chatId);
      } else if (text.startsWith('/pedidos') || text.startsWith('/orders')) {
        await handleMyOrders(chatId, telegramUser);
      } else if (text.startsWith('/ajuda') || text.startsWith('/help')) {
        await handleHelp(chatId);
      } else {
        // Default response
        await sendTelegramMessage(
          chatId,
          'Use /produtos para ver nosso catálogo ou /ajuda para mais informações.'
        );
      }
    }

    // Handle callback query (button clicks)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;
      const telegramUser = callbackQuery.from;

      // Answer callback to remove loading state
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id }),
      });

      if (data === 'products') {
        await handleProducts(chatId);
      } else if (data === 'my_orders') {
        await handleMyOrders(chatId, telegramUser);
      } else if (data === 'help') {
        await handleHelp(chatId);
      } else if (data.startsWith('buy_')) {
        const productId = data.replace('buy_', '');
        await handleBuy(chatId, productId, telegramUser);
      } else if (data.startsWith('paid_')) {
        const orderId = data.replace('paid_', '');
        await handlePaidConfirmation(chatId, orderId);
      } else if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '');
        await handleCancel(chatId, orderId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
