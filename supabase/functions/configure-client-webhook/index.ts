import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Support both old format (client_id, bot_token) and new format (botId)
    let botToken: string;
    let botId: string | null = null;
    let clientId: string | null = null;

    if (body.botId) {
      // New format: fetch bot from client_bots table
      botId = body.botId;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const { data: bot, error } = await supabase
        .from('client_bots')
        .select('telegram_bot_token, client_id')
        .eq('id', botId)
        .single();

      if (error || !bot) {
        throw new Error('Bot not found');
      }

      if (!bot.telegram_bot_token) {
        throw new Error('Bot token not configured');
      }

      botToken = bot.telegram_bot_token;
      clientId = bot.client_id;
    } else if (body.client_id && body.bot_token) {
      // Legacy format
      clientId = body.client_id;
      botToken = body.bot_token;
    } else {
      throw new Error('Missing botId or (client_id and bot_token)');
    }

    // Use bot_id in webhook URL when available for proper routing
    const webhookUrl = botId 
      ? `${SUPABASE_URL}/functions/v1/telegram-webhook?bot_id=${botId}`
      : `${SUPABASE_URL}/functions/v1/telegram-webhook?client_id=${clientId}`;
    
    console.log('Setting webhook for bot:', botId || clientId, 'URL:', webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      }
    );

    const result = await response.json();
    console.log('Telegram setWebhook response:', result);

    if (!result.ok) {
      throw new Error(result.description || 'Failed to set webhook');
    }

    // Update webhook status
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    if (botId) {
      // Update client_bots table
      await supabase
        .from('client_bots')
        .update({ webhook_configured: true })
        .eq('id', botId);
    } else if (clientId) {
      // Legacy: update clients table
      await supabase
        .from('clients')
        .update({ webhook_configured: true })
        .eq('id', clientId);
    }

    return new Response(
      JSON.stringify({ success: true, webhook_url: webhookUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
