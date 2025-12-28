// Service Worker for Push Notifications
// This file handles push notifications when the app is in background

self.addEventListener('push', function(event) {
  console.log('[SW] Push notification received:', event);
  
  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'TeleGateway',
      body: event.data.text(),
      icon: '/pwa-192x192.png',
    };
  }

  const options = {
    body: data.body || 'Nova notificação',
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'telegateway-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/dashboard',
      orderId: data.orderId,
      type: data.type,
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver Detalhes',
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TeleGateway', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Try to focus an existing window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.focus();
            if (event.notification.data?.orderId) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                orderId: event.notification.data.orderId,
              });
            }
            return;
          }
        }
        // If no window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed:', event);
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[SW] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        // Send new subscription to server
        return fetch('/api/update-push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
  );
});
