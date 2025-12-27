import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  console.log(`Sending message to chat ${chatId}: ${text.substring(0, 50)}...`);
  
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  const data = await res.json();
  console.log('Telegram API response:', JSON.stringify(data));
  
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${data?.description || 'Unknown error'}`);
  }
  
  return data;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const { clientId, chatId, customerId, message } = await req.json();

    if (!clientId || !chatId || !message) {
      throw new Error('Missing required fields: clientId, chatId, message');
    }

    console.log(`User ${user.id} sending message to chat ${chatId} for client ${clientId}`);

    // Verify the user owns this client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id, telegram_bot_token')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (client.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this client');
    }

    if (!client.telegram_bot_token) {
      throw new Error('Bot token not configured for this client');
    }

    // Send the message via Telegram
    const result = await sendTelegramMessage(client.telegram_bot_token, chatId, message);

    // Save the message to the database
    const { error: insertError } = await supabase
      .from('telegram_messages')
      .insert({
        client_id: clientId,
        customer_id: customerId || null,
        telegram_chat_id: chatId,
        telegram_message_id: result.result?.message_id || null,
        direction: 'outgoing',
        message_type: 'text',
        message_content: message,
      });

    if (insertError) {
      console.error('Error saving message to database:', insertError);
      // Don't throw - message was sent successfully
    }

    console.log('Message sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: result.result?.message_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
