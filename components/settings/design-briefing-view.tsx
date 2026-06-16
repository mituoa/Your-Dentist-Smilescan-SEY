"use client";

import { useMemo, useState, useTransition } from "react";

import {
  seedPlatformDesignBriefingAction,
  updatePlatformDesignBriefingAreaStatusAction,
  updatePlatformDesignBriefingSectionAction,
} from "@/app/(protected)/settings/design-briefing/actions";
import type {
  PlatformDesignBriefingArea,
  PlatformDesignBriefingBundle,
  PlatformDesignBriefingSection,
} from "@/lib/design/platform-design-briefing/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<PlatformDesignBriefingArea["implementation_status"], string> = {
  pending: "Ausstehend",
  in_progress: "In Umsetzung",
  review: "Review",
  done: "Umgesetzt",
};

type DesignBriefingViewProps = {
  bundle: PlatformDesignBriefingBundle;
  isFromDatabase: boolean;
};

export function DesignBriefingView({ bundle, isFromDatabase }: DesignBriefingViewProps) {
  const [activeAreaSlug, setActiveAreaSlug] = useState(bundle.areas[0]?.slug ?? null);
  const [activeSectionNumber, setActiveSectionNumber] = useState<number | null>(
    bundle.sections[0]?.section_number ?? null
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const activeArea = bundle.areas.find((a) => a.slug === activeAreaSlug) ?? null;
  const areaSections = useMemo(() => {
    if (!activeArea) return bundle.sections;
    const numbers = new Set(bundle.areaSectionNumbers[activeArea.slug] ?? []);
    return bundle.sections.filter((s) => numbers.has(s.section_number));
  }, [activeArea, bundle]);

  const activeSection =
    bundle.sections.find((s) => s.section_number === activeSectionNumber) ?? areaSections[0] ?? null;

  const runSeed = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await seedPlatformDesignBriefingAction();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage("Design-Briefing in der Datenbank gespeichert.");
      window.location.reload();
    });
  };

  return (
    <div className="yd-settings-design-briefing flex min-h-0 flex-1 flex-col gap-4">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Internes Design-Briefing
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{bundle.briefing.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          {bundle.briefing.scope_label}
        </p>
        {!isFromDatabase ? (
          <p className="text-sm text-amber-800">
            Noch nicht in der Datenbank — Inhalt aus Seed-Datei. Bitte einmalig speichern.
          </p>
        ) : null}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={runSeed}
          className="inline-flex min-h-10 items-center rounded-lg border border-slate-300/60 bg-white px-3 text-sm font-medium text-slate-800"
        >
          {isFromDatabase ? "Aus Seed neu synchronisieren" : "In Datenbank speichern"}
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.2fr)]">
        <aside className="rounded-xl border border-slate-200/80 bg-white p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Geltungsbereiche
          </p>
          <ul className="mt-1 space-y-0.5">
            {bundle.areas.map((area) => (
              <li key={area.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAreaSlug(area.slug);
                    const first = bundle.areaSectionNumbers[area.slug]?.[0];
                    if (first != null) setActiveSectionNumber(first);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left",
                    activeAreaSlug === area.slug ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <span className="text-sm font-medium text-slate-900">{area.title}</span>
                  <span className="text-[11px] text-slate-500">
                    {STATUS_LABELS[area.implementation_status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-h-0 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Abschnitte {activeArea ? `— ${activeArea.title}` : ""}
          </p>
          <ul className="space-y-0.5">
            {areaSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => setActiveSectionNumber(section.section_number)}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left",
                    activeSection?.section_number === section.section_number
                      ? "bg-slate-100"
                      : "hover:bg-slate-50"
                  )}
                >
                  <span className="text-[11px] font-medium text-slate-500">
                    {section.section_number}.
                  </span>{" "}
                  <span className="text-sm font-medium text-slate-900">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-h-0 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-4">
          {activeSection ? (
            <SectionEditor
              key={activeSection.id}
              section={activeSection}
              disabled={pending || !isFromDatabase}
            />
          ) : null}
          {activeArea && isFromDatabase ? (
            <AreaStatusEditor area={activeArea} disabled={pending} />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  disabled,
}: {
  section: PlatformDesignBriefingSection;
  disabled: boolean;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content_markdown);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    startTransition(async () => {
      setSaved(false);
      const result = await updatePlatformDesignBriefingSectionAction({
        sectionId: section.id,
        title,
        contentMarkdown: content,
      });
      if (result.ok) setSaved(true);
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Abschnitt {section.section_number}
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled || pending}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled || pending}
        rows={18}
        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed"
      />
      <button
        type="button"
        disabled={disabled || pending}
        onClick={save}
        className="inline-flex min-h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-50"
      >
        Abschnitt speichern
      </button>
      {saved ? <p className="text-sm text-slate-600">Gespeichert.</p> : null}
      {disabled ? (
        <p className="text-xs text-slate-500">Zuerst „In Datenbank speichern“, dann bearbeitbar.</p>
      ) : null}
    </div>
  );
}

function AreaStatusEditor({
  area,
  disabled,
}: {
  area: PlatformDesignBriefingArea;
  disabled: boolean;
}) {
  const [status, setStatus] = useState(area.implementation_status);
  const [notes, setNotes] = useState(area.implementation_notes ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await updatePlatformDesignBriefingAreaStatusAction({
        areaId: area.id,
        implementationStatus: status,
        implementationNotes: notes,
      });
    });
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Umsetzungsstatus — {area.title}
      </p>
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as PlatformDesignBriefingArea["implementation_status"])
        }
        disabled={disabled || pending}
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={disabled || pending}
        rows={3}
        placeholder="Umsetzungsnotizen…"
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={disabled || pending}
        onClick={save}
        className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800"
      >
        Status speichern
      </button>
    </div>
  );
}
