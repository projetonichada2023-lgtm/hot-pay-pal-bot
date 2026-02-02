import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// CONFIGURATION
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FASTSOFT_API_URL = 'https://api.fastsoftbrasil.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// =============================================================================
// TYPES
// =============================================================================

interface ClientContext {
  clientId: string;
  botToken: string;
  fastsoftPublicKey: string | null;
  fastsoftSecretKey: string | null;
  fastsoftEnabled: boolean;
}

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface PixResult {
  pixCode: string;
  qrCodeUrl: string;
  paymentId: string;
}

// =============================================================================
// TELEGRAM API UTILITIES
// =============================================================================

async function sendTelegramMessage(
  botToken: string, 
  chatId: number, 
  text: string, 
  replyMarkup?: object
): Promise<any> {
  const body: Record<string, any> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  console.log('Telegram sendMessage response:', result);
  return result;
}

async function sendTelegramPhoto(
  botToken: string, 
  chatId: number, 
  photoUrl: string, 
  caption: string, 
  replyMarkup?: object
): Promise<any> {
  const body: Record<string, any> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response.json();
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

// =============================================================================
// UUID ENCODING UTILITIES (for Telegram callback data 64-byte limit)
// =============================================================================

function uuidToB64(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64ToUuid(b64url: string): string {
  const padded = b64url.length % 4 === 0 ? b64url : b64url + '='.repeat(4 - (b64url.length % 4));
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function getClientContext(botToken: string): Promise<ClientContext | null> {
  // Use join to reduce queries from 2 to 1
  const { data: client } = await supabase
    .from('clients')
    .select(`
      id, 
      telegram_bot_token,
      client_settings!inner(fastsoft_api_key, fastsoft_public_key, fastsoft_enabled)
    `)
    .eq('telegram_bot_token', botToken)
    .single();

  if (!client) {
    console.error('Client not found for bot token');
    return null;
  }

  const settings = (client.client_settings as any)?.[0] || client.client_settings;
  
  return {
    clientId: client.id,
    botToken: client.telegram_bot_token,
    fastsoftPublicKey: settings?.fastsoft_public_key || null,
    fastsoftSecretKey: settings?.fastsoft_api_key || null,
    fastsoftEnabled: settings?.fastsoft_enabled || false,
  };
}

async function getClientContextByCustomer(telegramId: number): Promise<ClientContext | null> {
  const { data: customer } = await supabase
    .from('telegram_customers')
    .select('clients!inner(telegram_bot_token)')
    .eq('telegram_id', telegramId)
    .limit(1)
    .single();

  if (!customer?.clients) return null;
  
  const botToken = (customer.clients as any).telegram_bot_token;
  return botToken ? getClientContext(botToken) : null;
}

async function getOrCreateCustomer(clientId: string, telegramUser: TelegramUser) {
  const { data: existing } = await supabase
    .from('telegram_customers')
    .select('*')
    .eq('client_id', clientId)
    .eq('telegram_id', telegramUser.id)
    .single();

  if (existing) return existing;

  const { data: newCustomer, error } = await supabase
    .from('telegram_customers')
    .insert({
      client_id: clientId,
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

async function getBotMessage(clientId: string, messageType: string, defaultMessage: string): Promise<string> {
  const { data } = await supabase
    .from('bot_messages')
    .select('message_content')
    .eq('client_id', clientId)
    .eq('message_type', messageType)
    .single();

  return data?.message_content || defaultMessage;
}

async function getClientSettings(clientId: string) {
  const { data } = await supabase
    .from('client_settings')
    .select('*')
    .eq('client_id', clientId)
    .single();

  return data || { auto_delivery: true };
}

async function getProducts(clientId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return data || [];
}

async function getProduct(productId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  return data;
}

async function getProductFees(productId: string) {
  const { data } = await supabase
    .from('product_fees')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return data || [];
}

async function getPendingFees(orderId: string, productId: string): Promise<any[]> {
  const [allFees, order] = await Promise.all([
    getProductFees(productId),
    supabase.from('orders').select('fees_paid').eq('id', orderId).single()
  ]);

  const paidFeeIds: string[] = order.data?.fees_paid || [];
  return allFees.filter(fee => !paidFeeIds.includes(fee.id));
}

async function logMessage(
  clientId: string, 
  customerId: string, 
  chatId: number, 
  direction: 'incoming' | 'outgoing', 
  content: string, 
  messageId?: number
): Promise<void> {
  await supabase.from('telegram_messages').insert({
    client_id: clientId,
    customer_id: customerId,
    telegram_chat_id: chatId,
    telegram_message_id: messageId,
    direction,
    message_type: 'text',
    message_content: content,
  });
}

// =============================================================================
// PIX GENERATION
// =============================================================================

async function generatePixFastsoft(
  ctx: ClientContext, 
  amount: number, 
  orderId: string, 
  customer: any
): Promise<PixResult | null> {
  if (!ctx.fastsoftPublicKey || !ctx.fastsoftSecretKey) {
    console.error('FastSoft keys not configured');
    return null;
  }

  try {
    const authHeader = 'Basic ' + btoa(`${ctx.fastsoftPublicKey}:${ctx.fastsoftSecretKey}`);

    const requestBody = {
      amount: Math.round(amount * 100),
      currency: 'BRL',
      paymentMethod: 'PIX',
      customer: {
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente',
        email: customer.email || 'cliente@email.com',
        document: { number: '00000000000', type: 'CPF' },
      },
      items: [{
        title: 'Produto Digital',
        unitPrice: Math.round(amount * 100),
        quantity: 1,
        tangible: false,
      }],
      pix: { expiresInDays: 1 },
      metadata: JSON.stringify({ order_id: orderId, client_id: ctx.clientId }),
      postbackUrl: `${SUPABASE_URL}/functions/v1/fastsoft-webhook`,
    };

    console.log('Creating FastSoft transaction:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${FASTSOFT_API_URL}/api/user/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('FastSoft response:', response.status, responseText);

    if (!response.ok) return null;

    const data = JSON.parse(responseText);
    const pixCode = data.pix?.qrcode || data.pixCode || '';
    const qrCodeUrl = data.pix?.receiptUrl || 
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

    return { pixCode, qrCodeUrl, paymentId: data.id };
  } catch (error) {
    console.error('Error generating PIX with FastSoft:', error);
    return null;
  }
}

function generateMockPix(amount: number, orderId: string): PixResult {
  const randomId = crypto.randomUUID();
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${randomId}52040000530398654${amount.toFixed(2).replace('.', '')}5802BR5913LOJA DIGITAL6009SAO PAULO62070503***6304`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;

  return { pixCode, qrCodeUrl, paymentId: `MOCK_${orderId}_${Date.now()}` };
}

async function generatePix(ctx: ClientContext, amount: number, orderId: string, customer: any): Promise<PixResult> {
  if (ctx.fastsoftEnabled && ctx.fastsoftPublicKey && ctx.fastsoftSecretKey) {
    const fastsoftPix = await generatePixFastsoft(ctx, amount, orderId, customer);
    if (fastsoftPix) return fastsoftPix;
    console.log('FastSoft failed, falling back to mock PIX');
  }
  return generateMockPix(amount, orderId);
}

// =============================================================================
// ORDER OPERATIONS
// =============================================================================

async function createOrder(
  ctx: ClientContext, 
  customerId: string, 
  productId: string, 
  amount: number, 
  customer: any
) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      client_id: ctx.clientId,
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

  const pix = await generatePix(ctx, amount, order.id, customer);

  await supabase
    .from('orders')
    .update({ pix_code: pix.pixCode, pix_qrcode: pix.qrCodeUrl, payment_id: pix.paymentId })
    .eq('id', order.id);

  return { ...order, ...pix };
}

function buildFeeMessage(fee: any, remainingCount: number): string {
  if (fee.payment_message) {
    return fee.payment_message
      .replace(/{fee_name}/g, fee.name)
      .replace(/{fee_amount}/g, Number(fee.amount).toFixed(2))
      .replace(/{fee_description}/g, fee.description || '')
      .replace(/{remaining_count}/g, String(remainingCount));
  }

  return `💳 <b>Taxa Obrigatória</b>\n\n` +
    `Para receber seu produto, você precisa pagar a seguinte taxa:\n\n` +
    `<b>${fee.name}</b>${fee.description ? `\n${fee.description}` : ''}\n\n` +
    `💰 <b>Valor: R$ ${Number(fee.amount).toFixed(2)}</b>\n\n` +
    `📋 Taxas restantes: ${remainingCount}`;
}

// =============================================================================
// COMMAND HANDLERS
// =============================================================================

async function handleStart(ctx: ClientContext, chatId: number, telegramUser: TelegramUser): Promise<void> {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  const [welcomeMsg, products] = await Promise.all([
    getBotMessage(ctx.clientId, 'welcome', 'Olá! 👋 Bem-vindo à nossa loja!'),
    getProducts(ctx.clientId)
  ]);

  const welcomeResult = await sendTelegramMessage(ctx.botToken, chatId, welcomeMsg);
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', welcomeMsg, welcomeResult?.result?.message_id);
  }

  if (products.length === 0) {
    const noProductsMsg = await getBotMessage(ctx.clientId, 'no_products', '😕 Nenhum produto disponível no momento.');
    await sendTelegramMessage(ctx.botToken, chatId, noProductsMsg, {
      inline_keyboard: [
        [{ text: '📦 Meus Pedidos', callback_data: 'my_orders' }],
        [{ text: '❓ Ajuda', callback_data: 'help' }],
      ],
    });
    return;
  }

  const headerMsg = '🛍️ <b>Nossos Produtos</b>\n\nEscolha um produto para ver mais detalhes:';
  const catalogResult = await sendTelegramMessage(ctx.botToken, chatId, headerMsg, {
    inline_keyboard: [
      ...products.map(p => [{ text: `📦 ${p.name} - R$ ${Number(p.price).toFixed(2)}`, callback_data: `view_${p.id}` }]),
      [{ text: '📦 Meus Pedidos', callback_data: 'my_orders' }],
      [{ text: '❓ Ajuda', callback_data: 'help' }],
    ],
  });

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', headerMsg, catalogResult?.result?.message_id);
  }
}

async function handleProducts(ctx: ClientContext, chatId: number, telegramUser: TelegramUser): Promise<void> {
  const [customer, products] = await Promise.all([
    getOrCreateCustomer(ctx.clientId, telegramUser),
    getProducts(ctx.clientId)
  ]);

  if (products.length === 0) {
    const noProductsMsg = await getBotMessage(ctx.clientId, 'no_products', '😕 Nenhum produto disponível no momento.');
    await sendTelegramMessage(ctx.botToken, chatId, noProductsMsg);
    return;
  }

  const headerMsg = '🛍️ <b>Nossos Produtos</b>\n\nEscolha um produto para ver mais detalhes:';
  await sendTelegramMessage(ctx.botToken, chatId, headerMsg, {
    inline_keyboard: products.map(p => [{ text: `📦 ${p.name} - R$ ${Number(p.price).toFixed(2)}`, callback_data: `view_${p.id}` }])
  });

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', headerMsg);
  }
}

async function handleViewProduct(ctx: ClientContext, chatId: number, productId: string, telegramUser: TelegramUser): Promise<void> {
  const [customer, product] = await Promise.all([
    getOrCreateCustomer(ctx.clientId, telegramUser),
    getProduct(productId)
  ]);

  if (!product) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  // Increment views (fire and forget)
  supabase.from('products').update({ views_count: (product.views_count || 0) + 1 }).eq('id', productId);

  const price = Number(product.price).toFixed(2);
  const caption = `<b>${product.name}</b>\n\n${product.description || 'Sem descrição'}\n\n💰 <b>R$ ${price}</b>${product.is_hot ? '\n\n🔥 PRODUTO EM DESTAQUE!' : ''}`;
  const keyboard = { inline_keyboard: [[{ text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }]] };

  if (product.image_url) {
    await sendTelegramPhoto(ctx.botToken, chatId, product.image_url, caption, keyboard);
  } else {
    await sendTelegramMessage(ctx.botToken, chatId, caption, keyboard);
  }

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', `[Clicou: Ver "${product.name}"]`);
  }
}

async function handleBuy(ctx: ClientContext, chatId: number, productId: string, telegramUser: TelegramUser): Promise<void> {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  if (!customer) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Erro ao processar. Tente novamente.');
    return;
  }

  const product = await getProduct(productId);
  if (!product) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  await logMessage(ctx.clientId, customer.id, chatId, 'incoming', `[Clicou: Comprar "${product.name}"]`);

  const order = await createOrder(ctx, customer.id, productId, Number(product.price), customer);
  if (!order) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Erro ao criar pedido. Tente novamente.');
    return;
  }

  // Send push notification for new pending order
  try {
    const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        clientId: ctx.clientId,
        title: '🛒 Novo Pedido!',
        body: `${product.name} - R$ ${Number(product.price).toFixed(2)}\n${customer.first_name || 'Cliente'}`,
        url: '/dashboard/orders',
        orderId: order.id,
        type: 'order',
      }),
    });
    console.log('Push notification for new order:', pushRes.status);
  } catch (pushError) {
    console.error('Error sending push notification for new order:', pushError);
  }

  const [orderCreatedMsg, paymentInstructions] = await Promise.all([
    getBotMessage(ctx.clientId, 'order_created', '🛒 Pedido criado com sucesso! Efetue o pagamento para receber seu produto.'),
    getBotMessage(ctx.clientId, 'payment_instructions', 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.')
  ]);

  const message = `${orderCreatedMsg}\n\n` +
    `<b>Produto:</b> ${product.name}\n` +
    `<b>Valor:</b> R$ ${Number(product.price).toFixed(2)}\n\n` +
    `${paymentInstructions}\n\n` +
    `<code>${order.pixCode}</code>\n\n` +
    `⏰ <i>Você tem 15 minutos para efetuar o pagamento.</i>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Já Paguei', callback_data: `paid_${order.id}` }],
      [{ text: '❌ Cancelar', callback_data: `cancel_${order.id}` }],
    ],
  };

  try {
    if (order.qrCodeUrl) {
      await sendTelegramPhoto(ctx.botToken, chatId, order.qrCodeUrl, message, keyboard);
    } else {
      await sendTelegramMessage(ctx.botToken, chatId, message, keyboard);
    }
  } catch {
    await sendTelegramMessage(ctx.botToken, chatId, message, keyboard);
  }

  await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', message);
}

async function handlePaidConfirmation(ctx: ClientContext, chatId: number, orderId: string, telegramUser: TelegramUser): Promise<void> {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);

  const { data: order } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', orderId)
    .single();

  if (!order) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Pedido não encontrado.');
    return;
  }

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', '[Clicou: Confirmar Pagamento]');
  }

  const [settings, successMsg] = await Promise.all([
    getClientSettings(ctx.clientId),
    getBotMessage(ctx.clientId, 'payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.')
  ]);

  await supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', orderId);
  await sendTelegramMessage(ctx.botToken, chatId, successMsg);

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', successMsg);
  }

  // Check for pending fees
  const product = order.products;
  if (product?.require_fees_before_delivery) {
    const pendingFees = await getPendingFees(orderId, product.id);
    if (pendingFees.length > 0) {
      await showNextFee(ctx, chatId, orderId, pendingFees[0], pendingFees.length, customer);
      return;
    }
  }

  // Auto delivery
  if (settings.auto_delivery && order.products?.file_url) {
    await deliverProduct(ctx, chatId, orderId, order, customer);
  } else {
    await sendTelegramMessage(ctx.botToken, chatId, '📦 Seu produto será entregue em breve pelo vendedor.');
  }
}

async function showNextFee(ctx: ClientContext, chatId: number, orderId: string, fee: any, remainingCount: number, customer: any): Promise<void> {
  const message = buildFeeMessage(fee, remainingCount);
  const buttonText = fee.button_text || '💳 Gerar PIX para Pagar';

  await sendTelegramMessage(ctx.botToken, chatId, message, {
    inline_keyboard: [[{ text: buttonText, callback_data: `gf:${uuidToB64(fee.id)}:${uuidToB64(orderId)}` }]],
  });

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', message);
  }
}

