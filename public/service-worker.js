self.addEventListener("push", function (event) {
  const message = event.data.json();
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: message.icon,
    })
  );
});
