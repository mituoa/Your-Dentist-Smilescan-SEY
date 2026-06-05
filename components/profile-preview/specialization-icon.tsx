import {
  Activity,
  Baby,
  Crown,
  HeartPulse,
  Layers,
  Microscope,
  Scan,
  Scissors,
  Shield,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { specializationPickerLabel } from "@/lib/profile/specialization-picker-data";

function resolveIcon(id: string, label: string): LucideIcon {
  const key = `${id} ${label}`.toLowerCase();
  if (key.includes("ästhet") || key.includes("veneer") || key.includes("bleach")) return Sparkles;
  if (key.includes("implant")) return Layers;
  if (key.includes("paro") || key.includes("zahnfleisch")) return HeartPulse;
  if (key.includes("endo") || key.includes("wurzel")) return Activity;
  if (key.includes("kfo") || key.includes("kieferorth") || key.includes("aligner")) return Scan;
  if (key.includes("chirurg") || key.includes("oral")) return Scissors;
  if (key.includes("prothet") || key.includes("kronen")) return Crown;
  if (key.includes("kinder") || key.includes("pediatr")) return Baby;
  if (key.includes("prophyl") || key.includes("vorsorge")) return Shield;
  if (key.includes("laser")) return Zap;
  if (key.includes("schmerz")) return Stethoscope;
  if (key.includes("radiolog") || key.includes("diagnost")) return Microscope;
  if (key.includes("anästhes") || key.includes("sedier")) return Syringe;
  return Smile;
}

type SpecializationIconProps = {
  id: string;
  className?: string;
};

export function SpecializationIcon({ id, className }: SpecializationIconProps) {
  const label = specializationPickerLabel(id);
  const Icon = resolveIcon(id, label);
  return <Icon className={className} strokeWidth={1.35} aria-hidden />;
}