async function handleGenerateFeePix(ctx: ClientContext, chatId: number, feeIdShort: string, orderIdShort: string, telegramUser: TelegramUser): Promise<void> {
  const [feeId, orderId] = [b64ToUuid(feeIdShort), b64ToUuid(orderIdShort)];
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);

  const { data: fee } = await supabase.from('product_fees').select('*').eq('id', feeId).single();
  if (!fee) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Taxa não encontrada.');
    return;
  }

  const { data: feeOrder } = await supabase
    .from('orders')
    .insert({
      client_id: ctx.clientId,
      customer_id: customer?.id,
      product_id: null,
      amount: fee.amount,
      status: 'pending',
      payment_method: 'pix',
      parent_order_id: orderId,
      fees_paid: [feeId],
    })
    .select()
    .single();

  if (!feeOrder) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Erro ao gerar pagamento da taxa. Tente novamente.');
    return;
  }

  const pix = await generatePix(ctx, fee.amount, feeOrder.id, customer);

  await supabase.from('orders').update({
    pix_code: pix.pixCode,
    pix_qrcode: pix.qrCodeUrl,
    payment_id: pix.paymentId,
  }).eq('id', feeOrder.id);

  const pixMessage = `✅ <b>PIX Gerado!</b>\n\n💰 <b>Valor: R$ ${Number(fee.amount).toFixed(2)}</b>\n\nCopie o código abaixo:\n\n<code>${pix.pixCode}</code>`;

  await sendTelegramMessage(ctx.botToken, chatId, pixMessage, {
    inline_keyboard: [[{ text: '✅ Paguei a Taxa', callback_data: `fp:${uuidToB64(feeOrder.id)}` }]],
  });

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', pixMessage);
  }
}

