import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import React from "react";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, ThemeProvider } from "@/context";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "GhostMsg - Send Anonymous Messages",
    template: "%s | GhostMsg 👻",
  },
  description:
    "Send anonymous messages like a ghost. Share secrets, compliments, or fun hints without revealing your identity.",
  keywords:
    "anonymous messaging, secret messages, ghost messages, privacy, secure chat",
  authors: [{ name: "Abbas Shaikh" }],
  metadataBase: new URL("https://ghost-msg.vercel.app/"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ghost-msg.vercel.app/",
    siteName: "GhostMsg",
    title: "GhostMsg - Send Anonymous Messages 👻",
    description:
      "Send messages like a ghost - appear and vanish without a trace!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMsg - Send Anonymous Messages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostMsg - Send Anonymous Messages 👻",
    description: "Send messages like a ghost and keep your identity secret!",
    creator: "@ghostmsg",
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
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
