"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton({ className = "" }: { className?: string }) {
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`bg-accent text-on-accent inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold tracking-widest uppercase shadow-md transition hover:brightness-95 ${className}`}
    >
      Sign out
    </button>
  );
}
