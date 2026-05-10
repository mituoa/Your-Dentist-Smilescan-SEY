"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  createDraftArticle,
  deleteArticle,
  publishArticle,
  saveArticle,
} from "@/app/(protected)/journal/actions";
import { GUIDED_QUESTIONS, generateGuidedDraftMarkdown } from "@/lib/journal/guided-drafts";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

export type JournalsContentTab = "create" | "published" | "drafts";

const DEFAULT_TOPIC = "treatment";

interface JournalsWorkspaceViewProps {
  initialEntries: JournalEntry[];
  initialTab: JournalsContentTab;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Heute veröffentlicht";
  if (diffDays === 1) return "Gestern veröffentlicht";
  if (diffDays < 7) return `Vor ${diffDays} Tagen veröffentlicht`;
  if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen veröffentlicht`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

export function JournalsWorkspaceView({ initialEntries, initialTab }: JournalsWorkspaceViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isBusy, setIsBusy] = useState(false);

  const [contentView, setContentView] = useState<JournalsContentTab>(initialTab);
  useEffect(() => {
    setContentView(initialTab);
  }, [initialTab]);

  const [isWriting, setIsWriting] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [writerMode, setWriterMode] = useState<"new" | "edit">("new");
  const [hasCommittedSave, setHasCommittedSave] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const setTab = useCallback(
    (tab: JournalsContentTab) => {
      setContentView(tab);
      router.replace(`${pathname}?tab=${tab}`, { scroll: false });
    },
    [pathname, router]
  );

  const publishedList = useMemo(
    () => initialEntries.filter((e) => e.status === "published").slice(0, 7),
    [initialEntries]
  );
  const draftList = useMemo(
    () => initialEntries.filter((e) => e.status === "draft").slice(0, 5),
    [initialEntries]
  );

  const resetWriter = useCallback(() => {
    setIsWriting(false);
    setArticleId(null);
    setWriterMode("new");
    setHasCommittedSave(false);
    setNewTitle("");
    setNewContent("");
    setActionError(null);
  }, []);

  const handleShorter = () => {
    if (!newContent.trim()) return;
    const paragraphs = newContent.split("\n\n\n");
    if (paragraphs.length > 2) {
      setNewContent([paragraphs[0], paragraphs[paragraphs.length - 1]].join("\n\n\n"));
    }
  };

  const handleSimpler = () => {
    if (!newContent.trim()) return;
    setNewContent(newContent.replace(/zunächst/g, "zuerst").replace(/etwa/g, "ungefähr"));
  };

  const startNewArticle = useCallback(async (prefilledTitle: string) => {
    setActionError(null);
    setIsBusy(true);
    try {
      const created = await createDraftArticle();
      if (created.error || !created.id) {
        setActionError(created.error || "Entwurf konnte nicht erstellt werden.");
        return;
      }
      setArticleId(created.id);
      setWriterMode("new");
      setHasCommittedSave(false);
      setNewTitle(prefilledTitle);
      setNewContent(prefilledTitle ? generateGuidedDraftMarkdown(prefilledTitle) : "");
      setIsWriting(true);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const handleEdit = (entry: JournalEntry) => {
    setActionError(null);
    setArticleId(entry.id);
    setWriterMode("edit");
    setHasCommittedSave(true);
    setNewTitle(entry.title || "");
    setNewContent(entry.content_markdown || "");
    setIsWriting(true);
  };

  const handleSave = (publish: boolean) => {
    if (!articleId || !newTitle.trim() || !newContent.trim()) return;
    setActionError(null);
    setIsBusy(true);
    void (async () => {
      try {
        const excerpt = excerptFromMarkdown(newContent);
        const saved = await saveArticle({
          id: articleId,
          title: newTitle.slice(0, JOURNAL_LIMITS.title),
          excerpt,
          content_markdown: newContent.slice(0, JOURNAL_LIMITS.content_markdown),
          topic: DEFAULT_TOPIC,
          cover_photo_url: null,
        });
        if (saved.error) {
          setActionError(saved.error);
          return;
        }
        setHasCommittedSave(true);

        if (publish) {
          const pub = await publishArticle(articleId);
          if (pub.error) {
            setActionError(pub.error);
            return;
          }
        }

        resetWriter();
        router.refresh();
      } finally {
        setIsBusy(false);
      }
    })();
  };

  const handleCancel = () => {
    setActionError(null);
    const id = articleId;
    const shouldDelete = writerMode === "new" && !hasCommittedSave && id;

    if (shouldDelete) {
      setIsBusy(true);
      void (async () => {
        try {
          await deleteArticle(id);
          resetWriter();
          router.refresh();
        } finally {
          setIsBusy(false);
        }
      })();
    } else {
      resetWriter();
      router.refresh();
    }
  };

  const getPageTitle = () => {
    switch (contentView) {
      case "create":
        return "Erklärungen erstellen";
      case "published":
        return "Veröffentlichte Inhalte";
      case "drafts":
        return "Entwürfe";
      default:
        return "Erklärungen für Patienten";
    }
  };

  const getPageSubtitle = () => {
    switch (contentView) {
      case "create":
        return "Geben Sie Ihren Patienten Klarheit – bevor sie fragen müssen";
      case "published":
        return "Ihre veröffentlichten Erklärungen für Patienten";
      case "drafts":
        return "Unfertige Erklärungen, an denen Sie arbeiten";
      default:
        return "";
    }
  };

  const listTitle = (e: JournalEntry) => (e.title?.trim() ? e.title : "Ohne Titel");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-auto" style={{ background: "#F7F9FC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />

      <div className="relative flex-1 overflow-auto">
        <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} pb-16 md:pb-24`}>
          <div className="mx-auto w-full max-w-[min(760px,100%)]">
          {actionError ? (
            <div
              className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {actionError}
            </div>
          ) : null}

          {isWriting ? (
            <div style={{ maxWidth: 680 }}>
              <div style={{ marginBottom: 56 }}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titel Ihrer Erklärung"
                  maxLength={JOURNAL_LIMITS.title}
                  className="w-full text-[28px] font-medium focus:outline-none"
                  style={{
                    padding: "0 0 28px 0",
                    border: "none",
                    borderBottom: "1px solid #F0F0F0",
                    color: "#1a1a1a",
                    background: "transparent",
                    transition: "all 120ms ease",
                    letterSpacing: "-0.016em",
                    lineHeight: 1.3,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderBottomColor = "#E0E0E0";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderBottomColor = "#F0F0F0";
                  }}
                />
              </div>

              <div style={{ marginBottom: 48 }}>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ihre Erklärung für Patienten…"
                  rows={18}
                  maxLength={JOURNAL_LIMITS.content_markdown}
                  className="w-full resize-none text-[17px] focus:outline-none"
                  style={{
                    padding: 0,
                    border: "none",
                    color: "#333333",
                    background: "transparent",
                    lineHeight: 1.85,
                    transition: "all 120ms ease",
                  }}
                />
              </div>

              {newContent.trim() ? (
                <div style={{ marginBottom: 64, paddingTop: 32, borderTop: "1px solid #F0F0F0" }}>
                  <p
                    className="mb-[18px] text-[11px] font-medium uppercase"
                    style={{ color: "#B3B3B3", letterSpacing: "0.04em" }}
                  >
                    Text anpassen
                  </p>
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={handleShorter}
                      className="text-[13px] font-medium text-[#737373] transition-colors hover:text-[#333333]"
                      style={{ background: "transparent", border: "none", padding: 0 }}
                    >
                      Kürzer formulieren
                    </button>
                    <span style={{ color: "#E0E0E0" }}>•</span>
                    <button
                      type="button"
                      onClick={handleSimpler}
                      className="text-[13px] font-medium text-[#737373] transition-colors hover:text-[#333333]"
                      style={{ background: "transparent", border: "none", padding: 0 }}
                    >
                      Einfacher erklären
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-5" style={{ paddingTop: newContent.trim() ? 0 : 56 }}>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={!newTitle.trim() || !newContent.trim() || isBusy}
                  className="rounded-lg px-7 py-3.5 text-[14px] font-medium transition-all disabled:cursor-not-allowed"
                  style={{
                    background: !newTitle.trim() || !newContent.trim() ? "#F5F5F5" : "#2F80ED",
                    color: !newTitle.trim() || !newContent.trim() ? "#B3B3B3" : "#FFFFFF",
                    border: "none",
                    boxShadow:
                      !newTitle.trim() || !newContent.trim() ? "none" : "0 2px 8px rgba(47,128,237,0.15)",
                  }}
                >
                  Veröffentlichen
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={!newTitle.trim() || !newContent.trim() || isBusy}
                  className="text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:text-[#D4D4D4]"
                  style={{
                    background: "transparent",
                    color: !newTitle.trim() || !newContent.trim() ? "#D4D4D4" : "#737373",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Als Entwurf speichern
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isBusy}
                  className="text-[14px] font-medium text-[#999999] transition-colors hover:text-[#666666]"
                  style={{ background: "transparent", border: "none", padding: 0 }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 48 }}>
                <h1
                  className="text-[32px] font-medium"
                  style={{ color: "#1a1a1a", marginBottom: 12, letterSpacing: "-0.018em", lineHeight: 1.2 }}
                >
                  {getPageTitle()}
                </h1>
                <p className="text-[15px]" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
                  {getPageSubtitle()}
                </p>
              </div>

              <div style={{ marginBottom: 72 }}>
                <div
                  className="inline-flex items-center gap-1 rounded-full p-1.5"
                  style={{ background: "#F8FAFC" }}
                >
                  {(["create", "published", "drafts"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTab(tab)}
                      className="rounded-full px-6 py-2.5 text-[14px] font-medium transition-all"
                      style={{
                        background: contentView === tab ? "#FFFFFF" : "transparent",
                        color: contentView === tab ? "#1a1a1a" : "#737373",
                        border: "none",
                        boxShadow: contentView === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        letterSpacing: "0.002em",
                      }}
                    >
                      {tab === "create" ? "Erstellen" : tab === "published" ? "Veröffentlicht" : "Entwürfe"}
                    </button>
                  ))}
                </div>
              </div>

              {contentView === "create" ? (
                <>
                  <div style={{ marginBottom: 64 }}>
                    <p className="mb-10 text-[14px]" style={{ color: "#737373", lineHeight: 1.6 }}>
                      Viele Patienten stellen genau diese Fragen:
                    </p>
                    <div className="flex flex-col" style={{ gap: 20 }}>
                      {GUIDED_QUESTIONS.map((question, index) => (
                        <button
                          key={question}
                          type="button"
                          disabled={isBusy}
                          onClick={() => void startNewArticle(question)}
                          className="group text-left transition-all hover:-translate-y-px hover:bg-[#F5F5F5] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                          style={{
                            fontSize: index === 0 ? 18 : 16,
                            fontWeight: index === 0 ? 500 : 400,
                            color: index === 0 ? "#1a1a1a" : "#4d4d4d",
                            background: "#FAFAFA",
                            border: "none",
                            borderRadius: 12,
                            lineHeight: 1.5,
                            padding: "16px 18px",
                            cursor: isBusy ? "wait" : "pointer",
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 80, paddingTop: 48 }}>
                    <p className="mb-6 text-[14px]" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
                      Oder erklären Sie etwas, das Ihnen wichtig ist
                    </p>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void startNewArticle("")}
                      className="rounded-lg px-6 py-3 text-[14px] font-medium text-white transition-all hover:opacity-95 disabled:opacity-60"
                      style={{
                        background: "#2F80ED",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(47,128,237,0.15)",
                      }}
                    >
                      Eigene Erklärung verfassen
                    </button>
                    <p className="mt-7 text-[13px]" style={{ color: "#B3B3B3", lineHeight: 1.6 }}>
                      Ihre Patienten sehen diese Erklärung sofort.
                    </p>
                  </div>
                </>
              ) : null}

              {contentView === "published" ? (
                <div>
                  {publishedList.length > 0 ? (
                    <>
                      <div className="flex flex-col">
                        {publishedList.map((explanation) => (
                          <div
                            key={explanation.id}
                            role="button"
                            tabIndex={0}
                            className="group cursor-pointer"
                            onClick={() => handleEdit(explanation)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleEdit(explanation);
                              }
                            }}
                            onMouseEnter={() => setHoveredItemId(explanation.id)}
                            onMouseLeave={() => setHoveredItemId(null)}
                            style={{
                              padding: "24px 0",
                              borderBottom: "1px solid #F4F5F7",
                              transition: "all 130ms ease",
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div style={{ flex: 1, paddingRight: 24 }}>
                                <h3
                                  className="text-[19px]"
                                  style={{
                                    fontWeight: 500,
                                    color: hoveredItemId === explanation.id ? "#1a1a1a" : "#262626",
                                    letterSpacing: "-0.014em",
                                    lineHeight: 1.35,
                                    marginBottom: 10,
                                    transition: "all 130ms ease",
                                  }}
                                >
                                  {listTitle(explanation)}
                                </h3>
                                <p className="text-[13px]" style={{ color: "#999999", lineHeight: 1.4 }}>
                                  {explanation.published_at
                                    ? getRelativeTime(explanation.published_at)
                                    : new Date(explanation.updated_at).toLocaleDateString("de-DE", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                </p>
                              </div>
                              <span
                                className="shrink-0 pt-0.5 text-[13px] font-medium text-[#2F80ED] transition-opacity"
                                style={{ opacity: hoveredItemId === explanation.id ? 1 : 0 }}
                              >
                                Bearbeiten
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 64, textAlign: "center" }}>
                        <p className="text-[13px]" style={{ color: "#B3B3B3", lineHeight: 1.6 }}>
                          Diese Inhalte helfen Ihren Patienten, sich besser zu orientieren.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{ paddingTop: 64, textAlign: "center" }}>
                      <p className="text-[15px]" style={{ color: "#B3B3B3", lineHeight: 1.6, marginBottom: 32 }}>
                        Sie haben noch keine Erklärung veröffentlicht.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {contentView === "drafts" ? (
                <div>
                  {draftList.length > 0 ? (
                    <div className="flex flex-col">
                      {draftList.map((explanation) => (
                        <div
                          key={explanation.id}
                          role="button"
                          tabIndex={0}
                          className="group cursor-pointer"
                          onClick={() => handleEdit(explanation)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleEdit(explanation);
                            }
                          }}
                          onMouseEnter={() => setHoveredItemId(explanation.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          style={{
                            padding: "24px 0",
                            borderBottom: "1px solid #F4F5F7",
                            transition: "all 130ms ease",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div style={{ flex: 1, paddingRight: 24 }}>
                              <h3
                                className="text-[19px]"
                                style={{
                                  fontWeight: 500,
                                  color: hoveredItemId === explanation.id ? "#4d4d4d" : "#737373",
                                  letterSpacing: "-0.014em",
                                  lineHeight: 1.35,
                                  marginBottom: 10,
                                  transition: "all 130ms ease",
                                }}
                              >
                                {listTitle(explanation)}
                              </h3>
                              <p className="text-[13px]" style={{ color: "#B3B3B3", lineHeight: 1.4 }}>
                                Nicht veröffentlicht
                              </p>
                            </div>
                            <span
                              className="shrink-0 pt-0.5 text-[13px] font-medium text-[#2F80ED] transition-opacity"
                              style={{ opacity: hoveredItemId === explanation.id ? 1 : 0 }}
                            >
                              Bearbeiten
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ paddingTop: 64, textAlign: "center" }}>
                      <p className="text-[15px]" style={{ color: "#B3B3B3", lineHeight: 1.6, marginBottom: 32 }}>
                        Sie haben keine gespeicherten Entwürfe.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
