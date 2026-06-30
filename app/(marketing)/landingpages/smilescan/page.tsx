import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { YdSmileScanLandingCarree } from "@/components/marketing/landingpages/yd-smilescan-landing-carree";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmileScan — Carree Dental Köln Brück",
  description:
    "SmileScan: unverbindlicher Foto-Check vor Ihrer Erstberatung bei Carree Dental, Köln Brück. Kein Ersatz für eine zahnärztliche Untersuchung.",
  robots: { index: false, follow: false },
};

export default function SmileScanLandingPage() {
  return (
    <div className={inter.variable}>
      <YdSmileScanLandingCarree />
    </div>
  );
}
