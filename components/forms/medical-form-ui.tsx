"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MedicalFormSection(props: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("yd-medical-form-section", props.className)}>
      <div className="yd-medical-form-section__head">
        <h2 className="yd-medical-form-section__title">{props.title}</h2>
        {props.hint ? <p className="yd-medical-form-section__hint">{props.hint}</p> : null}
      </div>
      <div className="yd-medical-form-section__body">{props.children}</div>
    </section>
  );
}

export function MedicalFormLabel(props: {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={props.htmlFor} className="yd-medical-form-label">
      {props.children}
      {props.optional ? (
        <span className="yd-medical-form-label__optional"> (optional)</span>
      ) : null}
    </label>
  );
}

export function MedicalFormFieldStack(props: { children: ReactNode; className?: string }) {
  return <div className={cn("yd-auth-form-stack yd-medical-form-stack", props.className)}>{props.children}</div>;
}

export function MedicalFormTextarea(props: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
}) {
  return (
    <textarea
      id={props.id}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      rows={props.rows ?? 5}
      placeholder={props.placeholder}
      disabled={props.disabled}
      required={props.required}
      aria-label={props["aria-label"]}
      className="yd-medical-form-textarea"
    />
  );
}

export type MedicalSegmentOption<T extends string> = {
  id: T;
  label: string;
};

export function MedicalFormSegmented<T extends string>(props: {
  name: string;
  options: MedicalSegmentOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  allowDeselect?: boolean;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <div
      className="yd-medical-segmented"
      role="radiogroup"
      aria-label={props["aria-label"]}
    >
      {props.options.map((opt) => {
        const active = props.value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={props.disabled}
            name={props.name}
            className={cn(
              "yd-medical-segmented__btn",
              active && "yd-medical-segmented__btn--active"
            )}
            onClick={() => {
              if (props.disabled) return;
              if (active && props.allowDeselect) props.onChange(null);
              else props.onChange(opt.id);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function MedicalFormFooterActions(props: {
  onCancel: () => void;
  cancelDisabled?: boolean;
  cancelLabel?: string;
  primaryLabel: string;
  primaryPendingLabel?: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  isPending?: boolean;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="yd-medical-form-footer__row">
      <div className="yd-medical-form-footer__left">
        {props.secondaryAction}
        <button
          type="button"
          className="yd-auth-btn-secondary yd-medical-form-footer__cancel"
          disabled={props.cancelDisabled || props.isPending}
          onClick={props.onCancel}
        >
          {props.cancelLabel ?? "Abbrechen"}
        </button>
      </div>
      <button
        type="button"
        className="yd-auth-btn-primary yd-medical-form-footer__primary"
        disabled={props.primaryDisabled || props.isPending}
        onClick={props.onPrimary}
      >
        {props.isPending
          ? (props.primaryPendingLabel ?? "Wird gespeichert…")
          : props.primaryLabel}
      </button>
    </div>
  );
}

export function MedicalFormUploadEmpty(props: {
  title: string;
  hint?: string;
  dragActive?: boolean;
  disabled?: boolean;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "yd-medical-upload",
        props.dragActive && "yd-medical-upload--drag",
        props.disabled && "yd-medical-upload--disabled"
      )}
      onDragEnter={props.onDragEnter}
      onDragLeave={props.onDragLeave}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
    >
      <input
        {...props.inputProps}
        className="yd-medical-upload__input"
        disabled={props.disabled}
      />
      <div className="yd-medical-upload__inner">
        {props.icon}
        <p className="yd-medical-upload__title">{props.title}</p>
        {props.hint ? <p className="yd-medical-upload__hint">{props.hint}</p> : null}
      </div>
    </div>
  );
}
