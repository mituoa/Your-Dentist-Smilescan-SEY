interface SectionHeaderProps {
  number: string;
  title: string;
  description?: string;
}

export function SectionHeader({
  number,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
          {number}
        </span>
        <h2 className="font-sans text-2xl font-semibold tracking-[-0.025em]">{title}</h2>
      </div>
      {description && (
        <p className="text-sm text-text-secondary">{description}</p>
      )}
    </div>
  );
}
