import { supabase } from "@/integrations/supabase/client";

// VAPID public key - this is safe to be public
// The private key is stored as a Supabase secret
const VAPID_PUBLIC_KEY = 'BCvB8Lm8zWVWEK4lCmLkqaK5X7bJQM8XK8_3X9rN1zH2qQD7kZ5nM3bWvU6xW8qY4rP2sL9jH3gF0cB7aE2dN1k';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

export async function subscribeToPush(
  clientId: string
): Promise<PushSubscription | null> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    console.log('Push subscription:', subscription);

    // Save to database
    const subscriptionJson = subscription.toJSON();
    
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        client_id: clientId,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: 'client_id,endpoint' }
    );

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }

    // Update client settings
    const { data: settings } = await supabase
      .from('client_settings')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (settings) {
      await supabase
        .from('client_settings')
        .update({ push_notifications_enabled: true } as any)
        .eq('id', settings.id);
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

export async function unsubscribeFromPush(clientId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return true;

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('client_id', clientId)
        .eq('endpoint', subscription.endpoint);
    }

    // Update client settings
    const { data: settings } = await supabase
      .from('client_settings')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (settings) {
      await supabase
        .from('client_settings')
        .update({ push_notifications_enabled: false } as any)
        .eq('id', settings.id);
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
}

export async function checkPushSupport(): Promise<{
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
}> {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  
  if (!supported) {
    return { supported: false, permission: 'unsupported', subscribed: false };
  }

  const permission = Notification.permission;
  
  let subscribed = false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      subscribed = !!subscription;
    }
  } catch (e) {
    console.error('Error checking subscription:', e);
  }

  return { supported, permission, subscribed };
}

export async function sendTestNotification(): Promise<void> {
  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification('TeleGateway', {
        body: '🎉 Notificações ativadas com sucesso!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
      });
    }
  }
}
