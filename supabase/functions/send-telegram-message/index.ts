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
  console.log(`Sending text message to chat ${chatId}`);
  
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
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${data?.description || 'Unknown error'}`);
  }
  return data;
}

async function sendTelegramPhoto(botToken: string, chatId: number, photoUrl: string, caption?: string) {
  console.log(`Sending photo to chat ${chatId}: ${photoUrl}`);
  
  const body: Record<string, unknown> = { 
    chat_id: chatId, 
    photo: photoUrl,
  };
  if (caption) {
    body.caption = caption;
    body.parse_mode = 'HTML';
  }
  
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('Telegram sendPhoto response:', JSON.stringify(data));
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${data?.description || 'Unknown error'}`);
  }
  return data;
}

async function sendTelegramDocument(botToken: string, chatId: number, documentUrl: string, caption?: string) {
  console.log(`Sending document to chat ${chatId}: ${documentUrl}`);
  
  const body: Record<string, unknown> = { 
    chat_id: chatId, 
    document: documentUrl,
  };
  if (caption) {
    body.caption = caption;
    body.parse_mode = 'HTML';
  }
  
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('Telegram sendDocument response:', JSON.stringify(data));
  if (!data?.ok) {
    throw new Error(`Telegram API error: ${data?.description || 'Unknown error'}`);
  }
  return data;
}

async function sendTelegramVideo(botToken: string, chatId: number, videoUrl: string, caption?: string) {
  console.log(`Sending video to chat ${chatId}: ${videoUrl}`);
  
  const body: Record<string, unknown> = { 
    chat_id: chatId, 
    video: videoUrl,
  };
  if (caption) {
    body.caption = caption;
    body.parse_mode = 'HTML';
  }
  
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('Telegram sendVideo response:', JSON.stringify(data));
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
    const { clientId, chatId, customerId, message, mediaUrl, mediaType, botId } = await req.json();

    if (!clientId || !chatId) {
      throw new Error('Missing required fields: clientId, chatId');
    }

    if (!message && !mediaUrl) {
      throw new Error('Either message or mediaUrl is required');
    }

    console.log(`User ${user.id} sending ${mediaType || 'text'} to chat ${chatId} for client ${clientId}, bot: ${botId || 'primary'}`);

    // Verify the user owns this client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    if (client.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this client');
    }

    // Get bot token - prioritize specific botId, then primary bot, then legacy client token
    let botToken: string | null = null;
    let resolvedBotId: string | null = null;

    if (botId) {
      // Use specific bot
      const { data: bot } = await supabase
        .from('client_bots')
        .select('id, telegram_bot_token')
        .eq('id', botId)
        .eq('client_id', clientId)
        .single();

      if (bot?.telegram_bot_token) {
        botToken = bot.telegram_bot_token;
        resolvedBotId = bot.id;
      }
    }

    if (!botToken) {
      // Try primary bot
      const { data: primaryBot } = await supabase
        .from('client_bots')
        .select('id, telegram_bot_token')
        .eq('client_id', clientId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      if (primaryBot?.telegram_bot_token) {
        botToken = primaryBot.telegram_bot_token;
        resolvedBotId = primaryBot.id;
      }
    }

    if (!botToken) {
      // Fallback to legacy client token
      const { data: legacyClient } = await supabase
        .from('clients')
        .select('telegram_bot_token')
        .eq('id', clientId)
        .single();

      if (legacyClient?.telegram_bot_token) {
        botToken = legacyClient.telegram_bot_token;
      }
    }

    if (!botToken) {
      throw new Error('Bot token not configured for this client');
    }

    let result;
    let savedMessageType = 'text';
    let savedContent = message || '';

    // Send based on media type
    if (mediaUrl && mediaType) {
      savedMessageType = mediaType;
      savedContent = message || `[${mediaType}]`;
      
      switch (mediaType) {
        case 'photo':
          result = await sendTelegramPhoto(botToken, chatId, mediaUrl, message);
          break;
        case 'video':
          result = await sendTelegramVideo(botToken, chatId, mediaUrl, message);
          break;
        case 'document':
        default:
          result = await sendTelegramDocument(botToken, chatId, mediaUrl, message);
          break;
      }
    } else if (message) {
      result = await sendTelegramMessage(botToken, chatId, message);
    } else {
      throw new Error('No content to send');
    }

    // Save the message to the database
    const { error: insertError } = await supabase
      .from('telegram_messages')
      .insert({
        client_id: clientId,
        customer_id: customerId || null,
        telegram_chat_id: chatId,
        telegram_message_id: result.result?.message_id || null,
        direction: 'outgoing',
        message_type: savedMessageType,
        message_content: savedContent,
        bot_id: resolvedBotId,
      });

    if (insertError) {
      console.error('Error saving message to database:', insertError);
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
