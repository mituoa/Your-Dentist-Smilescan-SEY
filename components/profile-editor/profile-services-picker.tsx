"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, X } from "lucide-react";

import {
  findServiceById,
  getProfileLeistungenPickerGroups,
  PROFILE_LEISTUNGEN_PICKER_GROUP_IDS,
} from "@/lib/masterdata/services";
import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import { cn } from "@/lib/utils";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import type { ServiceStructured } from "@/lib/types/profile-editor-data";

type ProfileServicesPickerProps = {
  services: ServiceStructured[];
  onChange: (services: ServiceStructured[]) => void;
  disabled?: boolean;
  embedded?: boolean;
};

export function ProfileServicesPicker({
  services,
  onChange,
  disabled = false,
  embedded = false,
}: ProfileServicesPickerProps) {
  const serviceGroups = useMemo(() => getProfileLeistungenPickerGroups(), []);
  const primaryGroupIds = useMemo(
    () => new Set<string>(PROFILE_LEISTUNGEN_PICKER_GROUP_IDS),
    []
  );

  const groupsWithSelection = useMemo(
    () =>
      serviceGroups
        .filter((group) =>
          group.services.some((service) => services.some((s) => s.id === service.id))
        )
        .map((group) => group.id),
    [serviceGroups, services]
  );

  const [openGroups, setOpenGroups] = useState<string[]>(groupsWithSelection);
  const [customName, setCustomName] = useState("");

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const isSelected = (serviceId: string) => services.some((s) => s.id === serviceId);

  const toggleMaster = (serviceId: string) => {
    if (disabled) return;
    if (isSelected(serviceId)) {
      onChange(services.filter((s) => s.id !== serviceId));
      return;
    }
    const found = findServiceById(serviceId);
    if (!found) return;
    onChange([
      ...services,
      { id: serviceId, name: found.service.label, note: "", custom: false },
    ]);
  };

  const remove = (id: string) => {
    if (disabled) return;
    onChange(services.filter((s) => s.id !== id));
  };

  const addCustom = () => {
    if (disabled) return;
    const trimmed = customName.trim();
    if (!trimmed || trimmed.length > PROFILE_LIMITS.service_name) return;
    onChange([
      ...services,
      { id: `custom:${Date.now()}`, name: trimmed, note: "", custom: true },
    ]);
    setCustomName("");
  };

  const overLimit = services.length > PROFILE_LIMITS.MAX_VISIBLE_SERVICES;

  return (
    <div>
      {!embedded ? (
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Leistungen
          </p>
          <span
            className={`text-[10px] font-medium tabular-nums ${overLimit ? "text-amber-700" : "text-slate-400"}`}
          >
            {services.length}
            {overLimit ? ` · max. ${PROFILE_LIMITS.MAX_VISIBLE_SERVICES} sichtbar` : ""}
          </span>
        </div>
      ) : (
        <p
          className={`mb-3 text-right text-[10px] font-medium tabular-nums ${overLimit ? "text-amber-700" : "text-slate-400"}`}
        >
          {services.length}
          {overLimit ? ` · max. ${PROFILE_LIMITS.MAX_VISIBLE_SERVICES} sichtbar` : ""}
        </p>
      )}

      {services.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Ausgewählte Leistungen
          </p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => remove(s.id)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700/15 bg-slate-900/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-800 transition-colors hover:border-slate-700/25 hover:bg-slate-900/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${s.name} entfernen`}
              >
                <Check className="h-3 w-3 shrink-0 text-slate-600" strokeWidth={2.25} aria-hidden />
                <span className="truncate">{s.name}</span>
                <X className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Aus Kategorien wählen
      </p>
      <div className="rounded-lg border border-slate-300/25 bg-white/35 px-2">
        {serviceGroups.map((group) => {
          const isOpen = openGroups.includes(group.id);
          const count = group.services.filter((s) => isSelected(s.id)).length;
          const isPrimary = primaryGroupIds.has(group.id);
          return (
            <div key={group.id} className="border-b border-slate-300/20 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-[12px] font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                <span>
                  {isPrimary ? (
                    <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {group.id.toUpperCase()}
                    </span>
                  ) : null}
                  {group.label}
                  {count > 0 ? (
                    <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                      {count}
                    </span>
                  ) : null}
                </span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <ul className="divide-y divide-slate-300/15 border-t border-slate-300/15 pl-1">
                  {group.services.map((service) => {
                    const picked = isSelected(service.id);
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleMaster(service.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-lg py-2.5 pl-1 pr-2 text-left text-[13px] leading-snug transition-colors touch-manipulation",
                            picked
                              ? "bg-slate-900/[0.04] font-medium text-slate-950"
                              : "font-normal text-slate-600 hover:bg-white/40",
                            disabled && "cursor-not-allowed opacity-50"
                          )}
                          aria-pressed={picked}
                        >
                          <span className="min-w-0">{service.label}</span>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                              picked
                                ? "border-slate-700 bg-slate-800 text-white"
                                : "border-slate-300/70 bg-white/60 text-transparent"
                            )}
                            aria-hidden
                          >
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Eigene Leistung
        </p>
        <div className="flex gap-2">
          <FigmaTextInput
            variant="quiet"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={PROFILE_LIMITS.service_name}
            placeholder="z. B. Professionelle Zahnreinigung"
            disabled={disabled}
            className="flex-1"
          />
          <button
            type="button"
            disabled={disabled || !customName.trim()}
            onClick={addCustom}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-slate-300/40 bg-white/70 px-3 text-slate-600 transition-colors hover:border-slate-400/60 disabled:opacity-40"
            aria-label="Eigene Leistung hinzufügen"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
