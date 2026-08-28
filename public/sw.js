// DOTO Service Worker - PWA & Web Push Notification Handler
const CACHE_NAME = "doto-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/todos",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
];

// 1. Install & pre-cache critical shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate & cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Strategy: Network First with Cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET or cross-origin requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // API, dynamic auth or server actions should always be fresh from network
  if (request.url.includes("/api/") || request.headers.get("RSC") === "1") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});

// 4. Push Notification Event Listener
self.addEventListener("push", (event) => {
  let data = {
    title: "DOTO Reminder",
    body: "You have a scheduled task reminder!",
    url: "/todos",
    tag: "doto-reminder-" + Date.now(),
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-192x192.png",
    tag: data.tag || "doto-notification",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/todos",
      id: data.id,
      timestamp: Date.now(),
    },
    actions: [
      { action: "view", title: "Open Task" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event Listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/todos";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          if ("navigate" in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Message handler
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
