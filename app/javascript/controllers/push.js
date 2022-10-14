const key = document.querySelector("meta[name=vapid_public_key]").content;

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
    })
    .then(sendSubscriptionToBackEnd);
}

function sendSubscriptionToBackEnd(subscription) {
  return fetch("/notifications/save_subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("Bad status code from server.");
    }
    console.log("Subscription sent to backend server.");
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
