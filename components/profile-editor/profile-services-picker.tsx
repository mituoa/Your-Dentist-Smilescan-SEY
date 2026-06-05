"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { SERVICE_MASTER, findServiceById } from "@/lib/masterdata/services";
import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import type { ServiceStructured } from "@/lib/types/profile-editor-data";

type ProfileServicesPickerProps = {
  services: ServiceStructured[];
  onChange: (services: ServiceStructured[]) => void;
  disabled?: boolean;
};

export function ProfileServicesPicker({
  services,
  onChange,
  disabled = false,
}: ProfileServicesPickerProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const isSelected = (serviceId: string) => services.some((s) => s.id === serviceId);

  const addFromMaster = (serviceId: string) => {
    if (disabled || isSelected(serviceId)) return;
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
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Leistungen
        </p>
        <span className={`text-[10px] font-medium tabular-nums ${overLimit ? "text-amber-700" : "text-slate-400"}`}>
          {services.length}
          {overLimit ? ` · max. ${PROFILE_LIMITS.MAX_VISIBLE_SERVICES} sichtbar` : ""}
        </span>
      </div>
      <p className="mb-3 text-[11px] leading-snug text-slate-500">
        Patientenverständliche Leistungen — nach Fachbereich wählen (Vorsorge, KFO, Chirurgie …).
      </p>

      {services.length > 0 ? (
        <ul className="mb-4 divide-y divide-slate-300/25 border-y border-slate-300/25">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 py-2.5">
              <span className="min-w-0 text-[13px] leading-snug text-slate-800">{s.name}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(s.id)}
                className="shrink-0 text-[11px] font-medium text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-40"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Aus Kategorien wählen
      </p>
      <div className="rounded-lg border border-slate-300/25 bg-white/35 px-2">
        {SERVICE_MASTER.map((group) => {
          const isOpen = openGroups.includes(group.id);
          const count = group.services.filter((s) => isSelected(s.id)).length;
          return (
            <div key={group.id} className="border-b border-slate-300/20 last:border-b-0">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between gap-2 py-3 text-left text-[12px] font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                <span>
                  {group.label}
                  {count > 0 ? (
                    <span className="ml-2 text-[10px] font-normal tabular-nums text-slate-400">
                      {count} gewählt
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
                          disabled={disabled || picked}
                          onClick={() => addFromMaster(service.id)}
                          className="flex w-full items-center justify-between gap-3 py-2.5 pr-1 text-left text-[13px] leading-snug transition-colors disabled:cursor-default disabled:opacity-45 hover:bg-white/40"
                        >
                          <span className={picked ? "font-medium text-slate-950" : "text-slate-600"}>
                            {service.label}
                          </span>
                          {picked ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-700/90" aria-hidden />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
                          )}
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
        <label htmlFor="pe-custom-service" className="mb-1.5 block text-[11px] font-medium text-slate-600">
          Eigene Leistung
        </label>
        <div className="flex gap-2">
          <FigmaTextInput
            id="pe-custom-service"
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
            placeholder="z. B. Prominentenbehandlung"
            disabled={disabled}
            className="flex-1"
          />
          <button
            type="button"
            disabled={disabled || !customName.trim()}
            onClick={addCustom}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300/40 bg-white/70 text-slate-600 transition-colors hover:border-slate-400/60 disabled:opacity-40"
            aria-label="Eigene Leistung hinzufügen"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
