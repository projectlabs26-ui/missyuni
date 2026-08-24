"use client";

import { LogOut } from "lucide-react";

export function LogoutButton({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  function handleLogout() {
    // Clear session cookie
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
    // Navigate to home
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${className}`}
    >
      <LogOut className="w-5 h-5 shrink-0" />
      {showLabel && <span>Logout</span>}
    </button>
  );
}
