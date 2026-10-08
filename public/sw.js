// Service Worker for GhostMsg Web Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "New Anonymous Message! 👻";
    const options = {
      body: payload.body || "Someone left a new message on your profile.",
      icon: payload.icon || "/favicon.ico",
      badge: payload.badge || "/favicon.ico",
      data: {
        url: payload.url || "/dashboard",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("New Anonymous Message! 👻", {
        body: text,
        icon: "/favicon.ico",
        data: { url: "/dashboard" },
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
