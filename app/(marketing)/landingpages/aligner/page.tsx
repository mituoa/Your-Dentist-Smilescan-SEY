import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { YdAlignerLandingCarree } from "@/components/marketing/landingpages/yd-aligner-landing-carree";

/** Eigene, hochwertige Type-Familie nur für diese Landingpage-Vorlage — kein globaler Eingriff. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invisalign® Köln Brück — Carree Dental",
  description:
    "Unsichtbare Zahnkorrektur mit Invisalign® bei Carree Dental in Köln Brück. Kieferorthopädin Frau Dr. Andersson, 30 Jahre Erfahrung, Invisalign Platinum Elite II Provider.",
  robots: { index: false, follow: false },
};

export default function AlignerLandingPage() {
  return (
    <div className={inter.variable}>
      <YdAlignerLandingCarree />
    </div>
  );
}
