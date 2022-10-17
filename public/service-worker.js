self.addEventListener("push", (event) => {
  const message = event.data.json();
  event.waitUntil(
    self.registration.showNotification(message.title, message.options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        includeUncontrolled: true,
      });

      if (allClients.length > 0) {
        allClients[0].focus();
      } else {
        await clients.openWindow("/");
      }
    })()
  );
});
