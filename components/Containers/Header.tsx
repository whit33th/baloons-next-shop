"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Menu, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { api } from "../../convex/_generated/api";
import IconButton from "../ui/icon-button";
import { Route } from "next";
import { useEffect, useRef } from "react";
import { mapGuestCartForImport, useGuestCart } from "@/lib/guestCart";

export function Header() {
  const cartTotal = useQuery(api.cart.getTotal);
  const user = useQuery(api.auth.loggedInUser);
  const {
    items: guestItems,
    totalCount: guestItemCount,
    initialized: guestCartReady,
    clear: clearGuestCart,
  } = useGuestCart();
  const isAuthenticated = Boolean(user);
  const importGuestCart = useMutation(api.cart.importGuestItems);
  const importInFlight = useRef(false);
  const badgeCount = isAuthenticated
    ? (cartTotal?.itemCount ?? 0)
    : guestItemCount;

  useEffect(() => {
    if (!guestCartReady || !isAuthenticated || guestItems.length === 0) {
      importInFlight.current = false;
      return;
    }

    if (importInFlight.current) {
      return;
    }

    importInFlight.current = true;

    const run = async () => {
      try {
        await importGuestCart({
          items: mapGuestCartForImport(guestItems),
        });
        clearGuestCart();
      } catch (error) {
        console.error("Failed to import guest cart", error);
      } finally {
        importInFlight.current = false;
      }
    };

    void run();
  }, [
    guestCartReady,
    isAuthenticated,
    guestItems,
    importGuestCart,
    clearGuestCart,
  ]);

  const navLinks: {
    href: Route;
    label: string;
  }[] = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
  ];
  return (
    <header className="bg-primary/95 sticky top-0 z-50 grid w-full grid-cols-3 border-b py-2 backdrop-blur-sm">
      <nav className="flex items-center justify-self-start px-4 sm:px-8">
        <button className="block gap-4 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <ul className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-deep text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-80"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="text-deep flex items-center text-xl font-semibold tracking-tight"
        >
          UP&UP
        </Link>
      </div>

      <div className="flex items-center gap-3 justify-self-end px-1 sm:px-3">
        <AuthAction />
        <Link href="/cart" className="relative">
          <IconButton Icon={ShoppingBag} />
          {badgeCount > 0 && (
            <span className="bg-accent text-on-accent absolute top-0 right-1 flex min-h-[1.2rem] min-w-[1.2rem] translate-x-1/2 items-center justify-center rounded-full px-1 py-0.5 text-[0.7rem]">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

function AuthAction() {
  return (
    <>
      <Authenticated>
        <div className="flex items-center space-x-2">
          <Link href="/profile">
            <IconButton Icon={User} />
          </Link>
        </div>
      </Authenticated>
      <Unauthenticated>
        <Link
          href="/auth"
          className="flex gap-1 text-sm font-medium text-black transition-colors hover:opacity-70"
        >
          <div className="block sm:hidden">
            <IconButton Icon={User} />
          </div>
          <span className="hidden h-10 w-auto items-center justify-center px-3 sm:flex">
            Log In
          </span>
        </Link>
      </Unauthenticated>
    </>
  );
}
