import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { YdProphylaxeLanding } from "@/components/marketing/landingpages/yd-prophylaxe-landing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prophylaxe — Landingpage-Vorlage",
  description:
    "Generische Prophylaxe-Landingpage-Vorlage für Your-Dentist-Praxen — wird pro Praxis individualisiert.",
  robots: { index: false, follow: false },
};

export default function ProphylaxeLandingPage() {
  return (
    <div className={inter.variable}>
      <YdProphylaxeLanding />
    </div>
  );
}
