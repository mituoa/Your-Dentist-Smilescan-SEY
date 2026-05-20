import { cn } from "@/lib/utils";

type YourDentistWordmarkStackProps = {
  className?: string;
  /** Kompakter Rail-Modus (Sidebar). */
  compact?: boolean;
};

/**
 * Vertikales Wordmark unter dem Mark — gleiche Typo wie YourDentistBrandLockup (Fraunces / font-serif).
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
          "font-serif font-medium tracking-tight text-[#1E293B]",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        <span className="block font-light italic">Your</span>
        <span className="block font-medium not-italic">Dentist</span>
      </span>
    </div>
  );
}
