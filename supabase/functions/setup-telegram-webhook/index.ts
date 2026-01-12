import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { botId } = await req.json();

    if (!botId) {
      throw new Error('botId is required');
    }

    console.log('Setting up webhook for bot:', botId);

    // Create Supabase client with auth header
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    // Get bot token from client_bots table
    const { data: bot, error: botError } = await supabase
      .from('client_bots')
      .select('id, telegram_bot_token, client_id')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      console.error('Bot not found:', botError);
      throw new Error('Bot not found');
    }

    if (!bot.telegram_bot_token) {
      throw new Error('Bot token not configured for this bot');
    }

    // Use bot_id in the webhook URL instead of client_id
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook?bot_id=${botId}`;
    
    console.log('Setting webhook to:', webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${bot.telegram_bot_token}/setWebhook`,
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

    // Update bot webhook_configured status
    const { error: updateError } = await supabase
      .from('client_bots')
      .update({ webhook_configured: true })
      .eq('id', botId);

    if (updateError) {
      console.error('Error updating webhook_configured:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook configured successfully!',
        webhook_url: webhookUrl,
        telegram_response: result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error setting webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
