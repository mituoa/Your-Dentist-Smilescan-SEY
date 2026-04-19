"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldWithCounterProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "number" | "url";
  required?: boolean;
  helper?: string;
  multiline?: boolean;
  rows?: number;
}

export function FieldWithCounter({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  type = "text",
  required = false,
  helper,
  multiline = false,
  rows = 4,
}: FieldWithCounterProps) {
  const length = value?.length || 0;
  const isOver = length > maxLength;
  const isNearLimit = length > maxLength * 0.9 && !isOver;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-xs uppercase tracking-wider text-text-tertiary"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>
        <span
          className={`text-[10px] font-mono ${
            isOver
              ? "text-danger"
              : isNearLimit
                ? "text-warning"
                : "text-text-tertiary"
          }`}
        >
          {length}/{maxLength}
        </span>
      </div>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none font-serif leading-relaxed"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {helper && (
        <p className="text-[11px] text-text-tertiary leading-relaxed">{helper}</p>
      )}
    </div>
  );
}
