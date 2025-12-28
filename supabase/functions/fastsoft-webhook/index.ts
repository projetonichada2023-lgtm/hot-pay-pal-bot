import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Send Telegram message with optional inline keyboard
async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

// UUID to Base64 URL-safe conversion (for callback_data)
function uuidToB64(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(hex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

// Get pending fees for an order
async function getPendingFees(orderId: string, productId: string): Promise<any[]> {
  const allFees = await getProductFees(productId);
  
  const { data: order } = await supabase
    .from('orders')
    .select('fees_paid')
    .eq('id', orderId)
    .single();
  
  const paidFeeIds: string[] = order?.fees_paid || [];
  
  return allFees.filter(fee => !paidFeeIds.includes(fee.id));
}

// Build fee message - ensures proper line breaks for Telegram
function buildFeeMessage(fee: any, remainingCount: number): string {
  const customMessage = fee.payment_message;
  
  if (customMessage) {
    // Ensure line breaks are properly formatted for Telegram
    // Replace literal \n strings with actual newlines, then normalize multiple newlines
    let formatted = customMessage
      .replace(/\\n/g, '\n')  // Convert escaped \n to actual newlines
      .replace(/\r\n/g, '\n') // Normalize Windows line endings
      .replace(/\r/g, '\n')   // Normalize old Mac line endings
      .replace(/{fee_name}/g, fee.name)
      .replace(/{fee_amount}/g, Number(fee.amount).toFixed(2))
      .replace(/{fee_description}/g, fee.description || '')
      .replace(/{remaining_count}/g, String(remainingCount));
    
    return formatted;
  }
  
  return `💳 <b>Taxa Obrigatória</b>\n\n` +
    `Para receber seu produto, você precisa pagar a seguinte taxa:\n\n` +
    `<b>${fee.name}</b>${fee.description ? `\n${fee.description}` : ''}\n\n` +
    `💰 <b>Valor: R$ ${Number(fee.amount).toFixed(2)}</b>\n\n` +
    `📋 Taxas restantes: ${remainingCount}`;
}

// Show next fee to user
async function showNextFee(botToken: string, chatId: number, orderId: string, fee: any, remainingCount: number) {
  console.log('Showing next fee:', fee.name, 'for order:', orderId);
  
  const message = buildFeeMessage(fee, remainingCount);
  const buttonText = fee.button_text || '💳 Gerar PIX para Pagar';
  
  const feeIdShort = uuidToB64(fee.id);
  const orderIdShort = uuidToB64(orderId);
  
  const keyboard = {
    inline_keyboard: [
      [{ text: buttonText, callback_data: `gf:${feeIdShort}:${orderIdShort}` }],
    ],
  };
  
  await sendTelegramMessage(botToken, chatId, message, keyboard);
}

// Create invite link for VIP group
async function createInviteLink(botToken: string, groupId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupId,
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 300,
        creates_join_request: false,
      }),
    });
    
    const data = await res.json();
    if (data.ok && data.result?.invite_link) {
      return data.result.invite_link;
    }
    return null;
  } catch (error) {
    console.error('Error creating invite link:', error);
    return null;
  }
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
  const product = order.products;

  // IMPORTANT: Only consider paid if status explicitly indicates payment
  // Do NOT rely on paidAt field as it may be set before actual payment confirmation
  const isPaid = status === 'PAID' || status === 'AUTHORIZED' || status === 'paid' || status === 'authorized';

  if (isPaid) {
    console.log(`Payment confirmed for order ${orderId} (status=${status}, paidAt=${transaction?.paidAt ?? 'null'})`);
    
    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Send push notification to client
    try {
      const productName = product?.name || 'Produto';
      const amount = Number(order.amount).toFixed(2);
      const customerName = order.telegram_customers?.first_name || 'Cliente';
      
      const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          clientId: clientId,
          title: '💰 Nova Venda Confirmada!',
          body: `${productName} - R$ ${amount}\n${customerName}`,
          url: '/dashboard/orders',
          orderId: orderId,
          type: 'sale',
        }),
      });

      const pushText = await pushRes.text();
      console.log('Push function response:', pushRes.status, pushText);
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
    }

    // Notify customer via Telegram
    if (botToken && customerTelegramId) {
      const successMsg = getMessageContent('payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.');
      await sendTelegramMessage(botToken, customerTelegramId, successMsg);

      // Check if product requires fees before delivery
      if (product?.require_fees_before_delivery && product?.id) {
        const pendingFees = await getPendingFees(orderId, product.id);
        
        if (pendingFees.length > 0) {
          console.log('Product requires fees before delivery, showing first fee');
          await showNextFee(botToken, customerTelegramId, orderId, pendingFees[0], pendingFees.length);
          
          // Log message
          await supabase.from('telegram_messages').insert({
            client_id: clientId,
            customer_id: order.customer_id,
            telegram_chat_id: customerTelegramId,
            direction: 'outgoing',
            message_type: 'text',
            message_content: '[Sistema] Pagamento confirmado, mostrando taxas obrigatórias',
          });
          
          return; // Don't deliver yet, wait for fees
        }
      }

      // No fees required - proceed with delivery
      let delivered = false;
      let deliveryMessages: string[] = [];

      // Check for file URL delivery
      if (product?.file_url) {
        deliveryMessages.push(`🔗 <b>Link de acesso:</b>\n${product.file_url}`);
      }

      // Check for VIP group access
      if (product?.telegram_group_id) {
        console.log('Creating invite link for VIP group:', product.telegram_group_id);
        const inviteLink = await createInviteLink(botToken, product.telegram_group_id);
        
        if (inviteLink) {
          deliveryMessages.push(`👥 <b>Acesso ao Grupo VIP:</b>\n${inviteLink}\n\n⚠️ <i>Link único! Expira em 5 minutos. Use agora!</i>`);
        } else {
          deliveryMessages.push(`👥 <b>Grupo VIP:</b> Houve um problema ao gerar o convite. Entre em contato com o suporte.`);
        }
      }

      if (deliveryMessages.length > 0 && settings?.auto_delivery) {
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
          .update({ sales_count: (product?.sales_count || 0) + 1 })
          .eq('id', order.product_id);

        const deliveryMsg = getMessageContent('product_delivered', '📦 Produto entregue! Obrigado pela compra!');
        await sendTelegramMessage(
          botToken,
          customerTelegramId,
          `${deliveryMsg}\n\n${deliveryMessages.join('\n\n')}`,
          { inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]] }
        );
        delivered = true;
      }

      if (!delivered) {
        // Manual delivery notification
        const manualDeliveryMsg = '📦 Seu produto será entregue em breve pelo vendedor.';
        await sendTelegramMessage(botToken, customerTelegramId, manualDeliveryMsg, {
          inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]]
        });
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
