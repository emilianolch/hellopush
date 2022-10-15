const key = document.querySelector("meta[name=vapid_public_key]").content;
const endpointField = document.getElementById("endpoint");

async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register(
    "/service-worker.js"
  );
  const serviceWorker =
    registration.installing || registration.waiting || registration.active;

  console.log("Service worker registered.");

  if (serviceWorker.state === "activated") {
    return registration;
  }

  return new Promise((resolve) => {
    serviceWorker.addEventListener("statechange", (event) => {
      if (event.target.state === "activated") {
        resolve(registration);
      }
    });
  });
}

async function subscribeUserToPush(registration) {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
  console.log("Received PushSubscription: ", JSON.stringify(subscription));
  endpointField.value = subscription.endpoint;
  return subscription;
}

async function sendSubscriptionToBackEnd(subscription) {
  const response = await fetch("/notifications/save_subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  if (!response.ok) {
    throw new Error("Bad status code from server.");
  }
  console.log("Subscription sent to backend server.");
}

export const push = {
  init: async () => {
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      console.log("Push notifications are not supported on this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("We weren't granted permission to send notifications.");
      return;
    }

    try {
      registerServiceWorker()
        .then(subscribeUserToPush)
        .then(sendSubscriptionToBackEnd);
    } catch (err) {
      console.error(err.message);
    }
  },
};
