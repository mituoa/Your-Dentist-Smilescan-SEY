import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatBlockProps {
  label: string;
  children: React.ReactNode;
  link?: {
    href: string;
    text: string;
  };
}

export function StatBlock({ label, children, link }: StatBlockProps) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-6 flex flex-col min-h-[200px]">
      <div className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-4">
        {label}
      </div>
      <div className="flex-1">{children}</div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-glow transition-colors mt-4"
        >
          {link.text}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  );
}
