"use client";

import { Sparkles } from "lucide-react";

import type { CareCenterStats } from "@/lib/care-center/care-center-model";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type CareCenterStatsRowProps = {
  stats: CareCenterStats;
  newThisMonth: number;
  onConfigureKi: () => void;
};

type StatCardProps = {
  label: string;
  value: number;
  footnote: string;
  bars: number[];
  accent?: "default" | "green" | "amber" | "blue";
};

function CareStatCard({ label, value, footnote, bars, accent = "default" }: StatCardProps) {
  const max = Math.max(...bars, 1);

  return (
    <div className="cc-stat yd-dash-surface">
      <p className="cc-stat__label">{label}</p>
      <p
        className={cn(
          "cc-stat__value",
          accent === "green" && "cc-stat__value--green",
          accent === "amber" && "cc-stat__value--amber",
          accent === "blue" && "cc-stat__value--blue"
        )}
      >
        {value}
      </p>
      <p className="cc-stat__footnote">{footnote}</p>
      <div className="cc-stat__chart" aria-hidden>
        {bars.map((bar, i) => {
          const h = Math.max(4, Math.round((bar / max) * 100));
          return (
            <span
              key={i}
              className="cc-stat__bar"
              style={{
                height: `${h}%`,
                background:
                  bar > 0
                    ? YD.accent.chartBar
                    : "rgba(180, 198, 218, 0.35)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function CareCenterStatsRow({ stats, newThisMonth, onConfigureKi }: CareCenterStatsRowProps) {
  const publishedPct =
    stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;
  const kiPct =
    stats.total > 0 ? Math.round((stats.kiConnected / stats.total) * 100) : 0;

  const trend = [
    Math.max(1, stats.total - 4),
    Math.max(1, stats.total - 2),
    Math.max(1, stats.total - 1),
    Math.max(1, stats.total),
    stats.total,
  ];

  return (
    <div className="cc-stats" aria-label="Care Center Kennzahlen">
      <div className="cc-stats__grid">
        <CareStatCard
          label="Gesamtartikel"
          value={stats.total}
          footnote={newThisMonth > 0 ? `+${newThisMonth} diesen Monat` : "Aktueller Bestand"}
          bars={trend}
        />
        <CareStatCard
          label="Veröffentlicht"
          value={stats.published}
          footnote={`${publishedPct}% aller Artikel`}
          bars={[
            stats.published,
            stats.drafts,
            stats.reviewRequired,
            stats.kiConnected,
            stats.published,
          ]}
          accent="green"
        />
        <CareStatCard
          label="Entwürfe"
          value={stats.drafts}
          footnote={stats.drafts > 0 ? "In Bearbeitung" : "Keine offenen Entwürfe"}
          bars={[stats.drafts, stats.reviewRequired, 1, stats.drafts, stats.drafts]}
          accent="amber"
        />
        <CareStatCard
          label="Von KI genutzt"
          value={stats.kiConnected}
          footnote={`${kiPct}% aller Artikel`}
          bars={[
            stats.kiConnected,
            stats.published - stats.kiConnected,
            stats.kiConnected,
            stats.published,
            stats.kiConnected,
          ].map((v) => Math.max(0, v))}
          accent="blue"
        />
        <CareStatCard
          label="Zur Prüfung"
          value={stats.reviewRequired}
          footnote={stats.reviewRequired > 0 ? "Freigabe ausstehend" : "Alles geprüft"}
          bars={[stats.reviewRequired, 1, stats.reviewRequired, 0, stats.reviewRequired]}
          accent="amber"
        />
      </div>

      <button type="button" className="cc-stats__ki yd-dash-surface" onClick={onConfigureKi}>
        <span className="cc-stats__ki-head">
          <Sparkles className="cc-stats__ki-icon" strokeWidth={1.75} aria-hidden />
          <span className="cc-stats__ki-title">Patienten-KI</span>
          <span className="cc-stats__ki-badge">Aktiv</span>
        </span>
        <span className="cc-stats__ki-meta">
          {stats.kiConnected} Inhalte verbunden
        </span>
        <span className="cc-stats__ki-link">Konfigurieren</span>
      </button>
    </div>
  );
}
