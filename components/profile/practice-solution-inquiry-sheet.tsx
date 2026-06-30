"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Check, ChevronRight } from "lucide-react";

import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import { MedicalFormFooterActions, MedicalFormTextarea } from "@/components/forms/medical-form-ui";
import { buildStaticPreviewUrl, hasStaticTemplate } from "@/lib/practice-solutions/landing-configs/static-preview";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
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
import { findLandingCategoryVisual } from "@/lib/practice-solutions/landing-page-model";
import {
  buildLandingPreviewReturnPath,
  clearLandingInquirySuccess,
  LANDING_PREVIEW_RETURN_PARAM,
  readLandingInquirySuccess,
  storeLandingInquirySuccess,
  type LandingInquirySuccessRecord,
} from "@/lib/practice-solutions/landing-preview-return";
import { userFacingPracticeSolutionRequestError } from "@/lib/practice-solutions/request";
import { cn } from "@/lib/utils";

import type { InquiryTarget } from "./practice-solution-inquiry-types";

export type { InquiryTarget, PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";

type SubmitState = "idle" | "pending" | "success" | "error";

const ADVANCE_DELAY_MS = 320;

type InquiryHookOptions = {
  /** Pfad ohne landingReturn-Parameter — für Wiederaufnahme nach Vorschau. */
  resumePath?: string;
};

export function usePracticeSolutionInquiry(
  context: PracticeSolutionInquiryContext,
  options?: InquiryHookOptions
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumePath = options?.resumePath ?? "/profile/solutions";
  const [target, setTarget] = React.useState<InquiryTarget | null>(null);
  const [open, setOpen] = React.useState(false);
  const [initialView, setInitialView] = React.useState<"form" | "success">("form");
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const resumedRef = React.useRef(false);

  React.useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const closeSheet = React.useCallback(() => {
    setOpen(false);
    setTarget(null);
    setInitialView("form");
    clearLandingInquirySuccess();
    document.documentElement.style.overflow = "";
  }, []);

  React.useEffect(() => {
    if (!open) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }, [open]);

  React.useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const openInquiryFromRecord = React.useCallback(
    (record: LandingInquirySuccessRecord, view: "form" | "success") => {
      const solution = getPracticeSolution(record.inquiryId as PracticeSolutionId);
      if (!solution) return;
      const configId = resolveLandingConfigId(
        record.inquiryId as PracticeSolutionId,
        record.displayTitle,
        record.categoryId
      );
      setTarget({
        solution,
        displayTitle: record.displayTitle,
        configId,
      });
      setInitialView(view);
      setOpen(true);
    },
    []
  );

  React.useEffect(() => {
    if (resumedRef.current) return;
    if (searchParams.get(LANDING_PREVIEW_RETURN_PARAM) !== "1") return;

    const record = readLandingInquirySuccess();
    if (!record) return;

    resumedRef.current = true;
    openInquiryFromRecord(record, "success");
    router.replace(record.resumePath, { scroll: false });
  }, [openInquiryFromRecord, router, searchParams]);

  const openInquiry = React.useCallback(
    (inquiryId: PracticeSolutionId, displayTitle: string, categoryId?: string) => {
      const solution = getPracticeSolution(inquiryId);
      if (!solution) return;
      const configId = resolveLandingConfigId(inquiryId, displayTitle, categoryId);
      setTarget({ solution, displayTitle, configId });
      setInitialView("form");
      setOpen(true);
    },
    []
  );

  const portal =
    open && target && portalTarget
      ? createPortal(
          <InquiryErrorBoundary onClose={closeSheet}>
            <LandingBriefingStudio
              key={`${target.configId}-${target.displayTitle}-${initialView}`}
              target={target}
              context={context}
              resumePath={resumePath}
              initialView={initialView}
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
  resumePath: string;
  initialView: "form" | "success";
  onClose: () => void;
};

function LandingBriefingStudio({
  target,
  context,
  resumePath,
  initialView,
  onClose,
}: StudioProps) {
  const config = React.useMemo(() => getLandingConfig(target.configId), [target.configId]);
  const briefingFields = React.useMemo(() => getBriefingFields(config), [config]);
  const categoryVisual = React.useMemo(
    () => findLandingCategoryVisual(target.configId),
    [target.configId]
  );
  const storedSuccess = initialView === "success" ? readLandingInquirySuccess() : null;

  const [fieldValues, setFieldValues] = React.useState<LandingFieldValues>(() => {
    if (
      storedSuccess?.fieldValues &&
      storedSuccess.configId === config.id &&
      initialView === "success"
    ) {
      return storedSuccess.fieldValues;
    }
    return getEmptyBriefingValues(config);
  });
  const [expandedIndex, setExpandedIndex] = React.useState(0);
  const [summaryVisible, setSummaryVisible] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<SubmitState>(
    initialView === "success" ? "success" : "idle"
  );
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const advanceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const busy = submitState === "pending";
  const city = profileCityLine(context);
  const doctorLine = context.doctorDisplayName?.trim() || context.contactName.trim();
  const summaryItems = React.useMemo(
    () => buildBriefingFinalSummaryItems(config, fieldValues),
    [config, fieldValues]
  );

  const profileComplete =
    (context.practiceName?.trim() ?? "").length >= 2 &&
    (context.contactName?.trim() ?? "").length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((context.contactEmail ?? "").trim());

  const answeredCount = briefingFields.filter((f) =>
    isConfiguratorFieldComplete(f, fieldValues)
  ).length;
  const progressPct =
    briefingFields.length > 0
      ? Math.round((summaryVisible ? briefingFields.length : answeredCount) / briefingFields.length * 100)
      : 0;

  const canSubmit = profileComplete && summaryVisible && isLandingConfigComplete(config, fieldValues);
  const previewReturnPath = buildLandingPreviewReturnPath(resumePath);
  const previewUrl =
    submitState === "success" && hasStaticTemplate(config.id)
      ? buildStaticPreviewUrl(config.id, context, config, fieldValues, {
          returnPath: previewReturnPath,
        })
      : null;

  const openPreview = () => {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  React.useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!summaryVisible) return;
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [summaryVisible]);

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
      if (field.type !== "radio") return;
      if (!isConfiguratorFieldComplete(field, nextValues)) return;
      scheduleAdvance();
    },
    [scheduleAdvance]
  );

  const continueField = React.useCallback(
    (field: LandingFieldDef) => {
      if (!isConfiguratorFieldComplete(field, fieldValues)) return;
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceToNext();
    },
    [fieldValues, advanceToNext]
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
      return { ...prev, checkbox: { ...prev.checkbox, [fieldId]: nextSelected } };
    });
  };

  const setText = (field: LandingFieldDef, fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, text: { ...prev.text, [fieldId]: value } }));
  };


  const reopenField = (index: number) => {
    setSummaryVisible(false);
    setExpandedIndex(index);
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
      storeLandingInquirySuccess({
        inquiryId: config.solutionId,
        displayTitle: target.displayTitle,
        configId: config.id,
        resumePath,
        fieldValues,
      });
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError(userFacingPracticeSolutionRequestError(undefined));
    }
  };

  if (submitState === "success") {
    return (
      <MedicalFormShell
        title=" "
        subtitle=""
        onClose={onClose}
        headerVariant="compact"
        ariaLabel="Anfrage übermittelt"
        panelClassName="yd-medical-form-panel--landing-briefing yd-medical-form-panel--landing-success"
        footer={
          <div className="yd-medical-form-footer__row yd-medical-form-footer__row--stack">
            {previewUrl ? (
              <button type="button" className="yd-auth-btn-secondary w-full" onClick={openPreview}>
                Vorschau mit meinen Angaben öffnen
              </button>
            ) : null}
            <button type="button" className="yd-auth-btn-primary w-full" onClick={onClose}>
              Schließen
            </button>
          </div>
        }
      >
        <div className="yd-lp-briefing-success" role="status">
          <div className="yd-lp-briefing-success__icon" aria-hidden>
            <Check className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <YourDentistBrandLockup size="md" centered priority />
          <h2 className="yd-lp-briefing-success__title">Ihre Konfiguration wurde übermittelt</h2>
          {previewUrl ? (
            <p className="yd-lp-briefing-success__preview-hint">
              Optional können Sie jetzt eine Vorschau mit Ihren Stammdaten und Antworten öffnen —
              als Ausgangspunkt, nicht als fertige Seite.
            </p>
          ) : null}
          <div className="yd-lp-briefing-success__next">
            <p className="yd-lp-briefing-success__next-label">So geht es weiter</p>
            <ol className="yd-lp-briefing-success__steps">
              <li className="yd-lp-briefing-success__step">
                Wir prüfen Ihre Angaben und melden uns mit einem Entwurf, der zu Ihrer Praxis passt.
              </li>
              <li className="yd-lp-briefing-success__step">
                Sie geben frei, wenn alles stimmig ist — wir setzen Ihre Landingpage dann um.
              </li>
            </ol>
          </div>
        </div>
      </MedicalFormShell>
    );
  }

  return (
    <MedicalFormShell
      title={config.modalTitle}
      subtitle=""
      onClose={onClose}
      closeDisabled={busy}
      headerVariant="compact"
      ariaLabel={config.modalTitle}
      panelClassName={cn(
        "yd-medical-form-panel--landing-briefing",
        summaryVisible && "yd-medical-form-panel--summary"
      )}
      footer={
        summaryVisible ? (
          <MedicalFormFooterActions
            onCancel={onClose}
            cancelDisabled={busy}
            cancelLabel="Abbrechen"
            primaryLabel="Konfiguration senden"
            primaryPendingLabel="Wird gesendet …"
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
          {categoryVisual ? (
            <LandingBriefingVisual
              categoryLabel={categoryVisual.categoryLabel}
              title={target.displayTitle}
              image={categoryVisual.image}
              imagePosition={categoryVisual.imagePosition}
              variant="mobile"
            />
          ) : null}

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
              Bitte vervollständigen Sie Ihr Praxisprofil (Praxisname, Ansprechperson mit mindestens
              zwei Zeichen, gültige E-Mail).
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
                        onContinue={() => continueField(field)}
                        disabled={busy}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            </>
          ) : (
            <div ref={summaryRef} className="yd-lp-briefing-summary-block">
              <h2 className="yd-lp-briefing-summary-block__title">
                Zusammenfassung Ihrer Konfiguration
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

        {categoryVisual ? (
          <aside className="yd-lp-briefing-studio__preview" aria-hidden>
            <LandingBriefingVisual
              categoryLabel={categoryVisual.categoryLabel}
              title={target.displayTitle}
              image={categoryVisual.image}
              imagePosition={categoryVisual.imagePosition}
              variant="desktop"
            />
          </aside>
        ) : null}
      </div>
    </MedicalFormShell>
  );
}

function LandingBriefingVisual({
  categoryLabel,
  title,
  image,
  imagePosition,
  variant,
}: {
  categoryLabel: string;
  title: string;
  image: string;
  imagePosition?: string;
  variant: "mobile" | "desktop";
}) {
  return (
    <div
      className={cn(
        "yd-lp-briefing-visual",
        variant === "mobile" ? "yd-lp-briefing-visual--mobile" : "yd-lp-briefing-visual--desktop"
      )}
    >
      <div className="yd-lp-briefing-visual__frame">
        <Image
          src={image}
          alt=""
          fill
          sizes={variant === "mobile" ? "100vw" : "280px"}
          className="yd-lp-briefing-visual__image"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      </div>
      <p className="yd-lp-briefing-visual__category">{categoryLabel}</p>
      <p className="yd-lp-briefing-visual__title">{title}</p>
    </div>
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
  onContinue,
  disabled,
}: {
  field: LandingFieldDef;
  fieldValues: LandingFieldValues;
  onRadio: (fieldId: string, value: string) => void;
  onToggle: (fieldId: string, optionId: string) => void;
  onText: (fieldId: string, value: string) => void;
  onContinue: () => void;
  disabled?: boolean;
}) {
  const canContinue = isConfiguratorFieldComplete(field, fieldValues);

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
        <div className="yd-lp-briefing-question__actions">
          <button
            type="button"
            className="yd-lp-briefing-continue"
            onClick={onContinue}
            disabled={disabled || !canContinue}
          >
            Weiter
          </button>
        </div>
      </div>
    );
  }

  const isRadio = field.type === "radio";

  return (
    <div className="yd-lp-briefing-question yd-lp-briefing-question--active">
      <h3 className="yd-lp-briefing-question__title">{field.label}</h3>
      {field.description ? (
        <p className="yd-lp-briefing-question__desc">{field.description}</p>
      ) : null}
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
      {!isRadio && field.supplementText ? (
        <div className="yd-lp-briefing-question__supplement">
          <label
            htmlFor={`briefing-${field.supplementText.id}`}
            className="yd-lp-briefing-question__supplement-label"
          >
            {field.supplementText.label}
          </label>
          <MedicalFormTextarea
            id={`briefing-${field.supplementText.id}`}
            value={fieldValues.text[field.supplementText.id] ?? ""}
            onChange={(value) => onText(field.supplementText!.id, value)}
            rows={1}
            placeholder={field.supplementText.placeholder}
            disabled={disabled}
            aria-label={field.supplementText.label}
          />
        </div>
      ) : null}
      {!isRadio ? (
        <div className="yd-lp-briefing-question__actions">
          <button
            type="button"
            className="yd-lp-briefing-continue"
            onClick={onContinue}
            disabled={disabled || !canContinue}
          >
            Weiter
          </button>
        </div>
      ) : null}
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
