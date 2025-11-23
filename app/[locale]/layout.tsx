import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "../globals.css";

import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Footer, Header } from "@/components/Containers";
import { ConvexProvider } from "@/components/Providers/ConvexProvider";
import AppImageKitProvider from "@/components/Providers/ImageKitProvider";
import { routing } from "@/i18n/routing";
import { getDefaultDescription, getSiteName } from "@/SEO";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteName = getSiteName();
  const description = getDefaultDescription(locale);

  return {
    title: {
      default: siteName,
      template: `${siteName} | %s`,
    },
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Ballon Boutique" />
      </head>
      <body
        className={`${dmSans.variable} relative flex min-h-screen w-full flex-col overflow-x-hidden antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ConvexAuthNextjsServerProvider>
            <ConvexProvider>
              <AppImageKitProvider>
                <Header />
                <main className="flex h-full w-full flex-1 flex-col">
                  {children}
                </main>
                <Footer />

                <Toaster richColors position="bottom-right" />
              </AppImageKitProvider>
            </ConvexProvider>
          </ConvexAuthNextjsServerProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
