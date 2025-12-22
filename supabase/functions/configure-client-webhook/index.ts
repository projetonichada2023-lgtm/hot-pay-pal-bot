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
    const { client_id, bot_token } = await req.json();

    if (!client_id || !bot_token) {
      throw new Error('Missing client_id or bot_token');
    }

    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook?client_id=${client_id}`;
    
    console.log('Setting webhook for client:', client_id, 'URL:', webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${bot_token}/setWebhook`,
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

    // Update client webhook status
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase
      .from('clients')
      .update({ webhook_configured: true })
      .eq('id', client_id);

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
