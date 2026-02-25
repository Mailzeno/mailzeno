import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchProvider } from "@/components/SearchProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mailzeno Docs — API-first Email Platform",
    template: "%s | Mailzeno Docs",
  },
  description:
    "Developer documentation for Mailzeno — the API-first SMTP email platform. Send transactional emails with a simple REST API or SDK.",
  keywords: [
    "Mailzeno",
    "email API",
    "SMTP",
    "transactional email",
    "developer docs",
    "email SDK",
    "REST API",
  ],
  authors: [{ name: "Mailzeno" }],
  openGraph: {
    title: "Mailzeno Docs — API-first Email Platform",
    description:
      "Developer documentation for Mailzeno. Send emails via REST API or SDK.",
    type: "website",
    siteName: "Mailzeno Docs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mailzeno Docs",
    description:
      "API-first SMTP email platform documentation for developers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <ThemeProvider>
          <SearchProvider>{children}</SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}