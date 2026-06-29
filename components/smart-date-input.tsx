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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
] as const;

const WEEK_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
const WEEK_DE_MOBILE = ["M", "D", "M", "D", "F", "S", "S"] as const;

type PickerView = "days" | "months" | "years";

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
    const isMobile = useIsMobile();
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
    const [pickerView, setPickerView] = useState<PickerView>("days");
    const [viewY, setViewY] = useState(1990);
    const [viewM0, setViewM0] = useState(5);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 336, placement: "below" as "below" | "above" });

    const wrapRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const yearsListRef = useRef<HTMLDivElement>(null);

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
      if (isMobile) {
        setPos({
          top: 0,
          left: 0,
          width: window.innerWidth,
          placement: "below",
        });
        return;
      }
      const r = wrapRef.current.getBoundingClientRect();
      const w = Math.max(300, Math.min(340, r.width));
      let left = r.left;
      if (left + w > window.innerWidth - 16) left = Math.max(16, window.innerWidth - 16 - w);
      const panelH = 380;
      const spaceBelow = window.innerHeight - r.bottom - 12;
      const spaceAbove = r.top - 12;
      const placement =
        spaceBelow < panelH && spaceAbove > spaceBelow ? "above" : "below";
      const top =
        placement === "below"
          ? r.bottom + 8
          : Math.max(12, r.top - panelH - 8);
      setPos({ top, left, width: w, placement });
    }, [open, viewY, viewM0, pickerView, isMobile]);

    useEffect(() => {
      if (!open || pickerView !== "years") return;
      const el = yearsListRef.current?.querySelector<HTMLButtonElement>(
        `[data-year="${viewY}"]`
      );
      el?.scrollIntoView({ block: "center" });
    }, [open, pickerView, viewY]);

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
      setPickerView("days");
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

    const pickMonth = (m0: number) => {
      const c = clampMv(viewY, m0);
      setViewY(c.y);
      setViewM0(c.m0);
      setPickerView("days");
    };

    const pickYear = (y: number) => {
      const c = clampMv(y, viewM0);
      setViewY(c.y);
      setViewM0(c.m0);
      setPickerView("days");
    };

    const years: number[] = [];
    for (let y = maxP.y; y >= minP.y; y--) years.push(y);

    const panel =
      open && typeof document !== "undefined"
        ? createPortal(
            <>
              {isMobile ? (
                <button
                  type="button"
                  className="yd-smart-date-backdrop"
                  aria-label="Datumswahl schließen"
                  onClick={() => setOpen(false)}
                />
              ) : null}
              <div
                ref={panelRef}
                role="dialog"
                aria-label="Datum auswählen"
                className={cn(
                  "yd-smart-date-popover z-[2500]",
                  isMobile
                    ? "yd-smart-date-popover--mobile fixed inset-x-0 bottom-0"
                    : "yd-smart-date-popover--anchored fixed",
                  !isMobile && pos.placement === "above" && "yd-smart-date-popover--above"
                )}
                style={
                  isMobile
                    ? undefined
                    : { top: pos.top, left: pos.left, width: pos.width }
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="yd-smart-date-popover__header">
                  {pickerView === "days" ? (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        disabled={!canPrev}
                        className="yd-smart-date-nav"
                        aria-label="Vorheriger Monat"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                      </button>
                      {isMobile ? (
                        <button
                          type="button"
                          className="yd-smart-date-title"
                          onClick={() => setPickerView("months")}
                          aria-label="Monat und Jahr wählen"
                        >
                          {MONTHS_SHORT[viewM0]} {viewY}
                        </button>
                      ) : (
                        <div className="yd-smart-date-popover__title-group">
                          <button
                            type="button"
                            className="yd-smart-date-chip"
                            onClick={() => setPickerView("months")}
                            aria-label="Monat wählen"
                          >
                            {MONTHS_DE[viewM0]}
                          </button>
                          <button
                            type="button"
                            className="yd-smart-date-chip"
                            onClick={() => setPickerView("years")}
                            aria-label="Jahr wählen"
                          >
                            {viewY}
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!canNext}
                        className="yd-smart-date-nav"
                        aria-label="Nächster Monat"
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="yd-smart-date-nav"
                        onClick={() => setPickerView("days")}
                        aria-label="Zurück zum Kalender"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <div className="yd-smart-date-popover__subtitle">
                        {pickerView === "months" ? (
                          isMobile ? (
                            <button
                              type="button"
                              className="yd-smart-date-title yd-smart-date-title--inline"
                              onClick={() => setPickerView("years")}
                            >
                              {viewY}
                            </button>
                          ) : (
                            "Monat wählen"
                          )
                        ) : isMobile ? (
                          String(viewY)
                        ) : (
                          "Jahr wählen"
                        )}
                      </div>
                      <span className="yd-smart-date-nav yd-smart-date-nav--ghost" aria-hidden />
                    </>
                  )}
                </div>

                {pickerView === "days" ? (
                  <div className="yd-smart-date-popover__body">
                    <div className="yd-smart-date-weekdays">
                      {(isMobile ? WEEK_DE_MOBILE : WEEK_DE).map((w, index) => (
                        <div key={`${w}-${index}`} className="yd-smart-date-weekday">
                          {w}
                        </div>
                      ))}
                    </div>
                  <div className="yd-smart-date-grid">
                    {cells.map((day, idx) => {
                      if (day == null) {
                        return <div key={`e-${idx}`} className="yd-smart-date-cell yd-smart-date-cell--empty" />;
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
                          className={cn(
                            "yd-smart-date-cell",
                            sel && "yd-smart-date-cell--selected",
                            !sel && isToday && ok && "yd-smart-date-cell--today",
                            !ok && "yd-smart-date-cell--disabled"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {pickerView === "months" ? (
                <div className="yd-smart-date-popover__body yd-smart-date-popover__body--picker">
                  <div className="yd-smart-date-month-grid">
                    {MONTHS_SHORT.map((label, m0) => {
                      const idx = monthYearToIndex(viewY, m0);
                      const inRange = idx >= minIdx && idx <= maxIdx;
                      const active = viewM0 === m0;
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={!inRange}
                          onClick={() => pickMonth(m0)}
                          className={cn(
                            "yd-smart-date-month",
                            active && "yd-smart-date-month--active"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {pickerView === "years" ? (
                <div className="yd-smart-date-popover__body yd-smart-date-popover__body--picker">
                  <div ref={yearsListRef} className="yd-smart-date-year-list">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        data-year={y}
                        onClick={() => pickYear(y)}
                        className={cn(
                          "yd-smart-date-year",
                          viewY === y && "yd-smart-date-year--active"
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
            </>,
            document.body
          )
        : null;

    return (
      <div ref={wrapRef} className="yd-smart-date relative w-full">
        <div
          className={cn(
            "yd-smart-date-field",
            open && "yd-smart-date-field--open",
            hint && "yd-smart-date-field--invalid"
          )}
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
            onFocus={() => {
              if (!disabled) openPanel();
            }}
            onBlur={() => commitFromText(localTextRef.current)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitFromText(localTextRef.current);
              }
              if (e.key === "ArrowDown" && !open && !disabled) {
                e.preventDefault();
                openPanel();
              }
            }}
            autoComplete="bday"
            inputMode="numeric"
            aria-invalid={Boolean(hint)}
            aria-describedby={hint ? hintId : undefined}
            aria-label={ariaLabel ?? "Geburtsdatum"}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="yd-smart-date-input"
            placeholder="TT.MM.JJJJ"
          />
          <button
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? setOpen(false) : openPanel())}
            className="yd-smart-date-trigger"
            aria-label="Datum grafisch auswählen"
            title="Datum auswählen"
          >
            <CalendarDays className="h-[17px] w-[17px]" strokeWidth={1.65} />
          </button>
        </div>
        {hint ? (
          <p id={hintId} className="yd-smart-date-hint" role="alert" aria-live="polite">
            {hint}
          </p>
        ) : null}
        {panel}
      </div>
    );
  }
);

SmartDateInput.displayName = "SmartDateInput";
