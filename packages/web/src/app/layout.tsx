import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { cn, getBaseUrl } from "@/lib/utils";

import { Providers } from "../components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  width: "device-width",
};

export const metadata: Metadata = {
  title: "POS System",
  keywords: ["point", "sales"],
  description: "POS System desc",
  openGraph: {
    title: "POS System",
    description: "pos system desc",
    url: getBaseUrl(),
    siteName: "POS System",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ramaakbar26",
    creator: "@ramaakbar26",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background font-sans text-foreground antialiased",
          inter.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
