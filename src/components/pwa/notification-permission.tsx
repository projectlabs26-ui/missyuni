"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";

export function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!("Notification" in window)) return;

    setPermission(Notification.permission);

    // Show prompt if not decided yet
    const dismissed = localStorage.getItem("notification-dismissed");
    if (!dismissed && Notification.permission === "default") {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }
  }, []);

  const handleAllow = async () => {
    if (!("Notification" in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    setShowPrompt(false);

    if (result === "granted") {
      console.log("[PWA] Notification permission granted");
      // Register for push notifications
      registerPushSubscription();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification-dismissed", "true");
  };

  const registerPushSubscription = async () => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      console.log("[PWA] Push subscription registered");
    } catch (error) {
      console.error("[PWA] Push subscription failed:", error);
    }
  };

  if (!showPrompt || permission !== "default") return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-sm">Aktifkan Notifikasi</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Dapatkan info pengumuman & live event terbaru!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAllow}
            className="btn-primary text-sm py-2 px-4 flex-1 flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Aktifkan
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm py-2 px-4 text-text-muted hover:bg-gray-50 rounded-xl transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
