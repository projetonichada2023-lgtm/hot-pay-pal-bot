import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// VAPID keys for Web Push
const VAPID_PUBLIC_KEY = 'BPUPilrcKHoRiAcJ_dkNExn92GpWOSGAcGWLczltlPG5nfcZ9MkT9jh5HWUg-MtTjMwKVFY8vnuEO1YDKN-m160';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = 'mailto:contato@telegateway.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface PushPayload {
  clientId: string;
  title: string;
  body: string;
  url?: string;
  orderId?: string;
  type?: 'sale' | 'order' | 'delivery' | 'general';
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

// Simple base64url encode
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Simple base64url decode
function base64UrlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Create unsigned JWT token
function createUnsignedJwt(audience: string): { headerPayload: string; headerB64: string; payloadB64: string } {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  
  return {
    headerPayload: `${headerB64}.${payloadB64}`,
    headerB64,
    payloadB64
  };
}

// Sign JWT with VAPID private key
async function signJwt(data: string, privateKeyBase64: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Decode the private key (it's a raw 32-byte key in base64url format)
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  
  // For ES256, we need to convert the raw private key to JWK format
  // The private key is just the "d" parameter (32 bytes)
  const privateKeyJwk = {
    kty: 'EC',
    crv: 'P-256',
    d: base64UrlEncode(privateKeyBytes),
    // We need x and y coordinates - derive from private key or use placeholder
    // For VAPID, we can compute the public key from private
    x: VAPID_PUBLIC_KEY.slice(0, 43), // First part of public key
    y: VAPID_PUBLIC_KEY.slice(43), // Second part of public key
  };

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      dataBuffer
    );

    return base64UrlEncode(new Uint8Array(signature));
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw error;
  }
}

// Send push notification using simple POST (for testing)
async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object
): Promise<boolean> {
  try {
    console.log('Attempting to send push to:', subscription.endpoint);
    
    // Web Push requires encryption - for now, let's try a simple approach
    // that works with some push services
    
    const payloadString = JSON.stringify(payload);
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    // Create VAPID JWT
    const { headerPayload } = createUnsignedJwt(audience);
    
    let vapidAuth = '';
    try {
      const signature = await signJwt(headerPayload, VAPID_PRIVATE_KEY);
      vapidAuth = `vapid t=${headerPayload}.${signature}, k=${VAPID_PUBLIC_KEY}`;
    } catch (signError) {
      console.error('Failed to sign VAPID JWT:', signError);
      // Try without proper signature for debugging
      vapidAuth = `vapid t=${headerPayload}., k=${VAPID_PUBLIC_KEY}`;
    }

    // For a proper implementation, we'd need to:
    // 1. Generate ECDH keys for encryption
    // 2. Derive shared secret with p256dh
    // 3. Encrypt payload using AES-GCM
    // 4. Add proper headers (Crypto-Key, Encryption, etc.)
    
    // Simple test without encryption (won't work for real subscriptions)
    console.log('Push payload:', payloadString);
    console.log('VAPID auth header:', vapidAuth.substring(0, 50) + '...');
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'high',
        'Authorization': vapidAuth,
      },
      // Empty body for now - proper implementation needs encrypted payload
      body: new Uint8Array(0),
    });

    const responseText = await response.text();
    console.log('Push response status:', response.status, 'body:', responseText);

    if (!response.ok) {
      console.error('Push failed with status:', response.status);
      
      // If endpoint is gone (410), remove from database
      if (response.status === 410 || response.status === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
        console.log('Removed stale subscription');
      }
      
      return false;
    }

    console.log('Push sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PushPayload = await req.json();
    console.log('Push notification request received:', JSON.stringify(payload));

    const { clientId, title, body, url, orderId, type, icon, tag, requireInteraction } = payload;

    if (!clientId || !title || !body) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check VAPID private key
    if (!VAPID_PRIVATE_KEY) {
      console.error('VAPID_PRIVATE_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, reason: 'VAPID_PRIVATE_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('VAPID private key length:', VAPID_PRIVATE_KEY.length);

    // Check if push notifications are enabled for this client
    const { data: settings, error: settingsError } = await supabase
      .from('client_settings')
      .select('push_notifications_enabled')
      .eq('client_id', clientId)
      .single();

    console.log('Client settings:', settings, 'error:', settingsError);

    if (!settings?.push_notifications_enabled) {
      console.log('Push notifications not enabled for client:', clientId);
      return new Response(
        JSON.stringify({ success: false, reason: 'Push notifications not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all subscriptions for this client
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('client_id', clientId);

    console.log('Subscriptions found:', subscriptions?.length, 'error:', subsError);

    if (subsError || !subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for client:', clientId);
      return new Response(
        JSON.stringify({ success: false, reason: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions for client ${clientId}`);

    const pushPayload = {
      title,
      body,
      url: url || '/dashboard/orders',
      orderId,
      type: type || 'general',
      icon: icon || '/pwa-192x192.png',
      tag: tag || `telegateway-${type || 'notification'}`,
      requireInteraction: requireInteraction ?? (type === 'sale'),
    };

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map(sub => sendPushToSubscription(sub, pushPayload))
    );

    const successCount = results.filter(Boolean).length;
    console.log(`Push results: ${successCount}/${subscriptions.length} succeeded`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing push request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
