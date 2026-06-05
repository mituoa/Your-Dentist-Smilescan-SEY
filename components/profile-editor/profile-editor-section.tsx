"use client";

import { ChevronRight } from "lucide-react";

type ProfileEditorSectionProps = {
  id: string;
  title: string;
  summary?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function ProfileEditorSection({
  id,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: ProfileEditorSectionProps) {
  return (
    <section className={`yd-pe-section${isOpen ? " yd-pe-section--open" : ""}`}>
      <button
        type="button"
        id={`yd-pe-section-${id}`}
        aria-expanded={isOpen}
        aria-controls={`yd-pe-section-panel-${id}`}
        onClick={onToggle}
        className="yd-pe-section__trigger"
      >
        <span className="yd-pe-section__trigger-text">
          <span className="yd-pe-section__title">{title}</span>
          {!isOpen && summary ? (
            <span className="yd-pe-section__summary">{summary}</span>
          ) : null}
        </span>
        <ChevronRight
          className={`yd-pe-section__chevron${isOpen ? " yd-pe-section__chevron--open" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <div
          id={`yd-pe-section-panel-${id}`}
          role="region"
          aria-labelledby={`yd-pe-section-${id}`}
          className="yd-pe-section__panel"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
