import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export const isNativeApp = () => Capacitor.isNativePlatform();

export async function registerNativePushNotifications(clientId: string): Promise<string | null> {
  if (!isNativeApp()) {
    console.log('Not running on native platform');
    return null;
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Register with APNs/FCM
    await PushNotifications.register();

    // Get the token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);

        // Save token to database
        const { error } = await supabase.from('push_subscriptions').upsert(
          {
            client_id: clientId,
            endpoint: token.value,
            p256dh: 'native-ios',
            auth: 'native-ios',
            user_agent: `Capacitor/${Capacitor.getPlatform()}`,
          },
          { onConflict: 'client_id,endpoint' }
        );

        if (error) {
          console.error('Error saving native push token:', error);
        }

        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration failed:', err.error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export function setupNativePushListeners(
  onNotificationReceived?: (notification: any) => void,
  onNotificationTapped?: (notification: any) => void
) {
  if (!isNativeApp()) return;

  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Notification tapped
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification);
    onNotificationTapped?.(notification.notification);
  });
}

export async function unregisterNativePushNotifications(clientId: string): Promise<boolean> {
  if (!isNativeApp()) return true;

  try {
    await PushNotifications.unregister();

    // Remove from database
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('client_id', clientId)
      .like('user_agent', 'Capacitor/%');

    return true;
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
    return false;
  }
}
