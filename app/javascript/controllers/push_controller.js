import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="push"
export default class extends Controller {
  static values = {
    vapidPublicKey: String,
  };
  static targets = ["endpointField", "sendButton", "messages"];

  async subscribe(event) {
    event.preventDefault();

    const log = (message) => {
      this.messagesTarget.textContent += `${message}\n`;
    };

    const registerServiceWorker = async () => {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      const serviceWorker =
        registration.installing || registration.waiting || registration.active;

      if (serviceWorker.state === "activated") {
        log("Service worker registered and activated");
        return registration;
      }

      return new Promise((resolve) => {
        serviceWorker.addEventListener("statechange", (event) => {
          if (event.target.state === "activated") {
            log("Service worker registered and activated");
            resolve(registration);
          }
        });
      });
    };

    const subscribeUserToPush = async (registration) => {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidPublicKeyValue,
      });
      log("Received subscription from push service");
      return subscription;
    };

    const sendSubscriptionToBackEnd = async (subscription) => {
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
      log("Subscription sent to backend server");
      return subscription;
    };

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return log("We weren't granted permission");
    }

    registerServiceWorker()
      .then(subscribeUserToPush)
      .then(sendSubscriptionToBackEnd)
      .then((subscription) => {
        this.endpointFieldTarget.value = subscription.endpoint;
        this.sendButtonTarget.disabled = false;
      });
  }
}
