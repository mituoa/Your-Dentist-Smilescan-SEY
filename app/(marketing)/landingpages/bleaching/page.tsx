import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { YdBleachingLanding } from "@/components/marketing/landingpages/yd-bleaching-landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bleaching — Landingpage-Vorlage",
  description:
    "Generische Bleaching-Landingpage-Vorlage für Your-Dentist-Praxen — wird pro Praxis individualisiert.",
  robots: { index: false, follow: false },
};

export default function BleachingLandingPage() {
  return (
    <div className={inter.variable}>
      <Suspense fallback={null}>
        <YdBleachingLanding />
      </Suspense>
    </div>
  );
}
