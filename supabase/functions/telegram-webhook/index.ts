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

async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: object) {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function getClientMessage(clientId: string, messageType: string): Promise<string> {
  const { data } = await supabase
    .from('bot_messages')
    .select('message_content')
    .eq('client_id', clientId)
    .eq('message_type', messageType)
    .eq('is_active', true)
    .single();
  
  return data?.message_content || '';
}

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

    // Handle /start
    if (update.message?.text?.startsWith('/start')) {
      const welcomeMessage = await getClientMessage(clientId, 'welcome');
      await sendTelegramMessage(botToken, update.message.chat.id, welcomeMessage || 'Bem-vindo!', {
        inline_keyboard: [[{ text: '🛍️ Ver Produtos', callback_data: 'products' }]]
      });
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