async function handleFeePaid(ctx: ClientContext, chatId: number, feeOrderIdShort: string, telegramUser: TelegramUser): Promise<void> {
  const feeOrderId = b64ToUuid(feeOrderIdShort);
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);

  const { data: feeOrder } = await supabase
    .from('orders')
    .select('id, parent_order_id, fees_paid')
    .eq('id', feeOrderId)
    .single();

  if (!feeOrder?.parent_order_id) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Taxa não encontrada ou expirada.');
    return;
  }

  const parentOrderId = feeOrder.parent_order_id as string;
  const feeId = Array.isArray(feeOrder.fees_paid) ? (feeOrder.fees_paid[0] as string | undefined) : undefined;

  if (!feeId) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Não consegui identificar a taxa desta cobrança.');
    return;
  }

  const { data: parentOrder } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', parentOrderId)
    .single();

  if (!parentOrder) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Pedido não encontrado.');
    return;
  }

  // Update orders in parallel
  const currentPaidFees: string[] = parentOrder.fees_paid || [];
  const updatedPaidFees = Array.from(new Set([...currentPaidFees, feeId]));

  await Promise.all([
    supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', feeOrderId),
    supabase.from('orders').update({ fees_paid: updatedPaidFees }).eq('id', parentOrderId)
  ]);

  await sendTelegramMessage(ctx.botToken, chatId, '✅ Taxa paga com sucesso!');

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', '[Clicou: Paguei a Taxa]');
  }

  const pendingFees = await getPendingFees(parentOrderId, parentOrder.product_id);

  if (pendingFees.length > 0) {
    await showNextFee(ctx, chatId, parentOrderId, pendingFees[0], pendingFees.length, customer);
  } else {
    const settings = await getClientSettings(ctx.clientId);
    if (settings.auto_delivery && parentOrder.products?.file_url) {
      await deliverProduct(ctx, chatId, parentOrderId, parentOrder, customer);
    } else {
      await sendTelegramMessage(ctx.botToken, chatId, '🎉 Todas as taxas foram pagas! Seu produto será entregue em breve.');
    }
  }
}

