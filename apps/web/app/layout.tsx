import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://mailzeno.dev"),
  title: {
    default: "MailZeno – Developer-first SMTP Email API",
    template: "%s | MailZeno",
  },
  description:
    "Send transactional emails using your own SMTP. Open-core, developer-first email API with built-in dashboard and SDK.",
  keywords: [
    "SMTP API",
    "transactional email",
    "email API",
    "open source email",
    "Node.js email",
  ],
  openGraph: {
    title: "MailZeno – Developer-first SMTP Email API",
    description:
      "Bring your own SMTP. Open-source, developer-first email API with built-in dashboard and SDK.",
    url: "https://mailzeno.dev",
    siteName: "MailZeno",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MailZeno – Open-source SMTP Email API",
    description:
      "Bring your own SMTP. Open-source, developer-first email API with built-in dashboard and SDK.",
    images: ["/og.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
