import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FASTSOFT_API_URL = 'https://api.fastsoftbrasil.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Client context interface
interface ClientContext {
  clientId: string;
  botToken: string;
  fastsoftPublicKey: string | null;
  fastsoftSecretKey: string | null;
  fastsoftEnabled: boolean;
}

// Telegram API helpers
async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
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

async function sendTelegramPhoto(botToken: string, chatId: number, photoUrl: string, caption: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
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

// Get client context from bot token in URL or request
async function getClientContext(botToken: string): Promise<ClientContext | null> {
  const { data: client } = await supabase
    .from('clients')
    .select('id, telegram_bot_token')
    .eq('telegram_bot_token', botToken)
    .single();

  if (!client) {
    console.error('Client not found for bot token');
    return null;
  }

  const { data: settings } = await supabase
    .from('client_settings')
    .select('fastsoft_api_key, fastsoft_public_key, fastsoft_enabled')
    .eq('client_id', client.id)
    .single();

  return {
    clientId: client.id,
    botToken: client.telegram_bot_token,
    fastsoftPublicKey: settings?.fastsoft_public_key || null,
    fastsoftSecretKey: settings?.fastsoft_api_key || null,
    fastsoftEnabled: settings?.fastsoft_enabled || false,
  };
}

// Get or create customer
async function getOrCreateCustomer(clientId: string, telegramUser: any) {
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

// Get bot messages for client
async function getBotMessage(clientId: string, messageType: string, defaultMessage: string): Promise<string> {
  const { data } = await supabase
    .from('bot_messages')
    .select('message_content')
    .eq('client_id', clientId)
    .eq('message_type', messageType)
    .single();
  
  return data?.message_content || defaultMessage;
}

// Get client settings
async function getClientSettings(clientId: string) {
  const { data } = await supabase
    .from('client_settings')
    .select('*')
    .eq('client_id', clientId)
    .single();
  
  return data || { auto_delivery: true };
}

// Get products for client
async function getProducts(clientId: string) {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('client_id', clientId)
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

// Get product fees
async function getProductFees(productId: string) {
  const { data } = await supabase
    .from('product_fees')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  return data || [];
}

// Get pending fees for an order (fees not yet paid)
async function getPendingFees(orderId: string, productId: string): Promise<any[]> {
  const allFees = await getProductFees(productId);
  
  // Get order to check which fees were already paid
  const { data: order } = await supabase
    .from('orders')
    .select('fees_paid')
    .eq('id', orderId)
    .single();
  
  const paidFeeIds: string[] = order?.fees_paid || [];
  
  return allFees.filter(fee => !paidFeeIds.includes(fee.id));
}

// Build fee message from custom template or default
function buildFeeMessage(fee: any, remainingCount: number): string {
  const customMessage = fee.payment_message;
  
  if (customMessage) {
    return customMessage
      .replace(/{fee_name}/g, fee.name)
      .replace(/{fee_amount}/g, Number(fee.amount).toFixed(2))
      .replace(/{fee_description}/g, fee.description || '')
      .replace(/{remaining_count}/g, String(remainingCount));
  }
  
  // Default message
  return `💳 <b>Taxa Obrigatória</b>\n\n` +
    `Para receber seu produto, você precisa pagar a seguinte taxa:\n\n` +
    `<b>${fee.name}</b>${fee.description ? `\n${fee.description}` : ''}\n\n` +
    `💰 <b>Valor: R$ ${Number(fee.amount).toFixed(2)}</b>\n\n` +
    `📋 Taxas restantes: ${remainingCount}`;
}

// Generate PIX using FastSoft API
async function generatePixFastsoft(ctx: ClientContext, amount: number, orderId: string, customer: any): Promise<{ pixCode: string; qrCodeUrl: string; paymentId: string } | null> {
  if (!ctx.fastsoftPublicKey || !ctx.fastsoftSecretKey) {
    console.error('FastSoft keys not configured');
    return null;
  }

  try {
    // Use public key + secret key for authentication
    const authHeader = 'Basic ' + btoa(`${ctx.fastsoftPublicKey}:${ctx.fastsoftSecretKey}`);
    
    const requestBody = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'BRL',
      paymentMethod: 'PIX',
      customer: {
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente',
        email: customer.email || 'cliente@email.com',
        document: {
          number: '00000000000',
          type: 'CPF',
        },
      },
      items: [{
        title: 'Produto Digital',
        unitPrice: Math.round(amount * 100),
        quantity: 1,
        tangible: false,
      }],
      pix: {
        expiresInDays: 1,
      },
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
    console.log('FastSoft response status:', response.status);
    console.log('FastSoft response:', responseText);

    if (!response.ok) {
      console.error('FastSoft API error:', response.status, responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    
    // Extract PIX data from response
    const pixCode = data.pix?.qrcode || data.pixCode || '';
    const qrCodeUrl = data.pix?.receiptUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
    
    return {
      pixCode,
      qrCodeUrl,
      paymentId: data.id,
    };
  } catch (error) {
    console.error('Error generating PIX with FastSoft:', error);
    return null;
  }
}

// Generate mock PIX (fallback when FastSoft is not configured)
function generateMockPix(amount: number, orderId: string): { pixCode: string; qrCodeUrl: string; paymentId: string } {
  const randomId = crypto.randomUUID();
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${randomId}52040000530398654${amount.toFixed(2).replace('.', '')}5802BR5913LOJA DIGITAL6009SAO PAULO62070503***6304`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
  
  return {
    pixCode,
    qrCodeUrl,
    paymentId: `MOCK_${orderId}_${Date.now()}`,
  };
}

// Create order
async function createOrder(ctx: ClientContext, customerId: string, productId: string, amount: number, customer: any) {
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

  // Generate PIX - use FastSoft if enabled, otherwise mock
  let pix: { pixCode: string; qrCodeUrl: string; paymentId: string };
  
  if (ctx.fastsoftEnabled && ctx.fastsoftPublicKey && ctx.fastsoftSecretKey) {
    const fastsoftPix = await generatePixFastsoft(ctx, amount, order.id, customer);
    if (fastsoftPix) {
      pix = fastsoftPix;
    } else {
      console.log('FastSoft failed, falling back to mock PIX');
      pix = generateMockPix(amount, order.id);
    }
  } else {
    pix = generateMockPix(amount, order.id);
  }
  
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

// Log message to telegram_messages
async function logMessage(clientId: string, customerId: string, chatId: number, direction: 'incoming' | 'outgoing', content: string, messageId?: number) {
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

// Handle /start command
async function handleStart(ctx: ClientContext, chatId: number, telegramUser: any) {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  const welcomeMsg = await getBotMessage(ctx.clientId, 'welcome', 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.');
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛍️ Ver Produtos', callback_data: 'products' }],
      [{ text: '📦 Meus Pedidos', callback_data: 'my_orders' }],
      [{ text: '❓ Ajuda', callback_data: 'help' }],
    ],
  };
  
  const result = await sendTelegramMessage(ctx.botToken, chatId, welcomeMsg, keyboard);
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', welcomeMsg, result?.result?.message_id);
  }
}

// Handle products command
async function handleProducts(ctx: ClientContext, chatId: number, telegramUser: any) {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  const products = await getProducts(ctx.clientId);
  
  if (products.length === 0) {
    const noProductsMsg = await getBotMessage(ctx.clientId, 'no_products', '😕 Nenhum produto disponível no momento.');
    await sendTelegramMessage(ctx.botToken, chatId, noProductsMsg);
    return;
  }
  
  // Send product list header
  const headerMsg = '🛍️ <b>Nossos Produtos</b>\n\nEscolha um produto para ver mais detalhes:';
  await sendTelegramMessage(ctx.botToken, chatId, headerMsg, {
    inline_keyboard: products.map(p => [{ text: `📦 ${p.name} - R$ ${Number(p.price).toFixed(2)}`, callback_data: `view_${p.id}` }])
  });
  
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', headerMsg);
  }
}

// Handle view product
async function handleViewProduct(ctx: ClientContext, chatId: number, productId: string, telegramUser: any) {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  const product = await getProduct(productId);
  
  if (!product) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Produto não encontrado.');
    return;
  }

  // Increment views
  await supabase
    .from('products')
    .update({ views_count: (product.views_count || 0) + 1 })
    .eq('id', productId);

  const price = Number(product.price).toFixed(2);
  const caption = `<b>${product.name}</b>\n\n${product.description || 'Sem descrição'}\n\n💰 <b>R$ ${price}</b>${product.is_hot ? '\n\n🔥 PRODUTO EM DESTAQUE!' : ''}`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }],
      [{ text: '⬅️ Voltar', callback_data: 'products' }],
    ],
  };
  
  if (product.image_url) {
    await sendTelegramPhoto(ctx.botToken, chatId, product.image_url, caption, keyboard);
  } else {
    await sendTelegramMessage(ctx.botToken, chatId, caption, keyboard);
  }

  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', `[Clicou: Ver "${product.name}"]`);
  }
}

// Handle buy action
async function handleBuy(ctx: ClientContext, chatId: number, productId: string, telegramUser: any) {
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
  
  const orderCreatedMsg = await getBotMessage(ctx.clientId, 'order_created', '🛒 Pedido criado com sucesso! Efetue o pagamento para receber seu produto.');
  const paymentInstructions = await getBotMessage(ctx.clientId, 'payment_instructions', 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.');
  
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

  // Try to send with QR code image, fallback to text only
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

// Handle payment confirmation (manual - for when FastSoft webhook doesn't work)
async function handlePaidConfirmation(ctx: ClientContext, chatId: number, orderId: string, telegramUser: any) {
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

  // If FastSoft is enabled, we should wait for webhook
  // But for now, we'll allow manual confirmation with a message
  if (ctx.fastsoftEnabled && order.payment_id && !order.payment_id.startsWith('MOCK_')) {
    // Check payment status with FastSoft API (optional)
    // For now, just confirm manually
  }
  
  const settings = await getClientSettings(ctx.clientId);
  const successMsg = await getBotMessage(ctx.clientId, 'payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.');
  
  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  
  await sendTelegramMessage(ctx.botToken, chatId, successMsg);
  
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', successMsg);
  }
  
  // Check if product requires fees before delivery
  const product = order.products;
  if (product?.require_fees_before_delivery) {
    const pendingFees = await getPendingFees(orderId, product.id);
    
    if (pendingFees.length > 0) {
      // Show next fee to pay
      await showNextFee(ctx, chatId, orderId, pendingFees[0], pendingFees.length, customer);
      return;
    }
  }
  
  // Auto delivery if enabled and no pending fees
  if (settings.auto_delivery && order.products?.file_url) {
    await deliverProduct(ctx, chatId, orderId, order, customer);
  } else {
    await sendTelegramMessage(ctx.botToken, chatId, '📦 Seu produto será entregue em breve pelo vendedor.');
  }
}

// Show next fee to pay
async function showNextFee(ctx: ClientContext, chatId: number, orderId: string, fee: any, remainingCount: number, customer: any) {
  const message = buildFeeMessage(fee, remainingCount);
  
  // Generate PIX for fee
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
      // store which fee this order refers to (keeps callback_data short)
      fees_paid: [fee.id],
    })
    .select()
    .single();
  
  if (!feeOrder) {
    await sendTelegramMessage(ctx.botToken, chatId, '❌ Erro ao gerar pagamento da taxa. Tente novamente.');
    return;
  }
  
  // Generate PIX
  const pix = generateMockPix(fee.amount, feeOrder.id);
  
  await supabase
    .from('orders')
    .update({
      pix_code: pix.pixCode,
      pix_qrcode: pix.qrCodeUrl,
      payment_id: pix.paymentId,
    })
    .eq('id', feeOrder.id);
  
  const fullMessage = `${message}\n\n<code>${pix.pixCode}</code>`;
  
  const buttonText = fee.button_text || '✅ Paguei a Taxa';
  
  const keyboard = {
    inline_keyboard: [
      [{ text: buttonText, callback_data: `feepaid:${feeOrder.id}` }],
      [{ text: '❌ Cancelar Pedido', callback_data: `cancel_${orderId}` }],
    ],
  };
  
  // Send as text to avoid Telegram failing to fetch external QR image URLs
  await sendTelegramMessage(ctx.botToken, chatId, fullMessage, keyboard);
  
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', fullMessage);
  }
}

// Handle fee payment confirmation
async function handleFeePaid(ctx: ClientContext, chatId: number, feeOrderId: string, telegramUser: any) {
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

  // Mark fee order as paid
  await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', feeOrderId);

  // Add fee to paid list (unique)
  const currentPaidFees: string[] = parentOrder.fees_paid || [];
  const updatedPaidFees = Array.from(new Set([...currentPaidFees, feeId]));

  await supabase
    .from('orders')
    .update({ fees_paid: updatedPaidFees })
    .eq('id', parentOrderId);

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

// Deliver product
async function deliverProduct(ctx: ClientContext, chatId: number, orderId: string, order: any, customer: any) {
  await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  
  await supabase
    .from('products')
    .update({ sales_count: (order.products?.sales_count || 0) + 1 })
    .eq('id', order.product_id);
  
  const deliveryMsg = await getBotMessage(ctx.clientId, 'product_delivered', '📦 Produto entregue! Obrigado pela compra!');
  await sendTelegramMessage(
    ctx.botToken,
    chatId,
    `${deliveryMsg}\n\n🔗 Acesse seu produto:\n${order.products?.file_url}`
  );
  
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', deliveryMsg);
  }
}

// Handle order cancellation
async function handleCancel(ctx: ClientContext, chatId: number, orderId: string, telegramUser: any) {
  const customer = await getOrCreateCustomer(ctx.clientId, telegramUser);
  
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  
  const cancelMsg = await getBotMessage(ctx.clientId, 'order_cancelled', '❌ Pedido cancelado.');
  await sendTelegramMessage(ctx.botToken, chatId, cancelMsg);
  
  if (customer) {
    await logMessage(ctx.clientId, customer.id, chatId, 'incoming', '[Clicou: Cancelar Pedido]');
    await logMessage(ctx.clientId, customer.id, chatId, 'outgoing', cancelMsg);
  }
}

// Handle my orders
async function handleMyOrders(ctx: ClientContext, chatId: number, telegramUser: any) {
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
    pending: '⏳',
    paid: '✅',
    delivered: '📦',
    cancelled: '❌',
    refunded: '💸',
  };
  
  let message = '📋 <b>Seus Últimos Pedidos:</b>\n\n';
  for (const order of orders) {
    const emoji = statusEmoji[order.status] || '❓';
    const date = new Date(order.created_at).toLocaleDateString('pt-BR');
    message += `${emoji} ${order.products?.name || 'Produto'} - R$ ${Number(order.amount).toFixed(2)} (${date})\n`;
  }
  
  await sendTelegramMessage(ctx.botToken, chatId, message);
}

// Handle help
async function handleHelp(ctx: ClientContext, chatId: number) {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log('Telegram update received:', JSON.stringify(update, null, 2));

    // Extract bot token from the message - we need to find which client this is for
    let chatId: number;
    let telegramUser: any;
    
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

    // Find client by telegram_id of customer (they must have interacted before)
    // Or we need to get the bot token from the URL params
    const url = new URL(req.url);
    const botTokenFromUrl = url.searchParams.get('bot_token');
    
    let ctx: ClientContext | null = null;
    
    if (botTokenFromUrl) {
      ctx = await getClientContext(botTokenFromUrl);
    } else {
      // Try to find client by existing customer relationship
      const { data: existingCustomer } = await supabase
        .from('telegram_customers')
        .select('client_id')
        .eq('telegram_id', telegramUser.id)
        .limit(1)
        .single();
      
      if (existingCustomer?.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('telegram_bot_token')
          .eq('id', existingCustomer.client_id)
          .single();
        
        if (clientData?.telegram_bot_token) {
          ctx = await getClientContext(clientData.telegram_bot_token);
        }
      }
    }

    if (!ctx) {
      console.error('Could not determine client context');
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle message
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
        await sendTelegramMessage(
          ctx.botToken,
          chatId,
          'Use /produtos para ver nosso catálogo ou /ajuda para mais informações.'
        );
      }
    }

    // Handle callback query (button clicks)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;

      // Answer callback to remove loading state
      await fetch(`https://api.telegram.org/bot${ctx.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id }),
      });

      if (data === 'products') {
        await handleProducts(ctx, chatId, telegramUser);
      } else if (data === 'my_orders') {
        await handleMyOrders(ctx, chatId, telegramUser);
      } else if (data === 'help') {
        await handleHelp(ctx, chatId);
      } else if (data.startsWith('view_')) {
        const productId = data.replace('view_', '');
        await handleViewProduct(ctx, chatId, productId, telegramUser);
      } else if (data.startsWith('buy_')) {
        const productId = data.replace('buy_', '');
        await handleBuy(ctx, chatId, productId, telegramUser);
      } else if (data.startsWith('feepaid:')) {
        // Format: feepaid:{feeOrderId}
        const feeOrderId = data.replace('feepaid:', '');
        console.log('Fee paid callback:', { feeOrderId });
        await handleFeePaid(ctx, chatId, feeOrderId, telegramUser);
      } else if (data.startsWith('paid_')) {
        const orderId = data.replace('paid_', '');
        await handlePaidConfirmation(ctx, chatId, orderId, telegramUser);
      } else if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '');
        await handleCancel(ctx, chatId, orderId, telegramUser);
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
