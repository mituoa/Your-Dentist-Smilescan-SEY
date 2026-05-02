import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";

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
  title: "SmileScan — Die fehlende Schicht",
  description:
    "SmileScan ist die diskrete Brücke zwischen Beobachtung und klinischer Versorgung.",
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
