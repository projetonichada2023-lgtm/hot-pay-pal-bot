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

async function showNextFee(botToken: string, chatId: number, orderId: string, fee: any, remainingCount: number) {
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

// Platform fee registration (same as fastsoft-webhook)
async function registerPlatformFee(clientId: string, orderId: string) {
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('fee_rate')
      .eq('id', clientId)
      .single();

    const feeRate = Number(client?.fee_rate) || 0.70;

    const { data: fee, error: feeError } = await supabase
      .from('platform_fees')
      .insert({
        client_id: clientId,
        order_id: orderId,
        amount: feeRate,
        status: 'pending'
      })
      .select()
      .single();

    if (feeError) {
      console.error('Error creating platform fee:', feeError);
      return;
    }

    let { data: balance } = await supabase
      .from('client_balances')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (!balance) {
      const { data: newBalance } = await supabase
        .from('client_balances')
        .insert({ client_id: clientId })
        .select()
        .single();
      balance = newBalance;
    }

    const currentBalance = Number(balance?.balance) || 0;

    if (currentBalance >= feeRate) {
      const newBalance = currentBalance - feeRate;
      
      await supabase
        .from('client_balances')
        .update({ balance: newBalance, last_fee_date: new Date().toISOString() })
        .eq('client_id', clientId);

      await supabase
        .from('platform_fees')
        .update({ status: 'deducted_from_balance', paid_at: new Date().toISOString() })
        .eq('id', fee.id);

      await supabase.from('balance_transactions').insert({
        client_id: clientId,
        type: 'fee_deduction',
        amount: -feeRate,
        description: `Taxa de venda - Pedido #${orderId.slice(0, 8)}`,
        reference_id: fee.id,
        payment_method: 'balance'
      });
    } else {
      const currentDebt = Number(balance?.debt_amount) || 0;
      const newDebt = currentDebt + feeRate;
      
      await supabase
        .from('client_balances')
        .update({
          debt_amount: newDebt,
          debt_started_at: balance?.debt_started_at || new Date().toISOString(),
          last_fee_date: new Date().toISOString()
        })
        .eq('client_id', clientId);
    }
  } catch (error) {
    console.error('Error registering platform fee:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('DuttyFy webhook received:', JSON.stringify(payload, null, 2));

    // DuttyFy postback format: { _id: { $oid: "..." }, status: "COMPLETED"|"PENDING"|"REFUNDED", ... }
    const transactionId = payload._id?.$oid || payload._id;
    const status = payload.status?.toUpperCase();

    if (!transactionId || !status) {
      console.log('Invalid DuttyFy webhook: missing _id or status');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing DuttyFy transaction ${transactionId} with status ${status}`);

    // Find order by payment_id (which is the DuttyFy transactionId)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(*), telegram_customers(*), clients(*)')
      .eq('payment_id', transactionId)
      .single();

    if (orderError || !order) {
      console.log('Order not found for DuttyFy transaction:', transactionId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await processPaymentUpdate(order, status);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing DuttyFy webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processPaymentUpdate(order: any, status: string) {
  const orderId = order.id;
  const clientId = order.client_id;

  const { data: client } = await supabase
    .from('clients')
    .select('telegram_bot_token')
    .eq('id', clientId)
    .single();

  const { data: settings } = await supabase
    .from('client_settings')
    .select('auto_delivery')
    .eq('client_id', clientId)
    .single();

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

  // DuttyFy uses "COMPLETED" for paid status
  const isPaid = status === 'COMPLETED';

  if (isPaid) {
    console.log(`DuttyFy payment confirmed for order ${orderId}`);
    
    await supabase
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', orderId);

    await registerPlatformFee(clientId, orderId);

    // Send push notification
    try {
      const productName = product?.name || 'Produto';
      const amount = Number(order.amount).toFixed(2);
      
      await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          clientId,
          title: '💰 Nova Venda Confirmada!',
          body: `${productName} - R$ ${amount}`,
          url: '/dashboard/orders',
          orderId,
          type: 'sale',
        }),
      });
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
    }

    if (botToken && customerTelegramId) {
      const successMsg = getMessageContent('payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.');
      await sendTelegramMessage(botToken, customerTelegramId, successMsg);

      // Check fees before delivery
      if (product?.require_fees_before_delivery && product?.id) {
        const pendingFees = await getPendingFees(orderId, product.id);
        if (pendingFees.length > 0) {
          await showNextFee(botToken, customerTelegramId, orderId, pendingFees[0], pendingFees.length);
          return;
        }
      }

      // Deliver product
      let delivered = false;
      let deliveryMessages: string[] = [];

      if (product?.file_url) {
        deliveryMessages.push(`🔗 <b>Link de acesso:</b>\n${product.file_url}`);
      }

      if (product?.telegram_group_id) {
        const inviteLink = await createInviteLink(botToken, product.telegram_group_id);
        if (inviteLink) {
          deliveryMessages.push(`👥 <b>Acesso ao Grupo VIP:</b>\n${inviteLink}\n\n⚠️ <i>Link único! Expira em 5 minutos.</i>`);
        }
      }

      if (deliveryMessages.length > 0 && settings?.auto_delivery) {
        await supabase
          .from('orders')
          .update({ status: 'delivered', delivered_at: new Date().toISOString() })
          .eq('id', orderId);

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
        await sendTelegramMessage(botToken, customerTelegramId, '📦 Seu produto será entregue em breve pelo vendedor.', {
          inline_keyboard: [[{ text: '🛍️ Ver Mais Produtos', callback_data: 'products' }]]
        });
      }
    }

    // Log
    if (customerTelegramId) {
      await supabase.from('telegram_messages').insert({
        client_id: clientId,
        customer_id: order.customer_id,
        telegram_chat_id: customerTelegramId,
        direction: 'outgoing',
        message_type: 'text',
        message_content: '[Sistema] Pagamento confirmado via DuttyFy webhook',
      });
    }
  } else if (status === 'REFUNDED') {
    console.log(`DuttyFy refund for order ${orderId}`);
    
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
