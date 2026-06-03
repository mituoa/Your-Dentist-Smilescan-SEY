"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Plus, Star } from "lucide-react";

import { IntakeChannelBadge } from "@/components/inbox/intake-channel-badge";
import { MessageDraftStatusBadge } from "@/components/inbox/message-draft-status-badge";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { isSubmissionReadyForReview } from "@/lib/message-drafts/list-status";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type TrackerFilter = "all" | "new" | "draft";

function formatCaseId(id: string, externalId: string | null): string {
  if (externalId?.trim()) return externalId.trim().slice(0, 12);
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function ageLabel(birthDate: string | null): string {
  if (!birthDate?.trim()) return "—";
  const bd = new Date(birthDate);
  if (Number.isNaN(bd.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age -= 1;
  if (age < 0 || age > 130) return "—";
  return `${age} Jahre`;
}

function statusForRow(item: SubmissionListItem): {
  label: string;
  className: string;
  icon: "star" | "plus" | "check" | null;
} {
  if (item.is_draft) {
    return { label: "Entwurf", className: "yd-tracker-table__status--draft", icon: null };
  }
  if (!item.seen_at) {
    return { label: "Neu", className: "yd-tracker-table__status--new", icon: "plus" };
  }
  if (item.urgency === "today") {
    return { label: "Zeitnah", className: "yd-tracker-table__status--urgent", icon: "star" };
  }
  return { label: "In Bearbeitung", className: "yd-tracker-table__status--progress", icon: "check" };
}

type TrackerTableProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

export function TrackerTable({ items, showCreateCase = false }: TrackerTableProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();

  const [filter, setFilter] = useState<TrackerFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const qLower = q?.toLowerCase() ?? "";

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (qLower) {
        const haystack = [
          item.patient_name,
          item.patient_email,
          item.patient_notes,
          item.patient_external_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(qLower)) return false;
      }
      if (filter === "new") return !item.seen_at && !item.is_draft;
      if (filter === "draft") return item.is_draft;
      return true;
    });
  }, [items, filter, qLower]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const toggleAllOnPage = () => {
    const ids = pageItems.map((i) => i.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const filterLabel =
    filter === "new" ? "Nur neu" : filter === "draft" ? "Entwürfe" : "Alle Fälle";

  return (
    <div className="yd-tracker-table-card flex h-full min-h-0 flex-col">
      <div className="yd-tracker-table-toolbar">
        <div className="min-w-0">
          <h2 className="yd-tracker-table-toolbar__title">Aktuelle Einsendungen</h2>
          <p className="yd-tracker-table-toolbar__meta">
            {filtered.length} {filtered.length === 1 ? "Patientenfall" : "Patientenfälle"}
            {filter !== "all" ? ` · ${filterLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="yd-tracker-table-filter">
            <span className="sr-only">Filter</span>
            <select
              className="cursor-pointer appearance-none border-0 bg-transparent pr-5 text-inherit outline-none"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as TrackerFilter);
                setPage(1);
              }}
              aria-label="Fälle filtern"
            >
              <option value="all">Alle Fälle</option>
              <option value="new">Nur neu</option>
              <option value="draft">Entwürfe</option>
            </select>
            <ChevronDown className="pointer-events-none h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden />
          </label>
          {showCreateCase ? (
            <Link
              href="/create-case?from=inbox"
              className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-[10px] border border-[rgba(22,61,122,0.2)] bg-gradient-to-b from-[#2a5f9e] to-[#163d7a] px-3.5 text-[12px] font-semibold text-white shadow-[0_2px_10px_rgba(22,61,122,0.2)] transition-[filter] hover:brightness-[1.03]"
              title="Neuer Fall"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>
      </div>

      <div className="yd-tracker-table-scroll min-h-0 flex-1">
        <table className="yd-tracker-table">
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#CBD5E1] text-[#1A4F9C] focus:ring-[#1A4F9C]/25"
                  aria-label="Alle auf dieser Seite auswählen"
                  checked={
                    pageItems.length > 0 && pageItems.every((i) => selected.has(i.id))
                  }
                  onChange={toggleAllOnPage}
                />
              </th>
              <th scope="col">Fall-Nr.</th>
              <th scope="col">Patient</th>
              <th scope="col">Alter</th>
              <th scope="col">Anliegen</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="!py-12 text-center text-[14px] text-[#64748B]">
                  Keine Fälle für diesen Filter{q ? " oder diese Suche" : ""}.
                </td>
              </tr>
            ) : null}
            {pageItems.map((item) => {
              const isActive = pathname === `/inbox/${item.id}`;
              const concern = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
                maxLen: 64,
                emptyLabel: "Ohne Angabe",
              });
              const status = statusForRow(item);
              const readyForReview = isSubmissionReadyForReview(item);
              const email = item.patient_email?.trim() || "Keine E-Mail hinterlegt";

              return (
                <tr
                  key={item.id}
                  className={cn(isActive && "yd-tracker-table__row--active")}
                  onClick={() => goToCase(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToCase(item.id);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-current={isActive ? "page" : undefined}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#CBD5E1] text-[#1A4F9C] focus:ring-[#1A4F9C]/25"
                      checked={selected.has(item.id)}
                      aria-label={`${item.patient_name ?? "Patient"} auswählen`}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td>
                    <span className="yd-tracker-table__case-id">
                      {formatCaseId(item.id, item.patient_external_id)}
                    </span>
                  </td>
                  <td>
                    <div className="yd-tracker-table__patient">
                      <span className="yd-tracker-table__avatar" aria-hidden>
                        {initials(item.patient_name)}
                      </span>
                      <span className="yd-tracker-table__patient-text">
                        <span className="yd-tracker-table__patient-name">
                          {item.patient_name?.trim() || "Unbekannter Patient"}
                        </span>
                        <span className="yd-tracker-table__patient-email">{email}</span>
                        <IntakeChannelBadge channel={item.intake_channel} className="mt-0.5" />
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="yd-tracker-table__age">{ageLabel(item.patient_birth_date)}</span>
                  </td>
                  <td>
                    <span className="yd-tracker-table__concern">{concern}</span>
                  </td>
                  <td>
                    <div className="flex max-w-[11rem] flex-col items-start gap-1">
                      <span className={cn("yd-tracker-table__status", status.className)}>
                        {status.icon === "star" ? (
                          <Star className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                        ) : status.icon === "plus" ? (
                          <Plus className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                        ) : status.icon === "check" ? (
                          <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                        ) : null}
                        {status.label}
                      </span>
                      <MessageDraftStatusBadge
                        draftStatus={item.message_draft_status}
                        readyForReview={readyForReview}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="yd-tracker-table-footer">
        <p className="yd-tracker-table-footer__meta">
          {filtered.length === 0
            ? "Keine Einträge"
            : `Zeige ${start + 1} bis ${Math.min(start + PAGE_SIZE, filtered.length)} von ${filtered.length}`}
        </p>
        <div className="yd-tracker-table-pagination">
          <button
            type="button"
            className="yd-tracker-table-pagination__btn"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Zurück
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 5)
            .map((p) => (
              <button
                key={p}
                type="button"
                className={cn(
                  "yd-tracker-table-pagination__page",
                  p === safePage && "yd-tracker-table-pagination__page--active"
                )}
                onClick={() => setPage(p)}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            ))}
          <button
            type="button"
            className="yd-tracker-table-pagination__btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}
