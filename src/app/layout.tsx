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
import QueryProvider from "@/providers/query-provider";
import ThemeProvider from "@/providers/theme-provider";

// Every palette's fonts (src/app/globals.css). Only Soft spectral, the
// default, preloads; the others download when their palette is applied.
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  preload: false,
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  preload: false,
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  preload: false,
});
const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  preload: false,
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
