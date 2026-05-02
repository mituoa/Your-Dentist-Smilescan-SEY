import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ThemePreference } from "@/lib/theme";

import { SectionHeader } from "./section-header";

interface AppearanceSectionProps {
  initialTheme: ThemePreference;
}

export function AppearanceSection({ initialTheme }: AppearanceSectionProps) {
  return (
    <section className="space-y-6">
      <SectionHeader
        number="VI"
        title="Darstellung"
        description="Wechseln Sie zwischen hellem Modus (Sonne) und dunklem Modus (Mond). Die Einstellung wird in diesem Browser gespeichert."
      />
      <ThemeToggle initialTheme={initialTheme} variant="labeled" />
    </section>
  );
}
