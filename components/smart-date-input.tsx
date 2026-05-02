"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatIsoToGermanPadded,
  maxBirthUtc,
  minBirthUtc,
  parseSmartDate,
  pad2,
  toIso,
} from "@/lib/dates/smart-date-parse";

const BLUE = "#2F80ED";

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

const WEEK_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

function utcPartsFromMs(ms: number): { y: number; m0: number; d: number } {
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m0: d.getUTCMonth(), d: d.getUTCDate() };
}

function monthCells(year: number, month0: number): (number | null)[] {
  const firstDow = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const offset = (firstDow + 6) % 7;
  const dim = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);
  return cells;
}

function monthYearToIndex(y: number, m0: number): number {
  return y * 12 + m0;
}

function clampMonthYearView(
  y: number,
  m0: number,
  minP: { y: number; m0: number },
  maxP: { y: number; m0: number }
): { y: number; m0: number } {
  const minIdx = monthYearToIndex(minP.y, minP.m0);
  const maxIdx = monthYearToIndex(maxP.y, maxP.m0);
  const idx = monthYearToIndex(y, m0);
  if (idx < minIdx) return { y: minP.y, m0: minP.m0 };
  if (idx > maxIdx) return { y: maxP.y, m0: maxP.m0 };
  return { y, m0 };
}

export type SmartDateInputHandle = {
  flush: () => { ok: true; iso: string | null } | { ok: false };
};