async function deliverProduct(ctx: ClientContext, chatId: number, orderId: string, order: any, customer: any): Promise<void> {
  await Promise.all([
    supabase.from('orders').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', orderId),
    supabase.from('products').update({ sales_count: (order.products?.sales_count || 0) + 1 }).eq('id', order.product_id)
  ]);

  const deliveryMsg = await getBotMessage(ctx.clientId, 'product_delivered', '📦 Produto entregue! Obrigado pela compra!');
  await sendTelegramMessage(ctx.botToken, chatId, `${deliveryMsg}\n\n🔗 Acesse seu produto:\n${order.products?.file_url}`);

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', deliveryMsg);
  }
}

async function handleCancel(ctx: ClientContext, chatId: number, orderId: string, telegramUser: TelegramUser): Promise<void> {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);

  await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);

  const cancelMsg = await getBotMessage(ctx.clientId, 'order_cancelled', '❌ Pedido cancelado.');
  await sendTelegramMessage(ctx.botToken, chatId, cancelMsg);

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', '[Clicou: Cancelar Pedido]');
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', cancelMsg);
  }
}

async function handleMyOrders(ctx: ClientContext, chatId: number, telegramUser: TelegramUser): Promise<void> {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  if (!customer) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Erro ao buscar pedidos.');
    return;
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(name)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!orders || orders.length === 0) {
    await sendTelegramMessage(ctx.botToken, chatId, '📭 Você ainda não tem pedidos.');
    return;
  }

  const statusEmoji: Record<string, string> = {
    pending: '⏳', paid: '✅', delivered: '📦', cancelled: '❌', refunded: '💸',
  };

  let message = '📋 <b>Seus Últimos Pedidos:</b>\n\n';
  for (const order of orders) {
    const emoji = statusEmoji[order.status] || '❓';
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');
    message += `${emoji} ${order.products?.name || 'Produto'} - R$ ${Number(order.amount).toFixed(2)} (${date})\n`;
  }

  await sendTelegramMessage(ctx.botToken, chatId, message);
}

