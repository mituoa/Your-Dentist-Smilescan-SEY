import type { Metadata } from "next";

import { YdProductOverviewPage } from "@/components/marketing/yd-product-overview-page";

export const metadata: Metadata = {
  title: "Your Dentist — Das digitale Betriebssystem für Zahnarztpraxen",
  description:
    "Patientenanfragen, KI-gestützte Vorbereitung, ärztliche Freigabe und Teamaufgaben in einer ruhigen Plattform — für Zahnärzt:innen und Praxisteams.",
};

export default function ProductOverviewPage() {
  return <YdProductOverviewPage />;
}