export type SmartDateInputProps = {
  value: string | null;
  onChange: (iso: string | null) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export const SmartDateInput = forwardRef<SmartDateInputHandle, SmartDateInputProps>(
  function SmartDateInput({ value, onChange, disabled, "aria-label": ariaLabel }, ref) {
    const inputId = useId();
    const hintId = `${inputId}-hint`;
    const minP = useMemo(() => utcPartsFromMs(minBirthUtc()), []);
    const maxP = useMemo(() => utcPartsFromMs(maxBirthUtc()), []);
    const minIdx = monthYearToIndex(minP.y, minP.m0);
    const maxIdx = monthYearToIndex(maxP.y, maxP.m0);

    const clampMv = useCallback(
      (y: number, m0: number) => clampMonthYearView(y, m0, minP, maxP),
      [minP, maxP]
    );

    const [localText, setLocalText] = useState("");
    const localTextRef = useRef("");
    const [hint, setHint] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [viewY, setViewY] = useState(1990);
    const [viewM0, setViewM0] = useState(5);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 336 });

    const wrapRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      localTextRef.current = localText;
    }, [localText]);

    useEffect(() => {
      setLocalText(value ? formatIsoToGermanPadded(value) : "");
      setHint(null);
    }, [value]);

    const syncViewFromValue = useCallback(() => {
      if (value) {
        const y = parseInt(value.slice(0, 4), 10);
        const m0 = parseInt(value.slice(5, 7), 10) - 1;
        const clamped = clampMonthYearView(y, m0, minP, maxP);
        setViewY(clamped.y);
        setViewM0(clamped.m0);
      } else {
        const clamped = clampMonthYearView(1990, 5, minP, maxP);
        setViewY(clamped.y);
        setViewM0(clamped.m0);
      }
    }, [value, minP, maxP]);

    const commitFromText = useCallback(
      (text: string): { ok: true; iso: string | null } | { ok: false } => {
        const r = parseSmartDate(text);
        if (!r.ok) {
          setHint(r.error);
          return { ok: false };
        }
        if (r.iso === null) {
          onChange(null);
          setLocalText("");
          setHint(null);
          return { ok: true, iso: null };
        }
        onChange(r.iso);
        setLocalText(formatIsoToGermanPadded(r.iso));
        setHint(null);
        return { ok: true, iso: r.iso };
      },
      [onChange]
    );

    useImperativeHandle(
      ref,
      () => ({
        flush: () => commitFromText(localTextRef.current),
      }),
      [commitFromText]
    );

    useLayoutEffect(() => {
      if (!open || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const w = Math.max(320, Math.min(360, r.width));
      let left = r.left;
      if (left + w > window.innerWidth - 16) left = Math.max(16, window.innerWidth - 16 - w);
      setPos({ top: r.bottom + 8, left, width: w });
    }, [open, viewY, viewM0]);

    useEffect(() => {
      if (!open) return;
      const onDoc = (e: MouseEvent) => {
        const t = e.target as Node;
        if (wrapRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const openPanel = () => {
      if (disabled) return;
      syncViewFromValue();
      setOpen(true);
      setHint(null);
    };

    const viewIdx = monthYearToIndex(viewY, viewM0);
    const canPrev = viewIdx > minIdx;
    const canNext = viewIdx < maxIdx;

    const goPrev = () => {
      if (!canPrev) return;
      if (viewM0 === 0) {
        setViewY((y) => y - 1);
        setViewM0(11);
      } else {
        setViewM0((m) => m - 1);
      }
    };

    const goNext = () => {
      if (!canNext) return;
      if (viewM0 === 11) {
        setViewY((y) => y + 1);
        setViewM0(0);
      } else {
        setViewM0((m) => m + 1);
      }
    };

    const pickDay = (day: number) => {
      const pr = parseSmartDate(`${pad2(day)}.${pad2(viewM0 + 1)}.${viewY}`);
      if (!pr.ok || !pr.iso) return;
      onChange(pr.iso);
      setLocalText(formatIsoToGermanPadded(pr.iso));
      setHint(null);
      setOpen(false);
    };

    const cells = monthCells(viewY, viewM0);
    const selectedIso = value;
    const { y: ty, m0: tm, d: td } = utcPartsFromMs(maxBirthUtc());
    const todayIsoStr = toIso(ty, tm + 1, td);

    const years: number[] = [];
    for (let y = maxP.y; y >= minP.y; y--) years.push(y);

    const panel =
      open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Datum auswählen"
              className="fixed z-[1100] overflow-hidden rounded-[10px] bg-white"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 28px -8px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div className="border-b border-[#E2E8F0] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canPrev}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Vorheriger Monat"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
                    <label className="sr-only" htmlFor={`${inputId}-m`}>
                      Monat
                    </label>
                    <select
                      id={`${inputId}-m`}
                      value={viewM0}
                      onChange={(e) => {
                        const m0 = parseInt(e.target.value, 10);
                        const c = clampMv(viewY, m0);
                        setViewY(c.y);
                        setViewM0(c.m0);
                      }}
                      className="min-h-10 max-w-[140px] flex-1 cursor-pointer rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[14px] font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#2F80ED] focus:ring-2 focus:ring-[rgba(47,128,237,0.12)] disabled:opacity-50"
                    >
                      {MONTHS_DE.map((name, i) => (
                        <option key={name} value={i}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor={`${inputId}-y`}>
                      Jahr
                    </label>
                    <select
                      id={`${inputId}-y`}
                      value={viewY}
                      onChange={(e) => {
                        const y = parseInt(e.target.value, 10);
                        const c = clampMv(y, viewM0);
                        setViewY(c.y);
                        setViewM0(c.m0);
                      }}
                      className="min-h-10 w-[96px] cursor-pointer rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[14px] font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#2F80ED] focus:ring-2 focus:ring-[rgba(47,128,237,0.12)] disabled:opacity-50"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canNext}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Nächster Monat"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="px-3 pb-4 pt-2">
                <div className="mb-1 grid grid-cols-7 gap-0.5">
                  {WEEK_DE.map((w) => (
                    <div
                      key={w}
                      className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {w}
                    </div>
                  ))}
                </div>
                <div className="grid min-h-[252px] grid-cols-7 gap-0.5">
                  {cells.map((day, idx) => {
                    if (day == null) {
                      return <div key={`e-${idx}`} className="aspect-square" />;
                    }
                    const iso = toIso(viewY, viewM0 + 1, day);
                    const pr = parseSmartDate(
                      `${pad2(day)}.${pad2(viewM0 + 1)}.${viewY}`
                    );
                    const ok = pr.ok && pr.iso !== null;
                    const sel = selectedIso === iso;
                    const isToday = iso === todayIsoStr;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!ok}
                        onClick={() => pickDay(day)}
                        className={[
                          "flex aspect-square items-center justify-center rounded-[10px] text-[14px] font-medium transition-colors duration-150",
                          sel
                            ? "text-white shadow-sm"
                            : ok
                              ? "text-slate-700 hover:bg-slate-50"
                              : "cursor-not-allowed text-slate-300",
                          !sel && isToday && ok ? "ring-1 ring-[#2F80ED]/35" : "",
                        ].join(" ")}
                        style={
                          sel
                            ? { background: BLUE, boxShadow: "0 2px 8px rgba(47,128,237,0.25)" }
                            : undefined
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )
        : null;

    return (
      <div ref={wrapRef} className="relative w-full">
        <div
          className="flex min-h-[48px] rounded-[10px] border border-[#E2E8F0] bg-white outline-none transition focus-within:border-[#2F80ED] focus-within:ring-[3px] focus-within:ring-[rgba(47,128,237,0.08)]"
        >
          <input
            id={inputId}
            type="text"
            disabled={disabled}
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              setHint(null);
            }}
            onClick={() => {
              if (!disabled) openPanel();
            }}
            onBlur={() => commitFromText(localTextRef.current)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitFromText(localTextRef.current);
              }
            }}
            autoComplete="bday"
            inputMode="numeric"
            aria-invalid={Boolean(hint)}
            aria-describedby={hint ? hintId : undefined}
            aria-label={ariaLabel ?? "Geburtsdatum"}
            className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-[15px] text-[#0F172A] outline-none ring-0 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="TT.MM.JJJJ"
          />
          <div className="my-2.5 w-px shrink-0 self-stretch bg-slate-200" aria-hidden />
          <button
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? setOpen(false) : openPanel())}
            className="flex w-11 shrink-0 items-center justify-center rounded-r-[10px] text-slate-400 outline-none transition hover:bg-slate-50 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.2)] focus-visible:ring-offset-0 disabled:opacity-40"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="Datum grafisch auswählen"
            title="Datum auswählen"
          >
            <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
        {hint ? (
          <p id={hintId} className="mt-1.5 text-[13px] leading-snug text-slate-500" aria-live="polite">
            {hint}
          </p>
        ) : null}
        {panel}
      </div>
    );
  }
);

SmartDateInput.displayName = "SmartDateInput";
