import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { YdAesthetikLanding } from "@/components/marketing/landingpages/yd-aesthetik-landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ästhetische Zahnmedizin — Landingpage-Vorlage",
  description:
    "Generische Landingpage-Vorlage für ästhetische Zahnmedizin — wird pro Praxis individualisiert.",
  robots: { index: false, follow: false },
};

export default function AesthetikLandingPage() {
  return (
    <div className={inter.variable}>
      <Suspense fallback={null}>
        <YdAesthetikLanding />
      </Suspense>
    </div>
  );
}
