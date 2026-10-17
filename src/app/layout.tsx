import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  Figtree,
  Gabarito,
  Geist,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import type React from "react";

import { Toaster } from "@/components/elements/sonner";
import { DEFAULT_PALETTE, PALETTE_BOOT_SCRIPT } from "@/lib/theme/palette";
import AuthProvider from "@/providers/auth-provider";
import PaletteProvider from "@/providers/palette-provider";
import { QueryProvider } from "@/providers/query-provider";
import ThemeProvider from "@/providers/theme-provider";

// Every palette's fonts (src/app/globals.css). Only Soft spectral, the
// default, preloads; the others download when their palette is applied.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const geist = Geist({
  preload: false,
  subsets: ["latin"],
  variable: "--font-geist",
});
const instrumentSerif = Instrument_Serif({
  preload: false,
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});
const dmSans = DM_Sans({
  preload: false,
  subsets: ["latin"],
  variable: "--font-dm-sans",
});
const gabarito = Gabarito({
  preload: false,
  subsets: ["latin"],
  variable: "--font-gabarito",
});

const fontVariables = [
  figtree,
  bricolage,
  geist,
  instrumentSerif,
  dmSans,
  gabarito,
]
  .map((font) => font.variable)
  .join(" ");

export const metadata: Metadata = {
  authors: [{ name: "Abbas Shaikh" }],
  description:
    "Send anonymous messages like a ghost. Share secrets, compliments, or fun hints without revealing your identity.",
  keywords:
    "anonymous messaging, secret messages, ghost messages, privacy, secure chat",
  metadataBase: new URL("https://ghost-msg.vercel.app/"),
  openGraph: {
    description:
      "Send messages like a ghost - appear and vanish without a trace!",
    images: [
      {
        alt: "GhostMsg - Send Anonymous Messages",
        height: 630,
        url: "/og-image.png",
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: "GhostMsg",
    title: "GhostMsg - Send Anonymous Messages 👻",
    type: "website",
    url: "https://ghost-msg.vercel.app/",
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: "GhostMsg - Send Anonymous Messages",
    template: "%s | GhostMsg 👻",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ghostmsg",
    description: "Send messages like a ghost and keep your identity secret!",
    title: "GhostMsg - Send Anonymous Messages 👻",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    // Font variables sit on <html> so the palette tokens on :root can resolve them.
    <html
      className={fontVariables}
      data-palette={DEFAULT_PALETTE}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: constant boot script (no user input) that applies the stored palette before first paint
          dangerouslySetInnerHTML={{ __html: PALETTE_BOOT_SCRIPT }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
              enableSystem
            >
              <PaletteProvider>
                {children}
                <Toaster />
              </PaletteProvider>
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
