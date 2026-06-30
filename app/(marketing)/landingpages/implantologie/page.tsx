import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { YdImplantologieLanding } from "@/components/marketing/landingpages/yd-implantologie-landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Implantologie — Landingpage-Vorlage",
  description:
    "Generische Implantologie-Landingpage-Vorlage für Your-Dentist-Praxen — wird pro Praxis individualisiert.",
  robots: { index: false, follow: false },
};

export default function ImplantologieLandingPage() {
  return (
    <div className={inter.variable}>
      <Suspense fallback={null}>
        <YdImplantologieLanding />
      </Suspense>
    </div>
  );
}
