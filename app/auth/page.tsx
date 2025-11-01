"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { redirect } from "next/dist/client/components/navigation";
import { useConvexAuth } from "convex/react";
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { signIn } = useAuthActions();

  const { isAuthenticated } = useConvexAuth();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useLayoutEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-sky-50 to-white p-6">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-md">
        <h1 className="mb-2 text-2xl font-semibold text-slate-800">
          {flow === "signIn" ? "Sign in" : "Create account"}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {flow === "signIn"
            ? "Welcome back — enter your email and password to sign in."
            : "Create a new account to start shopping."}
        </p>

        <form
          className="flex flex-col"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            const formData = new FormData(event.currentTarget);

            await signIn("password", formData)
              .then(() => {
                const email = formData.get("email") as string | null;
                toast.success(
                  flow === "signIn"
                    ? `Signed in${email ? ` as ${email}` : ""}`
                    : `Signup link sent${email ? ` to ${email}` : ""}`,
                );
              })
              .catch((error) => {
                console.error(error);
                let message = "Something went wrong. Please try again.";
                if (error instanceof ConvexError && (error as any).data) {
                  // attempt to show a helpful error if available
                  message = (error as any).data || message;
                }
                toast.error(message);
              })
              .finally(() => setSubmitting(false));
          }}
        >
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 mb-4 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            {flow === "signIn" ? (
              <button
                type="button"
                onClick={() =>
                  toast(
                    "Password reset is supported via email — enter your email and click Reset below.",
                  )
                }
                className="text-sm text-sky-600 hover:underline"
              >
                Forgot?
              </button>
            ) : null}
          </div>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={
              flow === "signIn" ? "current-password" : "new-password"
            }
            className="mt-1 mb-2 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />

          <input name="flow" value={flow} type="hidden" />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting
              ? "Working..."
              : flow === "signIn"
                ? "Sign in"
                : "Sign up"}
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="mt-3 text-sm text-slate-600 hover:underline"
          >
            {flow === "signIn"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </form>

        <hr className="my-6 border-slate-100" />

        <p className="text-sm text-slate-500">
          Or sign in with a provider (coming soon)
        </p>
      </div>
    </main>
  );
}
