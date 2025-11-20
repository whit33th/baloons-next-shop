"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Label } from "@radix-ui/react-label";
import { ConvexError } from "convex/values";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
} from "@/components/ui/icons/icons";
import Input from "@/components/ui/input";

export default function AuthPage() {
  const { signIn } = useAuthActions();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    // Tell Convex Auth which flow this is
    formData.set("flow", flow); // "signIn" or "signUp"

    await signIn("password", formData)
      .then(() => {
        const email = formData.get("email") as string | null;
        toast.success(`Signed in${email ? ` as ${email}` : ""}`);
      })
      .catch((error) => {
        console.error(error);
        let message = "Something went wrong. Please try again.";
        if (error instanceof ConvexError) {
          const errorData = error.data;
          if (typeof errorData === "string" && errorData.length > 0) {
            message = errorData;
          }
        }
        toast.error(message);
      })
      .finally(() => setSubmitting(false));
  };
  return (
    <div className="flex min-h-[calc(100vh-56px)] w-full">
      <div className="grid w-full lg:grid-cols-2">
        {/* Left Side - Desktop: Editorial Image */}
        <div className="relative hidden h-full flex-col justify-between p-8 lg:flex">
          {/* Image Container with "Authentic" Frame */}
          <div className="relative h-full w-full overflow-hidden rounded-4xl shadow-sm">
            <Image
              src="/bg.png"
              fill
              alt="Ballon Boutique Editorial"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10" />{" "}
            {/* Very subtle overlay */}
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
              <Link
                href="/"
                className="flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Link>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent to-20% pt-4"></div>

              <div className="max-w-md space-y-4">
                <h2 className="font-serif text-4xl leading-tight font-medium tracking-tight text-white drop-shadow-sm">
                  "Turning fleeting moments into lasting memories."
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24">
          {/* Mobile Header - "Authentic" Look */}
          <div className="mb-4 flex w-full flex-col items-center space-y-6 lg:hidden">
            {/* <Link
              href="/"
              className="group text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 " />
              Back to Store
            </Link> */}

            {/* Unique Mobile Visual Element - Arch Shape */}
            <div className="relative h-48 w-40 overflow-hidden rounded-t-full shadow-md ring-4 ring-white">
              <Image
                src="/bg.png"
                width={160}
                height={192}
                alt="Ballon Boutique"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-center">
              <h3 className="text-2xl text-[#2D2A26]">Ballon Boutique</h3>
              {/* <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Est. 2025
              </p> */}
            </div>
          </div>

          <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-3xl font-medium text-[#2D2A26] md:text-4xl">
                {flow === "signIn" ? "Welcome back" : "Join the club"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {flow === "signIn"
                  ? "Please enter your details to sign in."
                  : "Create an account to start shopping."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-muted-foreground text-xs tracking-wide uppercase"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    // keep only spacing overrides — visual styling comes from Input component
                    className="px-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-muted-foreground text-xs tracking-wide uppercase"
                    >
                      Password
                    </Label>
                    {flow === "signIn" && (
                      <button
                        type="button"
                        onClick={() => toast.info("Password reset via email")}
                        className="text-xs font-medium text-[#E08E79] hover:text-[#d07d69]"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="px-4 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                className="h-12 w-full rounded-lg text-sm font-medium shadow-sm transition-all"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : flow === "signIn" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span
                    className="w-full border-t"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div className="relative flex justify-center">
                  <span className="text-muted-foreground bg-primary px-4 text-xs uppercase">
                    Or
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                  style={{
                    backgroundColor: "var(--input)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => {
                    void signIn("google"); // запускаем OAuth‑флоу
                  }}
                >
                  <GoogleIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                  style={{
                    backgroundColor: "var(--input)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => toast.info("Facebook sign in coming soon")}
                >
                  <FacebookIcon className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                  style={{
                    backgroundColor: "var(--input)",
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => toast.info("Apple sign in coming soon")}
                >
                  <AppleIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="text-center text-sm">
                {flow === "signIn" ? (
                  <p className="text-muted-foreground">
                    New to Ballon Boutique?{" "}
                    <button
                      type="button"
                      onClick={() => setFlow("signUp")}
                      className="font-medium text-[#2D2A26] underline decoration-stone-300 underline-offset-4 hover:text-black hover:decoration-black"
                    >
                      Create account
                    </button>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFlow("signIn")}
                      className="font-medium text-[#2D2A26] underline decoration-stone-300 underline-offset-4 hover:text-black hover:decoration-black"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
