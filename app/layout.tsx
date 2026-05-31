import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";

import { getAppBaseUrl } from "@/lib/env";
import {
  absoluteShareUrl,
  SHARE_ASSET_PATHS,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from "@/lib/share-assets";
import {
  SITE_DESCRIPTION,
  SITE_OG_DESCRIPTION,
  SITE_OG_IMAGE_ALT,
  SITE_OG_TITLE,
  SITE_TITLE,
  SITE_TITLE_TEMPLATE,
} from "@/lib/site-metadata";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  applicationName: SITE_TITLE,
  title: {
    default: SITE_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Your Dentist GmbH" }],
  creator: "Your Dentist GmbH",
  category: "technology",
  manifest: "/site.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: SHARE_ASSET_PATHS.icon16, sizes: "16x16", type: "image/png" },
      { url: SHARE_ASSET_PATHS.icon32, sizes: "32x32", type: "image/png" },
      { url: SHARE_ASSET_PATHS.icon512, sizes: "512x512", type: "image/png" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
      {
        url: "/brand/your-dentist/logo-mark.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    apple: [{ url: SHARE_ASSET_PATHS.appleTouch, sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/brand/your-dentist/safari-pinned-tab.svg",
        color: "#0284C7",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: SITE_TITLE,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_OG_TITLE,
    url: "/",
    title: SITE_OG_TITLE,
    description: SITE_OG_DESCRIPTION,
    images: [
      {
        url: absoluteShareUrl(SHARE_ASSET_PATHS.og),
        secureUrl: absoluteShareUrl(SHARE_ASSET_PATHS.og),
        width: SHARE_IMAGE_WIDTH,
        height: SHARE_IMAGE_HEIGHT,
        alt: SITE_OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_OG_TITLE,
    description: SITE_OG_DESCRIPTION,
    images: [
      {
        url: absoluteShareUrl(SHARE_ASSET_PATHS.twitter),
        width: SHARE_IMAGE_WIDTH,
        height: SHARE_IMAGE_HEIGHT,
        alt: SITE_OG_IMAGE_ALT,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "msapplication-TileColor": "#0284C7",
    "og:image:width": String(SHARE_IMAGE_WIDTH),
    "og:image:height": String(SHARE_IMAGE_HEIGHT),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F7F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_NAME)?.value);
  const themeClass = theme === "dark" ? "dark" : "";

  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${themeClass}`.trim()}
    >
      <body>{children}</body>
    </html>
  );
}
