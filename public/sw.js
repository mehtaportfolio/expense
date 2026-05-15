const CACHE_NAME = 'expense-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (!isSameOrigin) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline - content not available'))
    );
    return;
  }

  // Network-First for HTML/Navigation requests
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate for other assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Silently fail network update if offline
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  let data = { title: 'Expense Tracker', body: 'New notification' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Periodic Sync for local notifications (fallback)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-summary') {
    event.waitUntil(showDailySummaryNotification());
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

async function showDailySummaryNotification() {
  // This can fetch latest data from indexedDB or cache if needed
  // For now we'll just show a generic reminder to check expenses
  const options = {
    body: 'Daily Reminder: Don\'t forget to log your expenses and check your today\'s total!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'daily-reminder',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };
  return self.registration.showNotification('Expense Tracker', options);
}
