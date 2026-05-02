"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";

interface InboxSearchFigmaProps {
  /** z. B. `/inbox-preview` für Demo ohne echte Inbox-Route */
  routeBase?: string;
}

export function InboxSearchFigma({ routeBase = "/inbox" }: InboxSearchFigmaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const qFromUrl = searchParams.get("q") || "";
  const [value, setValue] = useState(qFromUrl);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL -> local input
    setValue(qFromUrl);
  }, [qFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set("q", next);
      else params.delete("q");
      router.replace(`${routeBase}?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-[16px] w-[16px]"
        style={{ color: "#94A3B8" }}
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Suchen..."
        className="w-full bg-white text-[14px] focus:outline-none placeholder:text-gray-400"
        style={{
          height: "40px",
          paddingLeft: "36px",
          paddingRight: "12px",
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          color: "#1E293B",
          transition: "all 200ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#2F80ED";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(47,128,237,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#E2E8F0";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

