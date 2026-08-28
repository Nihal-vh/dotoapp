"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { savePushSubscriptionAction, testPushNotificationAction, checkAndTriggerDueRemindersAction } from "@/features/reminders/actions";

interface PwaContextType {
  isRegistered: boolean;
  notificationPermission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isInstallable: boolean;
  installApp: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  sendTestPush: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isRegistered: false,
  notificationPermission: "unsupported",
  isSubscribed: false,
  isInstallable: false,
  installApp: async () => {},
  requestPushPermission: async () => false,
  sendTestPush: async () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

// Convert VAPID base64 public key to Uint8Array for browser push manager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // 1. Register Service Worker & Check Notification Status
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          setIsRegistered(true);

          // Check if already subscribed to push
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
          }
        })
        .catch((err) => {
          console.error("Service worker registration error:", err);
        });
    }

    // Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // 2. Client-side periodic reminder check (every 45s while browser/tab is active)
  useEffect(() => {
    if (notificationPermission !== "granted") return;

    const interval = setInterval(async () => {
      try {
        await checkAndTriggerDueRemindersAction();
      } catch {
        // silent catch for background poll
      }
    }, 45000);

    // Also run immediately on initial grant
    checkAndTriggerDueRemindersAction().catch(() => {});

    return () => clearInterval(interval);
  }, [notificationPermission]);

  // 3. Request Push Permission & Subscribe
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Push notifications are not supported by your browser.");
      return false;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== "granted") {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      const rawKey = subscription.getKey ? subscription.getKey("p256dh") : null;
      const rawAuth = subscription.getKey ? subscription.getKey("auth") : null;

      const p256dh = rawKey
        ? btoa(String.fromCharCode(...new Uint8Array(rawKey)))
        : "";
      const auth = rawAuth
        ? btoa(String.fromCharCode(...new Uint8Array(rawAuth)))
        : "";

      await savePushSubscriptionAction({
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Failed to subscribe for push notifications:", err);
      return false;
    }
  }, []);

  // 4. Send Test Notification
  const sendTestPush = useCallback(async () => {
    try {
      await testPushNotificationAction();
    } catch (err) {
      console.error("Failed to send test push:", err);
    }
  }, []);

  // 5. Install PWA Prompt Trigger
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return (
    <PwaContext.Provider
      value={{
        isRegistered,
        notificationPermission,
        isSubscribed,
        isInstallable,
        installApp,
        requestPushPermission,
        sendTestPush,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
