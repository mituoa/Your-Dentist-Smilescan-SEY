import { getSpecializationLabel } from "@/lib/masterdata/specializations";
import {
  PRIMARY_SPECIALIZATION_IDS,
  SPECIALIZATION_PICKER_GROUPS,
  MAX_SPECIALIZATION_SELECTIONS,
  specializationPickerLabel,
} from "@/lib/profile/specialization-picker-data";

/** @deprecated Use SPECIALIZATION_PICKER_GROUPS — kept for bestehende Imports. */
export interface FigmaSpecialtyOption {
  id: string;
  label: string;
}

export const FIGMA_SPECIALTY_OPTIONS: FigmaSpecialtyOption[] = SPECIALIZATION_PICKER_GROUPS.flatMap(
  (g) => g.items
);

export const FIGMA_PRIMARY_SPECIALTY_IDS = [...PRIMARY_SPECIALIZATION_IDS];

export const MAX_FIGMA_SPECIALTY_SELECTIONS = MAX_SPECIALIZATION_SELECTIONS;

export function figmaSpecialtyLabel(id: string): string {
  const fromPicker = specializationPickerLabel(id);
  if (fromPicker !== id || id.startsWith("custom:")) return fromPicker;
  return getSpecializationLabel(id);
}
