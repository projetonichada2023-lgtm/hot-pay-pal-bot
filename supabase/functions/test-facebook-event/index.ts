import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client info
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return new Response(
        JSON.stringify({ success: false, error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Facebook settings
    const { data: settings, error: settingsError } = await supabase
      .from("client_settings")
      .select("facebook_pixel_id, facebook_access_token, facebook_test_event_code")
      .eq("client_id", client.id)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ success: false, error: "Settings not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { facebook_pixel_id, facebook_access_token, facebook_test_event_code } = settings;

    if (!facebook_pixel_id || !facebook_access_token) {
      return new Response(
        JSON.stringify({ success: false, error: "Facebook not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define test events to send
    const testEvents = [
      { event_name: "PageView", custom_data: {} },
      { event_name: "ViewContent", custom_data: { content_name: "Test Product", content_type: "product", currency: "BRL", value: 99.90 } },
      { event_name: "InitiateCheckout", custom_data: { content_type: "product", currency: "BRL", value: 99.90 } },
      { event_name: "Purchase", custom_data: { content_type: "product", currency: "BRL", value: 99.90 } },
    ];

    const results: any[] = [];
    const eventTime = Math.floor(Date.now() / 1000);

    for (const testEvent of testEvents) {
      const eventId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const eventPayload: any = {
        data: [
          {
            event_name: testEvent.event_name,
            event_time: eventTime,
            event_id: eventId,
            action_source: "website",
            user_data: {
              em: ["test@example.com"], // hashed email would go here in production
              client_ip_address: "127.0.0.1",
              client_user_agent: "Mozilla/5.0 (Test Event)",
            },
            custom_data: testEvent.custom_data,
          },
        ],
        access_token: facebook_access_token,
      };

      // Add test event code if in test mode
      if (facebook_test_event_code) {
        eventPayload.test_event_code = facebook_test_event_code;
      }

      console.log(`Sending ${testEvent.event_name} event to Facebook:`, JSON.stringify(eventPayload, null, 2));

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${facebook_pixel_id}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        }
      );

      const responseData = await response.json();
      console.log(`Facebook response for ${testEvent.event_name}:`, JSON.stringify(responseData, null, 2));

      results.push({
        event_name: testEvent.event_name,
        event_id: eventId,
        status: response.ok ? "success" : "error",
        response_code: response.status,
        response: responseData,
      });

      // Log the event to database
      await supabase.from("facebook_events").insert({
        client_id: client.id,
        event_type: testEvent.event_name,
        event_id: eventId,
        value: testEvent.custom_data.value || null,
        currency: testEvent.custom_data.currency || "BRL",
        api_status: response.ok ? "success" : "error",
        api_response_code: response.status,
        api_error_message: response.ok ? null : JSON.stringify(responseData),
      });
    }

    const allSuccess = results.every((r) => r.status === "success");

    return new Response(
      JSON.stringify({
        success: allSuccess,
        message: allSuccess 
          ? `${results.length} eventos de teste enviados com sucesso!` 
          : "Alguns eventos falharam",
        test_mode: !!facebook_test_event_code,
        test_event_code: facebook_test_event_code,
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in test-facebook-event:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
