"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type TrackerInboxSearchProps = {
  className?: string;
};

export function TrackerInboxSearch({ className }: TrackerInboxSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const qFromUrl = searchParams.get("q") || "";
  const [value, setValue] = useState(qFromUrl);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL → Suchfeld
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
      const q = params.toString();
      router.replace(q ? `/inbox?${q}` : "/inbox", { scroll: false });
    });
  };

  return (
    <label className={cn("yd-tracker-search", className)}>
      <Search className="yd-tracker-search__icon" strokeWidth={2} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Patienten suchen…"
        className="yd-tracker-search__input"
        aria-label="Patientenfälle durchsuchen"
      />
    </label>
  );
}
