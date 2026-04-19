"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

export function InboxSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const qFromUrl = searchParams.get("q") || "";
  const [value, setValue] = useState(qFromUrl);

  // Sync when URL changes (z. B. Browser Zurück/Vor) — controlled field bleibt sonst hängen.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL → lokales Suchfeld
    setValue(qFromUrl);
  }, [qFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) {
        params.set("q", next);
      } else {
        params.delete("q");
      }
      router.replace(`/inbox?${params.toString()}`);
    });
  };

  return (
    <div className="relative mb-6">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Suchen…"
        className="w-full h-10 pl-10 pr-4 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
      />
    </div>
  );
}
