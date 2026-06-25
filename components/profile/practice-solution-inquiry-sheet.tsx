"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Check, ChevronRight } from "lucide-react";

import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import { MedicalFormFooterActions, MedicalFormTextarea } from "@/components/forms/medical-form-ui";
import { LandingInquiryLivePreview } from "@/components/profile/landing-inquiry-live-preview";
import { submitPracticeSolutionRequest } from "@/app/(protected)/profile/solutions/actions";
import {
  getPracticeSolution,
  type PracticeSolutionId,
} from "@/lib/practice-solutions/catalog";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  buildBriefingFinalSummaryItems,
  buildLandingConfigMessage,
  getBriefingFields,
  getEmptyBriefingValues,
  getFieldAnswerSummary,
  getLandingConfig,
  isConfiguratorFieldComplete,
  isLandingConfigComplete,
  profileCityLine,
  resolveLandingConfigId,
  type BriefingSummaryItem,
  type LandingFieldDef,
  type LandingFieldValues,
} from "@/lib/practice-solutions/landing-configs";
import { userFacingPracticeSolutionRequestError } from "@/lib/practice-solutions/request";
import { cn } from "@/lib/utils";

import type { InquiryTarget } from "./practice-solution-inquiry-types";

export type { InquiryTarget, PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";

type SubmitState = "idle" | "pending" | "success" | "error";

const ADVANCE_DELAY_MS = 320;
const CHECKBOX_ADVANCE_MS = 1400;

export function usePracticeSolutionInquiry(context: PracticeSolutionInquiryContext) {
  const [target, setTarget] = React.useState<InquiryTarget | null>(null);
  const [open, setOpen] = React.useState(false);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const closeSheet = React.useCallback(() => {
    setOpen(false);
    setTarget(null);
    document.documentElement.style.overflow = "";
  }, []);

  React.useEffect(() => {
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  const openInquiry = React.useCallback(
    (inquiryId: PracticeSolutionId, displayTitle: string, categoryId?: string) => {
      const solution = getPracticeSolution(inquiryId);
      if (!solution) return;
      const configId = resolveLandingConfigId(inquiryId, displayTitle, categoryId);
      setTarget({ solution, displayTitle, configId });
      setOpen(true);
    },
    []
  );

  const portal =
    open && target && portalTarget
      ? createPortal(
          <InquiryErrorBoundary onClose={closeSheet}>
            <LandingBriefingStudio
              key={`${target.configId}-${target.displayTitle}`}
              target={target}
              context={context}
              onClose={closeSheet}
            />
          </InquiryErrorBoundary>,
          portalTarget
        )
      : null;

  return { openInquiry, closeSheet, portal };
}

type StudioProps = {
  target: InquiryTarget;
  context: PracticeSolutionInquiryContext;
  onClose: () => void;
};

function LandingBriefingStudio({ target, context, onClose }: StudioProps) {
  const config = React.useMemo(() => getLandingConfig(target.configId), [target.configId]);
  const briefingFields = React.useMemo(() => getBriefingFields(config), [config]);

  const [fieldValues, setFieldValues] = React.useState<LandingFieldValues>(() =>
    getEmptyBriefingValues(config)
  );
  const [expandedIndex, setExpandedIndex] = React.useState(0);
  const [summaryVisible, setSummaryVisible] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const checkboxTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const busy = submitState === "pending";
  const city = profileCityLine(context);
  const doctorLine = context.doctorDisplayName?.trim() || context.contactName.trim();
  const summaryItems = React.useMemo(
    () => buildBriefingFinalSummaryItems(config, fieldValues),
    [config, fieldValues]
  );

  const profileComplete =
    (context.practiceName?.trim() ?? "").length >= 2 &&
    (context.contactName?.trim() ?? "").length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((context.contactEmail ?? "").trim());

  const answeredCount = briefingFields.filter((f) =>
    isConfiguratorFieldComplete(f, fieldValues)
  ).length;
  const progressPct =
    briefingFields.length > 0
      ? Math.round((summaryVisible ? briefingFields.length : answeredCount) / briefingFields.length * 100)
      : 0;

  const canSubmit = profileComplete && summaryVisible && isLandingConfigComplete(config, fieldValues);

  React.useEffect(() => {
    return () => {
      if (checkboxTimerRef.current) clearTimeout(checkboxTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const advanceToNext = React.useCallback(() => {
    setExpandedIndex((current) => {
      if (current >= briefingFields.length - 1) {
        setSummaryVisible(true);
        return current;
      }
      return current + 1;
    });
  }, [briefingFields.length]);

  const scheduleAdvance = React.useCallback(() => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(advanceToNext, ADVANCE_DELAY_MS);
  }, [advanceToNext]);

  const handleFieldComplete = React.useCallback(
    (field: LandingFieldDef, nextValues: LandingFieldValues) => {
      if (!isConfiguratorFieldComplete(field, nextValues)) return;

      if (field.type === "checkbox") {
        if (checkboxTimerRef.current) clearTimeout(checkboxTimerRef.current);
        checkboxTimerRef.current = setTimeout(scheduleAdvance, CHECKBOX_ADVANCE_MS);
        return;
      }

      scheduleAdvance();
    },
    [scheduleAdvance]
  );

  const setRadio = (field: LandingFieldDef, fieldId: string, value: string) => {
    setFieldValues((prev) => {
      const next = { ...prev, radio: { ...prev.radio, [fieldId]: value } };
      if (expandedIndex === briefingFields.findIndex((f) => f.id === fieldId)) {
        handleFieldComplete(field, next);
      }
      return next;
    });
  };

  const toggleChip = (field: LandingFieldDef, fieldId: string, optionId: string) => {
    setFieldValues((prev) => {
      const current = prev.checkbox[fieldId] ?? [];
      const nextSelected = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      const next = { ...prev, checkbox: { ...prev.checkbox, [fieldId]: nextSelected } };
      if (expandedIndex === briefingFields.findIndex((f) => f.id === fieldId)) {
        handleFieldComplete(field, next);
      }
      return next;
    });
  };

  const setText = (field: LandingFieldDef, fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, text: { ...prev.text, [fieldId]: value } }));
    if (field.type === "text" && field.optional && !value.trim() && checkboxTimerRef.current) {
      clearTimeout(checkboxTimerRef.current);
    }
  };

  const skipOptionalField = (field: LandingFieldDef) => {
    if (field.type !== "text" || !field.optional) return;
    scheduleAdvance();
  };

  const reopenField = (index: number) => {
    setSummaryVisible(false);
    setExpandedIndex(index);
    if (checkboxTimerRef.current) clearTimeout(checkboxTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setSubmitState("pending");
    setSubmitError(null);

    const message = buildLandingConfigMessage({
      config,
      values: fieldValues,
      displayTitle: target.displayTitle,
    });

    try {
      const result = await submitPracticeSolutionRequest({
        solutionId: config.solutionId,
        practiceName: context.practiceName,
        contactName: context.contactName,
        email: context.contactEmail,
        phone: context.contactPhone ?? "",
        message,
        budget: "",
        timeline: "",
        website: "",
      });

      if (!result.ok) {
        setSubmitState("error");
        setSubmitError(
          "message" in result && result.message
            ? result.message
            : userFacingPracticeSolutionRequestError(result.error)
        );
        return;
      }
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError(userFacingPracticeSolutionRequestError(undefined));
    }
  };

  if (submitState === "success") {
    return (
      <MedicalFormShell
        title="Vielen Dank."
        subtitle="Ihr Briefing wurde an unser Kreativteam übermittelt."
        onClose={onClose}
        ariaLabel="Briefing übermittelt"
        panelClassName="yd-medical-form-panel--landing-briefing"
        footer={
          <div className="yd-medical-form-footer__row">
            <button type="button" className="yd-auth-btn-primary w-full" onClick={onClose}>
              Schließen
            </button>
          </div>
        }
      >
        <p className="yd-lp-briefing-success__lead">
          Innerhalb der nächsten Werktage erstellen wir eine individuelle Landingpage auf Basis
          Ihrer Angaben und Ihres Praxisprofils. Sie erhalten anschließend eine Vorschau zur
          Freigabe.
        </p>
      </MedicalFormShell>
    );
  }

  return (
    <MedicalFormShell
      title={config.modalTitle}
      subtitle=""
      onClose={onClose}
      closeDisabled={busy}
      ariaLabel={config.modalTitle}
      panelClassName="yd-medical-form-panel--landing-briefing"
      footer={
        summaryVisible ? (
          <MedicalFormFooterActions
            onCancel={onClose}
            cancelDisabled={busy}
            cancelLabel="Abbrechen"
            primaryLabel="Projekt beauftragen"
            primaryPendingLabel="Wird beauftragt …"
            onPrimary={submit}
            primaryDisabled={!canSubmit}
            isPending={busy}
          />
        ) : (
          <div className="yd-medical-form-footer__row">
            <button type="button" className="yd-auth-btn-secondary w-full" onClick={onClose} disabled={busy}>
              Abbrechen
            </button>
          </div>
        )
      }
    >
      <div className="yd-lp-briefing-studio">
        <div className="yd-lp-briefing-studio__main">
          <PracticeBriefingCard
            practiceName={context.practiceName}
            doctorLine={doctorLine}
            city={city}
          />

          {submitError ? (
            <p className="yd-medical-form-alert" role="alert">
              {submitError}
            </p>
          ) : null}
          {!profileComplete ? (
            <p className="yd-medical-form-alert" role="status">
              Bitte vervollständigen Sie Ihr Praxisprofil.
            </p>
          ) : null}

          {!summaryVisible ? (
            <>
              <div className="yd-lp-briefing-progress" aria-hidden>
                <div className="yd-lp-briefing-progress__track">
                  <div
                    className="yd-lp-briefing-progress__fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="yd-lp-briefing-accordion">
                {briefingFields.map((field, index) => {
                  if (index > expandedIndex) return null;

                  const isCollapsed = index < expandedIndex;
                  const isActive = index === expandedIndex;
                  const answer = getFieldAnswerSummary(field, fieldValues);

                  if (isCollapsed && answer) {
                    return (
                      <CollapsedBriefingStep
                        key={field.id}
                        answer={answer}
                        onClick={() => reopenField(index)}
                      />
                    );
                  }

                  if (isActive) {
                    return (
                      <ActiveBriefingStep
                        key={field.id}
                        field={field}
                        fieldValues={fieldValues}
                        onRadio={(fieldId, value) => setRadio(field, fieldId, value)}
                        onToggle={(fieldId, optionId) => toggleChip(field, fieldId, optionId)}
                        onText={(fieldId, value) => setText(field, fieldId, value)}
                        onSkipOptional={() => skipOptionalField(field)}
                        disabled={busy}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </>
          ) : (
            <div className="yd-lp-briefing-summary-block">
              <h2 className="yd-lp-briefing-summary-block__title">
                Zusammenfassung Ihres Briefings
              </h2>
              <BriefingSummaryChecklist items={summaryItems} />
              <button
                type="button"
                className="yd-lp-briefing-summary-block__edit"
                onClick={() => {
                  setSummaryVisible(false);
                  setExpandedIndex(Math.max(0, briefingFields.length - 1));
                }}
              >
                Angaben bearbeiten
              </button>
            </div>
          )}

          <label className="yd-profile-solutions-honeypot" aria-hidden tabIndex={-1}>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <aside className="yd-lp-briefing-studio__preview" aria-label="Live-Vorschau">
          <LandingInquiryLivePreview
            variant="studio"
            config={config}
            fieldValues={fieldValues}
            profile={context}
          />
        </aside>
      </div>
    </MedicalFormShell>
  );
}

function PracticeBriefingCard({
  practiceName,
  doctorLine,
  city,
}: {
  practiceName: string;
  doctorLine: string;
  city: string | null;
}) {
  return (
    <div className="yd-lp-practice-card yd-lp-practice-card--compact">
      <div className="yd-lp-practice-card__status">
        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        <span>Praxisprofil übernommen</span>
      </div>
      <p className="yd-lp-practice-card__name">{practiceName}</p>
      {doctorLine ? <p className="yd-lp-practice-card__meta">{doctorLine}</p> : null}
      {city ? <p className="yd-lp-practice-card__meta">{city}</p> : null}
      <Link href="/profile/editor" className="yd-lp-practice-card__link">
        Profil bearbeiten
      </Link>
    </div>
  );
}

function CollapsedBriefingStep({
  answer,
  onClick,
}: {
  answer: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="yd-lp-briefing-collapsed" onClick={onClick}>
      <span className="yd-lp-briefing-collapsed__check" aria-hidden>
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="yd-lp-briefing-collapsed__value">{answer}</span>
      <ChevronRight className="yd-lp-briefing-collapsed__chevron h-4 w-4" aria-hidden />
    </button>
  );
}

function ActiveBriefingStep({
  field,
  fieldValues,
  onRadio,
  onToggle,
  onText,
  onSkipOptional,
  disabled,
}: {
  field: LandingFieldDef;
  fieldValues: LandingFieldValues;
  onRadio: (fieldId: string, value: string) => void;
  onToggle: (fieldId: string, optionId: string) => void;
  onText: (fieldId: string, value: string) => void;
  onSkipOptional: () => void;
  disabled?: boolean;
}) {
  if (field.type === "text") {
    return (
      <div className="yd-lp-briefing-question yd-lp-briefing-question--active">
        <h3 className="yd-lp-briefing-question__title">{field.label}</h3>
        <MedicalFormTextarea
          id={`briefing-${field.id}`}
          value={fieldValues.text[field.id] ?? ""}
          onChange={(value) => onText(field.id, value)}
          rows={2}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-label={field.label}
        />
        {field.optional ? (
          <button type="button" className="yd-lp-briefing-skip" onClick={onSkipOptional} disabled={disabled}>
            Ohne Angaben fortfahren
          </button>
        ) : null}
      </div>
    );
  }

  const isRadio = field.type === "radio";

  return (
    <div className="yd-lp-briefing-question yd-lp-briefing-question--active">
      <h3 className="yd-lp-briefing-question__title">{field.label}</h3>
      <div
        className="yd-lp-selection-cards"
        role={isRadio ? "radiogroup" : "group"}
        aria-label={field.label}
      >
        {field.options.map((opt) => {
          const active = isRadio
            ? fieldValues.radio[field.id] === opt.id
            : (fieldValues.checkbox[field.id] ?? []).includes(opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              role={isRadio ? "radio" : undefined}
              aria-checked={isRadio ? active : undefined}
              aria-pressed={!isRadio ? active : undefined}
              disabled={disabled}
              className={cn("yd-lp-selection-card", active && "yd-lp-selection-card--selected")}
              onClick={() =>
                isRadio ? onRadio(field.id, opt.id) : onToggle(field.id, opt.id)
              }
            >
              <span className="yd-lp-selection-card__mark" aria-hidden>
                {active ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
              </span>
              <span className="yd-lp-selection-card__label">{opt.label}</span>
              {opt.description ? (
                <span className="yd-lp-selection-card__desc">{opt.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BriefingSummaryChecklist({ items }: { items: BriefingSummaryItem[] }) {
  return (
    <ul className="yd-lp-briefing-summary">
      {items.map((item) => (
        <li key={item.id} className="yd-lp-briefing-summary__item">
          <span className="yd-lp-briefing-summary__check" aria-hidden>
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <div className="yd-lp-briefing-summary__copy">
            <span className="yd-lp-briefing-summary__label">{item.label}</span>
            {item.value ? (
              <span className="yd-lp-briefing-summary__value">{item.value}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

class InquiryErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[PracticeSolutionInquiry]", error);
    document.documentElement.style.overflow = "";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="yd-lp-briefing-error" role="alert">
          <p className="yd-medical-form-alert">
            Der Briefing-Konfigurator konnte nicht geladen werden.
          </p>
          <button type="button" className="yd-auth-btn-primary" onClick={this.props.onClose}>
            Schließen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
