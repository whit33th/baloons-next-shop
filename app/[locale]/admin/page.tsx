import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect, routing } from "@/i18n/routing";
import AdminPageClient from "./ClientPage";

export default async function AdminPage() {
  const token = await convexAuthNextjsToken();

  const preloadedUser = await preloadQuery(
    api.auth.loggedInUser,
    {},
    { token },
  );

  const user = preloadedQueryResult(preloadedUser);

  if (!user) {
    redirect({ href: "/auth", locale: routing.defaultLocale });
  }

  if (!user?.isAdmin) {
    redirect({ href: "/", locale: routing.defaultLocale });
  }
  return <AdminPageClient preloadedUser={preloadedUser} />;
}
