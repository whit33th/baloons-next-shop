import type { Metadata } from "next";
import "./globals.css";

import { Footer, Header } from "@/components/Containers";
import { ConvexProvider } from "@/components/Providers/ConvexProvider";
import { LenisProvider } from "@/components/Providers/LenisProvider";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Balloon Shop",
  description: "Beautiful balloons for every occasion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} relative flex min-h-screen w-full flex-col antialiased`}
      >
        <LenisProvider>
          <ConvexProvider>
            <div className="border-b py-1 text-center text-sm font-medium backdrop-blur-2xl">
              New pieces added daily
            </div>
            <Header />
            <main className="h-full w-full flex-1">{children}</main>
            <Footer />

            <Toaster richColors position="bottom-right" />
          </ConvexProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
