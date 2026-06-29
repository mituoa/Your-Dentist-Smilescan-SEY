"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { CalendarOff, Clock, Plus, Trash2 } from "lucide-react";

import { saveOpeningHoursConfig } from "@/app/(protected)/settings/actions";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import {
  defaultOpeningHoursConfig,
  newSpecialPeriodId,
  SPECIAL_PERIOD_KIND_LABELS,
  type OpeningHoursConfig,
  type SpecialPeriod,
  type SpecialPeriodKind,
  type TimeSlot,
  type WeekdayId,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "@/lib/settings/opening-hours";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT: Record<WeekdayId, string> = {
  mon: "Mo",
  tue: "Di",
  wed: "Mi",
  thu: "Do",
  fri: "Fr",
  sat: "Sa",
  sun: "So",
};

type SettingsOpeningHoursPanelProps = {
  initialConfig: OpeningHoursConfig | null;
  appointmentLink: string | null;
  onSaved?: () => void;
  onError?: (message: string) => void;
};

function emptySlot(): TimeSlot {
  return { start: "09:00", end: "12:00" };
}

export function SettingsOpeningHoursPanel({
  initialConfig,
  appointmentLink,
  onSaved,
  onError,
}: SettingsOpeningHoursPanelProps) {
  const isMobile = useIsMobile();
  const [config, setConfig] = useState<OpeningHoursConfig>(
    initialConfig ?? defaultOpeningHoursConfig()
  );
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setConfig(initialConfig ?? defaultOpeningHoursConfig());
  }, [initialConfig]);

  const persist = useCallback(
    (next: OpeningHoursConfig) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          const res = await saveOpeningHoursConfig(next);
          if (res.error) {
            onError?.(res.error);
            return;
          }
          setSaveHint("Gespeichert");
          setTimeout(() => setSaveHint(null), 1800);
          onSaved?.();
        });
      }, 700);
    },
    [onError, onSaved]
  );

  const update = (updater: (prev: OpeningHoursConfig) => OpeningHoursConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  };

  const updateDay = (day: WeekdayId, patch: Partial<OpeningHoursConfig["weekly"][WeekdayId]>) => {
    update((prev) => ({
      ...prev,
      weekly: {
        ...prev.weekly,
        [day]: { ...prev.weekly[day], ...patch },
      },
    }));
  };

  const updateDaySlot = (day: WeekdayId, index: number, patch: Partial<TimeSlot>) => {
    update((prev) => {
      const slots = prev.weekly[day].slots.map((s, i) =>
        i === index ? { ...s, ...patch } : s
      );
      return {
        ...prev,
        weekly: { ...prev.weekly, [day]: { ...prev.weekly[day], slots } },
      };
    });
  };

  const addDaySlot = (day: WeekdayId) => {
    update((prev) => ({
      ...prev,
      weekly: {
        ...prev.weekly,
        [day]: {
          ...prev.weekly[day],
          closed: false,
          slots: [...prev.weekly[day].slots, { start: "14:00", end: "18:00" }],
        },
      },
    }));
  };

  const removeDaySlot = (day: WeekdayId, index: number) => {
    update((prev) => ({
      ...prev,
      weekly: {
        ...prev.weekly,
        [day]: {
          ...prev.weekly[day],
          slots: prev.weekly[day].slots.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const addSpecialPeriod = (kind: SpecialPeriodKind) => {
    const today = new Date().toISOString().slice(0, 10);
    const period: SpecialPeriod = {
      id: newSpecialPeriodId(),
      label:
        kind === "holiday"
          ? "Feiertag"
          : kind === "vacation"
            ? "Praxisurlaub"
            : "Sonderöffnungszeit",
      startDate: today,
      endDate: today,
      kind,
      closed: kind !== "special",
      slots: kind === "special" ? [emptySlot()] : [],
    };
    update((prev) => ({
      ...prev,
      specialPeriods: [...prev.specialPeriods, period],
    }));
  };

  const updateSpecial = (id: string, patch: Partial<SpecialPeriod>) => {
    update((prev) => ({
      ...prev,
      specialPeriods: prev.specialPeriods.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
  };

  const removeSpecial = (id: string) => {
    update((prev) => ({
      ...prev,
      specialPeriods: prev.specialPeriods.filter((p) => p.id !== id),
    }));
  };

  const busy = isPending;

  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">Öffnungszeiten</h2>
          <p className="yd-settings-v2__panel-copy">
            Sprechzeiten, Pausen und Sonderfälle — sichtbar auf Ihrem Patientenprofil.
          </p>
        </div>
        {saveHint ? (
          <p className="yd-settings-v2__save-hint" aria-live="polite">
            {saveHint}
          </p>
        ) : null}
      </div>

      <fieldset
        disabled={busy}
        aria-busy={busy}
        className="yd-settings-v2__hours-fieldset"
      >
        <section className="yd-settings-v2__hours-block">
          <div className="yd-settings-v2__hours-block-head">
            <h3 className="yd-settings-v2__hours-block-title">Online-Terminbuchung</h3>
            {!isMobile ? (
              <p className="yd-settings-v2__hours-block-copy">
                Steuert, ob Patienten online Termine buchen können.
              </p>
            ) : null}
          </div>
          <label className="yd-settings-v2__toggle">
            <input
              type="checkbox"
              checked={config.onlineBookingEnabled}
              onChange={(e) =>
                update((prev) => ({ ...prev, onlineBookingEnabled: e.target.checked }))
              }
            />
            <span className="yd-settings-v2__toggle-ui" aria-hidden />
            <span className="yd-settings-v2__toggle-label">
              {config.onlineBookingEnabled ? "Aktiv" : "Inaktiv"}
            </span>
          </label>
          {appointmentLink ? (
            <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--compact">
              Terminlink hinterlegt
            </p>
          ) : (
            <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--compact">
              Terminlink unter Praxisprofil hinterlegen
            </p>
          )}
        </section>

        <section className="yd-settings-v2__hours-block">
          <div className="yd-settings-v2__hours-block-head">
            <h3 className="yd-settings-v2__hours-block-title">Reguläre Woche</h3>
            {!isMobile ? (
              <p className="yd-settings-v2__hours-block-copy">
                Mehrere Zeitfenster pro Tag ermöglichen Mittagspausen.
              </p>
            ) : null}
          </div>

          <ul className={cn("yd-settings-v2__hours-days", isMobile && "yd-settings-v2__hours-days--mobile")}>
            {WEEKDAY_ORDER.map((day) => {
              const schedule = config.weekly[day];
              const dayLabel = isMobile ? WEEKDAY_SHORT[day] : WEEKDAY_LABELS[day];
              return (
                <li key={day} className="yd-settings-v2__hours-day">
                  <div className="yd-settings-v2__hours-day-head">
                    <span className="yd-settings-v2__hours-day-label">{dayLabel}</span>
                    <label className="yd-settings-v2__hours-closed">
                      <input
                        type="checkbox"
                        checked={schedule.closed}
                        onChange={(e) =>
                          updateDay(day, {
                            closed: e.target.checked,
                            slots: e.target.checked ? [] : schedule.slots.length ? schedule.slots : [emptySlot()],
                          })
                        }
                      />
                      <span>{isMobile ? "Zu" : "Geschlossen"}</span>
                    </label>
                  </div>

                  {!schedule.closed ? (
                    <div className="yd-settings-v2__hours-slots">
                      {schedule.slots.map((slot, index) => (
                        <div key={`${day}-${index}`} className="yd-settings-v2__hours-slot-row">
                          <Clock className="yd-settings-v2__hours-slot-icon" strokeWidth={1.75} aria-hidden />
                          <input
                            type="time"
                            className="yd-settings-v2__hours-time"
                            value={slot.start}
                            onChange={(e) => updateDaySlot(day, index, { start: e.target.value })}
                            aria-label={`${WEEKDAY_LABELS[day]} Start ${index + 1}`}
                          />
                          <span className="yd-settings-v2__hours-slot-sep">bis</span>
                          <input
                            type="time"
                            className="yd-settings-v2__hours-time"
                            value={slot.end}
                            onChange={(e) => updateDaySlot(day, index, { end: e.target.value })}
                            aria-label={`${WEEKDAY_LABELS[day]} Ende ${index + 1}`}
                          />
                          {schedule.slots.length > 1 ? (
                            <button
                              type="button"
                              className="yd-settings-v2__hours-slot-remove"
                              onClick={() => removeDaySlot(day, index)}
                              aria-label="Zeitfenster entfernen"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>
                          ) : null}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="yd-settings-v2__hours-add-slot"
                        onClick={() => addDaySlot(day)}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        {isMobile ? "Zeitfenster" : "Zeitfenster hinzufügen"}
                      </button>
                    </div>
                  ) : (
                    <p className="yd-settings-v2__hours-closed-note">
                      {!isMobile ? (
                        <>
                          <CalendarOff className="inline h-3.5 w-3.5 opacity-70" aria-hidden /> Geschlossen
                        </>
                      ) : (
                        "Geschlossen"
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="yd-settings-v2__hours-block">
          <div className="yd-settings-v2__hours-block-head">
            <h3 className="yd-settings-v2__hours-block-title">Sonderzeiten</h3>
            <p className="yd-settings-v2__hours-block-copy">
              Feiertage, Urlaub und abweichende Öffnungszeiten.
            </p>
          </div>

          {config.specialPeriods.length === 0 ? (
            <p className="yd-settings-v2__empty-inline">Noch keine Sonderzeiten hinterlegt.</p>
          ) : (
            <ul className="yd-settings-v2__hours-special-list">
              {config.specialPeriods.map((period) => (
                <li key={period.id} className="yd-settings-v2__hours-special">
                  <div className="yd-settings-v2__hours-special-head">
                    <span className={cn("yd-settings-v2__hours-special-kind", `yd-settings-v2__hours-special-kind--${period.kind}`)}>
                      {SPECIAL_PERIOD_KIND_LABELS[period.kind]}
                    </span>
                    <button
                      type="button"
                      className="yd-settings-v2__hours-special-remove"
                      onClick={() => removeSpecial(period.id)}
                      aria-label={`${period.label} entfernen`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="yd-settings-v2__input"
                    value={period.label}
                    onChange={(e) => updateSpecial(period.id, { label: e.target.value })}
                    placeholder="Bezeichnung"
                    aria-label="Bezeichnung"
                  />

                  <div className="yd-settings-v2__hours-special-dates">
                    <div>
                      <label className="yd-settings-v2__field-label" htmlFor={`${period.id}-start`}>
                        Von
                      </label>
                      <input
                        id={`${period.id}-start`}
                        type="date"
                        className="yd-settings-v2__input"
                        value={period.startDate}
                        onChange={(e) => updateSpecial(period.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="yd-settings-v2__field-label" htmlFor={`${period.id}-end`}>
                        Bis
                      </label>
                      <input
                        id={`${period.id}-end`}
                        type="date"
                        className="yd-settings-v2__input"
                        value={period.endDate}
                        onChange={(e) => updateSpecial(period.id, { endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <label className="yd-settings-v2__hours-closed yd-settings-v2__hours-closed--inline">
                    <input
                      type="checkbox"
                      checked={period.closed}
                      onChange={(e) =>
                        updateSpecial(period.id, {
                          closed: e.target.checked,
                          slots: e.target.checked ? [] : period.slots.length ? period.slots : [emptySlot()],
                        })
                      }
                    />
                    <span>Ganze Zeit geschlossen</span>
                  </label>

                  {!period.closed ? (
                    <div className="yd-settings-v2__hours-slots">
                      {period.slots.map((slot, index) => (
                        <div key={`${period.id}-${index}`} className="yd-settings-v2__hours-slot-row">
                          <input
                            type="time"
                            className="yd-settings-v2__hours-time"
                            value={slot.start}
                            onChange={(e) => {
                              const slots = period.slots.map((s, i) =>
                                i === index ? { ...s, start: e.target.value } : s
                              );
                              updateSpecial(period.id, { slots });
                            }}
                            aria-label="Start"
                          />
                          <span className="yd-settings-v2__hours-slot-sep">bis</span>
                          <input
                            type="time"
                            className="yd-settings-v2__hours-time"
                            value={slot.end}
                            onChange={(e) => {
                              const slots = period.slots.map((s, i) =>
                                i === index ? { ...s, end: e.target.value } : s
                              );
                              updateSpecial(period.id, { slots });
                            }}
                            aria-label="Ende"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <div className="yd-settings-v2__hours-special-actions">
            <button
              type="button"
              className="yd-settings-v2__ghost-link"
              onClick={() => addSpecialPeriod("holiday")}
            >
              + Feiertag
            </button>
            <button
              type="button"
              className="yd-settings-v2__ghost-link"
              onClick={() => addSpecialPeriod("vacation")}
            >
              + Urlaub
            </button>
            <button
              type="button"
              className="yd-settings-v2__ghost-link"
              onClick={() => addSpecialPeriod("special")}
            >
              + Sonderöffnungszeit
            </button>
          </div>
        </section>
      </fieldset>
    </div>
  );
}