async function handleHelp(ctx: ClientContext, chatId: number): Promise<void> {
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

  await sendTelegramMessage(ctx.botToken, chatId, message);
}

// =============================================================================
// CALLBACK ROUTER
// =============================================================================

async function handleCallback(ctx: ClientContext, chatId: number, data: string, telegramUser: TelegramUser): Promise<void> {
  if (data === 'products') {
    await handleProducts(ctx, chatId, telegramUser);
  } else if (data === 'my_orders') {
    await handleMyOrders(ctx, chatId, telegramUser);
  } else if (data === 'help') {
    await handleHelp(ctx, chatId);
  } else if (data.startsWith('view_')) {
    await handleViewProduct(ctx, chatId, data.replace('view_', ''), telegramUser);
  } else if (data.startsWith('buy_')) {
    await handleBuy(ctx, chatId, data.replace('buy_', ''), telegramUser);
  } else if (data.startsWith('fp:')) {
    await handleFeePaid(ctx, chatId, data.replace('fp:', ''), telegramUser);
  } else if (data.startsWith('gf:')) {
    const [feeIdShort, orderIdShort] = data.replace('gf:', '').split(':');
    await handleGenerateFeePix(ctx, chatId, feeIdShort, orderIdShort, telegramUser);
  } else if (data.startsWith('paid_')) {
    await handlePaidConfirmation(ctx, chatId, data.replace('paid_', ''), telegramUser);
  } else if (data.startsWith('cancel_')) {
    await handleCancel(ctx, chatId, data.replace('cancel_', ''), telegramUser);
  }
}

