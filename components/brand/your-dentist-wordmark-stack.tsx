import { cn } from "@/lib/utils";

type YourDentistWordmarkStackProps = {
  className?: string;
  /** Kompakter Rail-Modus (Sidebar). */
  compact?: boolean;
};

/**
 * Vertikales Wordmark unter dem Mark — gleiche Typo wie YourDentistBrandLockup (workspace sans).
 */
export function YourDentistWordmarkStack({
  className,
  compact = false,
}: YourDentistWordmarkStackProps) {
  return (
    <div
      className={cn("flex flex-col items-center text-center leading-none", className)}
      data-brand="your-dentist-wordmark"
    >
      <span
        className={cn(
          "yd-font-brand font-medium tracking-tight text-[#0C1929]",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        <span className="block font-light italic">Your</span>
        <span className="block font-medium not-italic">Dentist</span>
      </span>
    </div>
  );
}
