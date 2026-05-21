"use client";

import { RECURRENCE_LABELS } from "@/lib/tasks/recurrence";
import { cn } from "@/lib/utils";

function labelCls() {
  return "mb-1.5 block text-[12px] font-medium text-[#64748B]";
}

function fieldCls() {
  return "w-full rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-[14px] text-[#0F172A] shadow-none transition-colors focus:border-[rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-[rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-50";
}

type TaskRoutineFieldsProps = {
  disabled?: boolean;
  showCustomInterval?: boolean;
  onRecurrenceChange?: (value: string) => void;
  recurrenceValue?: string;
};

/** Calm practice-routine controls — recurrence & reminders (not calendar software). */
export function TaskRoutineFields({
  disabled,
  showCustomInterval = true,
  onRecurrenceChange,
  recurrenceValue = "once",
}: TaskRoutineFieldsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-[rgba(43,111,232,0.08)] bg-[rgba(43,111,232,0.02)] p-4">
      <div>
        <p className="text-[13px] font-medium text-[#0F172A]">Rhythmus</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748B]">
          Für wiederkehrende Praxisroutinen — ruhig und ohne Automations-Gefühl.
        </p>
      </div>

      <div>
        <span className={labelCls()}>Wiederholung</span>
        <select
          name="recurrence_type"
          disabled={disabled}
          value={onRecurrenceChange ? recurrenceValue : undefined}
          defaultValue={onRecurrenceChange ? undefined : "once"}
          onChange={
            onRecurrenceChange
              ? (e) => onRecurrenceChange(e.target.value)
              : undefined
          }
          className={fieldCls()}
        >
          {Object.entries(RECURRENCE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showCustomInterval && (onRecurrenceChange ? recurrenceValue === "custom" : true) ? (
        <div
          className={cn(
            onRecurrenceChange && recurrenceValue !== "custom" && "hidden"
          )}
          data-recurrence-custom
        >
          <label htmlFor="recurrence_interval_days" className={labelCls()}>
            Eigener Rhythmus (Tage)
          </label>
          <input
            id="recurrence_interval_days"
            name="recurrence_interval_days"
            type="number"
            min={1}
            max={365}
            disabled={disabled}
            placeholder="z. B. 14"
            className={fieldCls()}
          />
        </div>
      ) : null}

      <div className="border-t border-[rgba(15,23,42,0.06)] pt-4">
        <span className={labelCls()}>Erinnerung</span>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#475569]">
            <input
              type="checkbox"
              name="remind_self"
              value="true"
              disabled={disabled}
              className="h-4 w-4 rounded border-[rgba(15,23,42,0.15)]"
            />
            Mich erinnern
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#475569]">
            <input
              type="checkbox"
              name="remind_assignees"
              value="true"
              disabled={disabled}
              className="h-4 w-4 rounded border-[rgba(15,23,42,0.15)]"
            />
            Team erinnern
          </label>
        </div>
        <div className="mt-3">
          <label htmlFor="remind_before" className={labelCls()}>
            Zeitpunkt
          </label>
          <select
            id="remind_before"
            name="remind_before"
            disabled={disabled}
            className={fieldCls()}
            defaultValue=""
          >
            <option value="">Keine Erinnerung</option>
            <option value="same_day">Am Fälligkeitstag</option>
            <option value="one_day">1 Tag vorher</option>
            <option value="one_week">1 Woche vorher</option>
          </select>
        </div>
      </div>
    </div>
  );
}
