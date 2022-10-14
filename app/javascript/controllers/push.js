const key =
  "BP10vx0EjbYClAyHTX-Bv95jW-c-HacJxgLqd1ZcfLmAMsGd94fD5cgqi68dYMrGxSc_dzBvL6sN2XsPQTzB3tE";

function subscribeUserToPush() {
  return navigator.serviceWorker
    .register("/service-worker.js")
    .then(function (registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: key,
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function (pushSubscription) {
      console.log(
        "Received PushSubscription: ",
        JSON.stringify(pushSubscription)
      );
      return pushSubscription;
    });
}

export const push = {
  init: async () => {
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      console.log("Push notifications are not supported on this browser.");
      return;
    }

    Notification.requestPermission().then((permissionResult) => {
      if (permissionResult !== "granted") {
        console.log("We weren't granted permission to send notifications.");
        return;
      }
      subscribeUserToPush();
    });
  },
};
