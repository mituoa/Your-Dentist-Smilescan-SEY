import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";

import { getAppBaseUrl } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_TITLE_TEMPLATE } from "@/lib/site-metadata";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  applicationName: "Your Dentist",
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
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Your Dentist",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Your Dentist",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "msapplication-TileColor": "#0F6E56",
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
