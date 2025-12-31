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

    const timestamp = Math.floor(Date.now() / 1000);
    const testUserId = `test_${user.id.substring(0, 8)}`;
    const botUrl = `https://t.me/${client.telegram_bot_username || 'test'}`;
    
    // Define all events to send
    const eventsToSend = [
      {
        event: 'ClickButton',
        event_id: `test_click_${Date.now()}`,
        event_time: timestamp,
        user: { external_id: testUserId },
        page: { url: botUrl },
        properties: {
          currency: 'BRL',
          content_name: 'TESTE_LOVABLE',
          content_type: 'product',
        },
      },
      {
        event: 'ViewContent',
        event_id: `test_view_${Date.now()}`,
        event_time: timestamp,
        user: { external_id: testUserId },
        page: { url: botUrl },
        properties: {
          currency: 'BRL',
          content_name: 'Produto Teste',
          content_type: 'product',
          value: 97.00,
          contents: [{ content_id: 'test_product', content_name: 'Produto Teste', price: 97.00 }],
        },
      },
      {
        event: 'InitiateCheckout',
        event_id: `test_checkout_${Date.now()}`,
        event_time: timestamp,
        user: { external_id: testUserId },
        page: { url: botUrl },
        properties: {
          currency: 'BRL',
          content_name: 'Produto Teste',
          content_type: 'product',
          value: 97.00,
          contents: [{ content_id: 'test_product', content_name: 'Produto Teste', price: 97.00 }],
        },
      },
      {
        event: 'CompletePayment',
        event_id: `test_payment_${Date.now()}`,
        event_time: timestamp,
        user: { external_id: testUserId },
        page: { url: botUrl },
        properties: {
          currency: 'BRL',
          content_name: 'Produto Teste',
          content_type: 'product',
          value: 97.00,
          contents: [{ content_id: 'test_product', content_name: 'Produto Teste', price: 97.00, quantity: 1 }],
        },
      },
    ];

    const results: any[] = [];

    // Send each event
    for (const eventData of eventsToSend) {
      const requestBody: any = {
        event_source: 'web',
        event_source_id: settings.tiktok_pixel_code,
        data: [eventData],
      };

      // Add test_event_code if configured
      if (settings.tiktok_test_event_code) {
        requestBody.test_event_code = settings.tiktok_test_event_code;
      }

      console.log(`Sending ${eventData.event} test event to TikTok:`, JSON.stringify(requestBody));

      const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': settings.tiktok_access_token,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log(`TikTok ${eventData.event} API response:`, response.status, JSON.stringify(result));

      results.push({
        event: eventData.event,
        event_id: eventData.event_id,
        success: response.ok && result.code === 0,
        status: response.status,
        response: result,
      });
    }

    const allSuccess = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    return new Response(JSON.stringify({
      success: allSuccess,
      message: allSuccess 
        ? `✅ ${successCount} eventos enviados com sucesso!` 
        : `⚠️ ${successCount}/${results.length} eventos enviados`,
      events: results,
      pixel_code: settings.tiktok_pixel_code,
      test_event_code: settings.tiktok_test_event_code || null,
      test_mode: !!settings.tiktok_test_event_code,
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
