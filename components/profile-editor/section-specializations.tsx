"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import {
  getProfileSchwerpunktePickerOptions,
} from "@/lib/masterdata/specializations";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { Input } from "@/components/ui/input";

interface SectionSpecializationsProps {
  selected: string[];
  onUpdate: (ids: string[]) => void;
}

export function SectionSpecializations({
  selected,
  onUpdate,
}: SectionSpecializationsProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleFromMaster = (id: string) => {
    if (selected.includes(id)) {
      onUpdate(selected.filter((x) => x !== id));
    } else {
      onUpdate([...selected, id]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (trimmed.length > PROFILE_LIMITS.specialization_custom) return;
    const customId = `custom:${trimmed}`;
    if (selected.includes(customId)) return;
    onUpdate([...selected, customId]);
    setCustomInput("");
  };

  const removeCustom = (id: string) => {
    onUpdate(selected.filter((x) => x !== id));
  };

  const visibleCount = selected.length;
  const isOverLimit =
    visibleCount > PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS;

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            III
          </span>
          <h2 className="font-serif text-3xl font-light">Schwerpunkte</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Fachliche Schwerpunkte — keine geschützten Fachzahnarzt-Titel. Sichtbar:
          max {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS} auf dem Profil.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
          Aus der Liste wählen
        </div>
        <div className="flex flex-wrap gap-2">
          {getProfileSchwerpunktePickerOptions().map((spec) => {
            const isSelected = selected.includes(spec.id);
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => toggleFromMaster(spec.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  isSelected
                    ? "bg-ink text-cream border-ink"
                    : "bg-surface-card border-border text-text-secondary hover:border-text-primary"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                {spec.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
          Eigenen Schwerpunkt hinzufügen
        </div>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={PROFILE_LIMITS.specialization_custom}
            placeholder="z.B. Digitale Volumentomographie"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-4 py-2 bg-ink text-cream text-sm rounded hover:bg-teal transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {selected.filter((s) => s.startsWith("custom:")).length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
            Eigene
          </div>
          <div className="flex flex-wrap gap-2">
            {selected
              .filter((s) => s.startsWith("custom:"))
              .map((id) => (
                <div
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-ink text-cream border border-ink"
                >
                  {id.replace("custom:", "")}
                  <button
                    type="button"
                    onClick={() => removeCustom(id)}
                    className="hover:text-danger"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="text-xs text-text-tertiary pt-4 border-t border-border">
        Ausgewählt:{" "}
        <span className={isOverLimit ? "text-warning" : ""}>{visibleCount}</span>
        {isOverLimit && (
          <span className="ml-2">
            — auf dem Profil werden nur die ersten{" "}
            {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS} angezeigt.
          </span>
        )}
      </div>
    </section>
  );
}
