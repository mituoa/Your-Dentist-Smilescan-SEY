import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { YdLeistungenLandingCarree } from "@/components/marketing/landingpages/yd-leistungen-landing-carree";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-al-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leistungen — Carree Dental Köln Brück",
  description:
    "Zahnmedizinisches Leistungsspektrum bei Carree Dental: Prophylaxe, Kieferorthopädie, Ästhetik, Implantologie, Angstpatienten, Kinderzahnheilkunde und mehr.",
  robots: { index: false, follow: false },
};

export default function LeistungenLandingPage() {
  return (
    <div className={inter.variable}>
      <YdLeistungenLandingCarree />
    </div>
  );
}
