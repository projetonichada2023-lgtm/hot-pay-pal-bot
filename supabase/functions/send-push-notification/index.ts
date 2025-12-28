import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// VAPID keys (public is safe, private is stored as secret)
const VAPID_PUBLIC_KEY =
  "BPUPilrcKHoRiAcJ_dkNExn92GpWOSGAcGWLczltlPG5nfcZ9MkT9jh5HWUg-MtTjMwKVFY8vnuEO1YDKN-m160";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = "mailto:contato@telegateway.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface PushPayload {
  clientId: string;
  title: string;
  body: string;
  url?: string;
  orderId?: string;
  type?: "sale" | "order" | "delivery" | "general";
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

function decodeBase64Url(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildVapidJwks(): webpush.ExportedVapidKeys {
  if (!VAPID_PRIVATE_KEY) throw new Error("VAPID_PRIVATE_KEY missing");

  const pubRaw = decodeBase64Url(VAPID_PUBLIC_KEY);
  if (pubRaw.length !== 65 || pubRaw[0] !== 4) {
    throw new Error(
      `Unexpected VAPID public key raw format (len=${pubRaw.length}, first=${pubRaw[0]})`,
    );
  }

  const x = encodeBase64Url(pubRaw.slice(1, 33));
  const y = encodeBase64Url(pubRaw.slice(33, 65));

  const dBytes = decodeBase64Url(VAPID_PRIVATE_KEY);
  const d = encodeBase64Url(dBytes);

  return {
    publicKey: {
      kty: "EC",
      crv: "P-256",
      x,
      y,
      ext: true,
    },
    privateKey: {
      kty: "EC",
      crv: "P-256",
      x,
      y,
      d,
      ext: false,
    },
  };
}

let appServer: webpush.ApplicationServer | null = null;
try {
  const vapidKeys = await webpush.importVapidKeys(buildVapidJwks(), {
    extractable: false,
  });

  appServer = await webpush.ApplicationServer.new({
    contactInformation: VAPID_SUBJECT,
    vapidKeys,
  });

  console.log("Web Push server ready");
} catch (e) {
  console.error("Web Push init failed:", e);
}

async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status?: number; error?: string; gone?: boolean }> {
  if (!appServer) {
    return { ok: false, error: "Push server not initialized" };
  }

  try {
    const subscriber = appServer.subscribe({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    });

    // Topic must be max 32 chars from Base64url alphabet (A-Za-z0-9-_)
    // Replace any non-compliant chars and truncate
    const rawTopic = String(payload.tag ?? "tg-notif");
    const topic = rawTopic.replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 32);
    
    await subscriber.pushTextMessage(JSON.stringify(payload), {
      ttl: 60 * 60 * 24,
      urgency: webpush.Urgency.High,
      topic,
    });

    return { ok: true, status: 201 };
  } catch (e) {
    if (e instanceof webpush.PushMessageError) {
      console.error("PushMessageError:", e.toString());
      return {
        ok: false,
        status: e.response.status,
        error: e.toString(),
        gone: e.isGone(),
      };
    }

    console.error("Push send error:", e);
    return { ok: false, error: String(e) };
  }
}

async function getTemplate(eventType: string): Promise<{ title: string; body: string; icon: string; is_active: boolean } | null> {
  const { data } = await supabase
    .from("notification_templates")
    .select("title, body, icon, is_active")
    .eq("event_type", eventType)
    .maybeSingle();
  
  return data;
}

function replacePlaceholders(text: string, data: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Push request:", { clientId: payload.clientId, type: payload.type });

    if (!appServer) {
      return new Response(
        JSON.stringify({ success: false, reason: "Push server not initialized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { clientId, type, orderId, url, amount, product, customer } = payload;
    let { title, body, icon } = payload;

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: clientId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch template from database if type is provided and no custom title/body
    if (type && (!title || !body)) {
      const template = await getTemplate(type);
      if (template) {
        if (!template.is_active) {
          console.log(`Notification type '${type}' is disabled`);
          return new Response(
            JSON.stringify({ success: false, reason: `Notification type '${type}' is disabled` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        
        const placeholders = {
          amount: amount || "R$ 0,00",
          product: product || "Produto",
          customer: customer || "Cliente",
        };
        
        title = title || replacePlaceholders(template.title, placeholders);
        body = body || replacePlaceholders(template.body, placeholders);
        icon = icon || template.icon;
      }
    }

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, body (or valid type)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: settings } = await supabase
      .from("client_settings")
      .select("push_notifications_enabled")
      .eq("client_id", clientId)
      .single();

    if (!settings?.push_notifications_enabled) {
      console.log("Push disabled for client:", clientId);
      return new Response(
        JSON.stringify({ success: false, reason: "Push notifications not enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("client_id", clientId);

    if (error || !subscriptions?.length) {
      console.log("No subscriptions for client:", clientId);
      return new Response(
        JSON.stringify({ success: false, reason: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pushPayload = {
      title,
      body,
      url: url || "/dashboard/orders",
      orderId,
      type: type || "general",
      icon: icon || "/pwa-192x192.png",
      tag: `telegateway-${(type || "notification").replace(/_/g, "-")}`,
      requireInteraction: type === "sale",
    };

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const res = await sendPushToSubscription(sub, pushPayload);
      if (res.ok) {
        sent++;
      } else {
        failed++;
        if (res.gone || res.status === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          console.log("Removed stale subscription");
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subscriptions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-push-notification error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
