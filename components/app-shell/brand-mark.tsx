import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 px-4 h-14 border-b border-border"
    >
      <div className="w-7 h-7 rounded bg-brand flex items-center justify-center">
        <span className="text-white font-medium text-sm">S</span>
      </div>
      <span className="font-serif text-lg font-light tracking-tight text-text-primary">
        SmileScan
      </span>
    </Link>
  );
}