// =============================================================================
// MAIN SERVER
// =============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram update received:', JSON.stringify(update, null, 2));

    // Extract chat info
    let chatId: number;
    let telegramUser: TelegramUser;

    if (update.message) {
      chatId = update.message.chat.id;
      telegramUser = update.message.from;
    } else if (update.callback_query) {
      chatId = update.callback_query.message.chat.id;
      telegramUser = update.callback_query.from;
    } else {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve client context
    const url = new URL(req.url);
    const botTokenFromUrl = url.searchParams.get('bot_token');

    let ctx: ClientContext | null = null;

    if (botTokenFromUrl) {
      ctx = await getClientContext(botTokenFromUrl);
    } else {
      ctx = await getClientContextByCustomer(telegramUser.id);
    }

    if (!ctx) {
      console.error('Could not determine client context');
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle message commands
    if (update.message) {
      const text = update.message.text || '';

      if (text.startsWith('/start')) {
        await handleStart(ctx, chatId, telegramUser);
      } else if (text.startsWith('/produtos') || text.startsWith('/products')) {
        await handleProducts(ctx, chatId, telegramUser);
      } else if (text.startsWith('/pedidos') || text.startsWith('/orders')) {
        await handleMyOrders(ctx, chatId, telegramUser);
      } else if (text.startsWith('/ajuda') || text.startsWith('/help')) {
        await handleHelp(ctx, chatId);
      } else {
        await sendTelegramMessage(ctx.botToken, chatId, 'Use /produtos para ver nosso catálogo ou /ajuda para mais informações.');
      }
    }

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await answerCallbackQuery(ctx.botToken, update.callback_query.id);
      await handleCallback(ctx, chatId, update.callback_query.data, telegramUser);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing telegram update:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
