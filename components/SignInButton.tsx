"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function SignInButton() {
  const { signIn } = useAuthActions();

  return (
    <button
      type="submit"
      onClick={() => {
        void signIn("password");
      }}
    >
      Sign in
    </button>
  );
}
