import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generate a short alphanumeric code (URL-safe, 10-12 chars)
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Extract ttclid from TikTok URL or raw value
function extractTtclid(input: string): string {
  // If it's a URL, extract the ttclid parameter
  if (input.includes('ttclid=')) {
    const match = input.match(/ttclid=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  // Otherwise, assume it's the raw ttclid value
  return input;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ttclid, campaign, client_id, utm_source = 'tiktok', utm_medium = 'cpc' } = await req.json();

    if (!ttclid) {
      return new Response(
        JSON.stringify({ error: 'ttclid is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!client_id) {
      return new Response(
        JSON.stringify({ error: 'client_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract clean ttclid from URL or raw value
    const cleanTtclid = extractTtclid(ttclid);

    // Check if this ttclid already has a mapping for this client
    const { data: existingMapping } = await supabase
      .from('ttclid_mappings')
      .select('short_code')
      .eq('client_id', client_id)
      .eq('ttclid', cleanTtclid)
      .maybeSingle();

    let shortCode: string = '';

    if (existingMapping) {
      // Reuse existing short code
      shortCode = existingMapping.short_code;
      console.log('Reusing existing short code:', shortCode);
    } else {
      // Generate a new unique short code
      let attempts = 0;
      const maxAttempts = 10;
      let created = false;
      
      while (attempts < maxAttempts && !created) {
        const candidateCode = generateShortCode();
        
        // Try to insert (will fail if short_code already exists due to unique constraint)
        const { error: insertError } = await supabase
          .from('ttclid_mappings')
          .insert({
            client_id,
            short_code: candidateCode,
            ttclid: cleanTtclid,
            utm_source,
            utm_medium,
            utm_campaign: campaign || null,
          });

        if (!insertError) {
          shortCode = candidateCode;
          created = true;
          console.log('Created new short code:', shortCode, 'for ttclid:', cleanTtclid.substring(0, 20) + '...');
          break;
        }

        if (insertError.code === '23505') { // Unique violation
          attempts++;
          console.log('Short code collision, retrying...');
          continue;
        }

        // Other error
        throw insertError;
      }

      if (!created) {
        throw new Error('Failed to generate unique short code after maximum attempts');
      }
    }

    // Get client's bot username to build the link
    const { data: client } = await supabase
      .from('clients')
      .select('telegram_bot_username')
      .eq('id', client_id)
      .single();

    if (!client?.telegram_bot_username) {
      return new Response(
        JSON.stringify({ 
          error: 'Client bot not configured',
          short_code: shortCode,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botLink = `https://t.me/${client.telegram_bot_username}?start=${shortCode}`;

    return new Response(
      JSON.stringify({
        success: true,
        short_code: shortCode,
        bot_link: botLink,
        ttclid: cleanTtclid,
        campaign: campaign || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating TikTok link:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
