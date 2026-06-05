"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { getProfileLeistungenPickerGroups, findServiceById } from "@/lib/masterdata/services";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { ServiceItemEditor } from "./service-item-editor";
import { Input } from "@/components/ui/input";
import type { ServiceStructured } from "@/lib/types/profile-editor-data";

interface SectionServicesProps {
  services: ServiceStructured[];
  onUpdate: (services: ServiceStructured[]) => void;
}

export function SectionServices({ services, onUpdate }: SectionServicesProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(
      selectedGroups.includes(groupId)
        ? selectedGroups.filter((g) => g !== groupId)
        : [...selectedGroups, groupId]
    );
  };

  const isServiceSelected = (serviceId: string) =>
    services.some((s) => s.id === serviceId);

  const addServiceFromMaster = (serviceId: string) => {
    const found = findServiceById(serviceId);
    if (!found || isServiceSelected(serviceId)) return;
    onUpdate([
      ...services,
      { id: serviceId, name: found.service.label, note: "", custom: false },
    ]);
  };

  const addCustomService = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (trimmed.length > PROFILE_LIMITS.service_name) return;
    const newId = `custom:${Date.now()}`;
    onUpdate([...services, { id: newId, name: trimmed, note: "", custom: true }]);
    setCustomName("");
  };

  const removeService = (id: string) => {
    onUpdate(services.filter((s) => s.id !== id));
  };

  const updateServiceNote = (id: string, note: string) => {
    onUpdate(services.map((s) => (s.id === id ? { ...s, note } : s)));
  };

  const isOverLimit = services.length > PROFILE_LIMITS.MAX_VISIBLE_SERVICES;

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            IV
          </span>
          <h2 className="font-serif text-3xl font-light">Leistungen</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Patientenverständliche Dienstleistungen. Sichtbar: max{" "}
          {PROFILE_LIMITS.MAX_VISIBLE_SERVICES} auf dem Profil.
        </p>
      </div>

      {services.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Ihre Auswahl
          </div>
          <div className="border-t border-border">
            {services.map((s, i) => (
              <ServiceItemEditor
                key={s.id}
                index={i}
                id={s.id}
                name={s.name}
                note={s.note}
                custom={s.custom}
                onNoteChange={(note) => updateServiceNote(s.id, note)}
                onRemove={() => removeService(s.id)}
              />
            ))}
          </div>
          <div className="text-xs text-text-tertiary pt-2">
            Ausgewählt:{" "}
            <span className={isOverLimit ? "text-warning" : ""}>
              {services.length}
            </span>
            {isOverLimit && (
              <span className="ml-2">
                — nur die ersten {PROFILE_LIMITS.MAX_VISIBLE_SERVICES} werden
                angezeigt.
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
          Aus Kategorien wählen
        </div>
        <div className="space-y-2">
          {getProfileLeistungenPickerGroups().map((group) => {
            const isOpen = selectedGroups.includes(group.id);
            return (
              <div key={group.id} className="border border-border rounded">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-sunken/30"
                >
                  <span className="text-sm font-medium">
                    <span className="text-text-tertiary mr-2 uppercase text-xs">
                      {group.id.toUpperCase()}
                    </span>
                    {group.label}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    strokeWidth={1.75}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 py-2 border-t border-border flex flex-wrap gap-2">
                    {group.services.map((service) => {
                      const isSelected = isServiceSelected(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => !isSelected && addServiceFromMaster(service.id)}
                          disabled={isSelected}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            isSelected
                              ? "bg-surface-sunken border-border text-text-tertiary cursor-default"
                              : "bg-surface-card border-border text-text-secondary hover:border-text-primary"
                          }`}
                        >
                          {service.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
          Eigene Leistung hinzufügen
        </div>
        <div className="flex gap-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
            maxLength={PROFILE_LIMITS.service_name}
            placeholder="z.B. Prominentenbehandlung"
          />
          <button
            type="button"
            onClick={addCustomService}
            className="px-4 py-2 bg-ink text-cream text-sm rounded hover:bg-teal transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
