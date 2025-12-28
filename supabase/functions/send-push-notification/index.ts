import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// VAPID keys for Web Push
const VAPID_PUBLIC_KEY = 'BCvB8Lm8zWVWEK4lCmLkqaK5X7bJQM8XK8_3X9rN1zH2qQD7kZ5nM3bWvU6xW8qY4rP2sL9jH3gF0cB7aE2dN1k';
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

// Base64 URL encoding helper
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create JWT for VAPID
async function createVapidJwt(audience: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import private key
  const privateKeyBytes = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    encoder.encode(unsignedToken)
  );
  
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification to a single subscription
async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object
): Promise<boolean> {
  try {
    console.log('Sending push to:', subscription.endpoint);
    
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    // For now, use a simple fetch without VAPID signature
    // In production, you'd need proper web-push library or implementation
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'high',
        'Authorization': `vapid t=${await createVapidJwt(audience)}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Push failed:', response.status, await response.text());
      
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
    console.log('Push notification request:', payload);

    const { clientId, title, body, url, orderId, type, icon, tag, requireInteraction } = payload;

    if (!clientId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if push notifications are enabled for this client
    const { data: settings } = await supabase
      .from('client_settings')
      .select('push_notifications_enabled')
      .eq('client_id', clientId)
      .single();

    if (!settings?.push_notifications_enabled) {
      console.log('Push notifications not enabled for client:', clientId);
      return new Response(
        JSON.stringify({ success: false, reason: 'Push notifications not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all subscriptions for this client
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('client_id', clientId);

    if (error || !subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for client:', clientId);
      return new Response(
        JSON.stringify({ success: false, reason: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
