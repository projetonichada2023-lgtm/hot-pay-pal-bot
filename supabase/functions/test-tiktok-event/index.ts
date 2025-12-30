import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, telegram_bot_username')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get TikTok settings
    const { data: settings, error: settingsError } = await supabase
      .from('client_settings')
      .select('tiktok_pixel_code, tiktok_access_token, tiktok_tracking_enabled, tiktok_test_event_code')
      .eq('client_id', client.id)
      .single();

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: 'Settings not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!settings.tiktok_pixel_code || !settings.tiktok_access_token) {
      return new Response(JSON.stringify({ 
        error: 'TikTok Pixel não configurado',
        details: 'Configure o Pixel Code e Access Token primeiro'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send test event to TikTok
    const eventId = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);

    const eventData = {
      event: 'ClickButton',
      event_id: eventId,
      event_time: timestamp,
      user: {
        external_id: `test_${user.id}`,
      },
      page: {
        url: `https://t.me/${client.telegram_bot_username || 'test'}`,
      },
      properties: {
        currency: 'BRL',
        content_name: 'TESTE_LOVABLE',
        content_type: 'product',
      },
    };

    const requestBody: any = {
      event_source: 'web',
      event_source_id: settings.tiktok_pixel_code,
      data: [eventData],
    };

    // Add test_event_code if configured
    if (settings.tiktok_test_event_code) {
      requestBody.test_event_code = settings.tiktok_test_event_code;
      console.log('Using Test Event Code:', settings.tiktok_test_event_code);
    }

    console.log('Sending test event to TikTok:', JSON.stringify(requestBody));

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': settings.tiktok_access_token,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('TikTok API response:', response.status, JSON.stringify(result));

    return new Response(JSON.stringify({
      success: response.ok && result.code === 0,
      status: response.status,
      tiktok_response: result,
      event_sent: eventData,
      pixel_code: settings.tiktok_pixel_code,
      test_event_code: settings.tiktok_test_event_code || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error testing TikTok event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
