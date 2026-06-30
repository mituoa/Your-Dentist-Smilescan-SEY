import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { YdKarriereLanding } from "@/components/marketing/landingpages/yd-karriere-landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal gewinnen — Landingpage-Vorlage",
  description:
    "Generische Recruiting-Landingpage-Vorlage für Your-Dentist-Praxen — wird pro Praxis individualisiert.",
  robots: { index: false, follow: false },
};

export default function KarriereLandingPage() {
  return (
    <div className={inter.variable}>
      <Suspense fallback={null}>
        <YdKarriereLanding />
      </Suspense>
    </div>
  );
}
