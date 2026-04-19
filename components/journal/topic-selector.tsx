"use client";

import { JOURNAL_TOPICS } from "@/lib/masterdata/journal-topics";

interface TopicSelectorProps {
  value: string | null;
  onChange: (id: string | null) => void;
  required?: boolean;
}

export function TopicSelector({ value, onChange, required }: TopicSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50">
        Thema {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {JOURNAL_TOPICS.map((topic) => {
          const selected = value === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onChange(selected ? null : topic.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                selected
                  ? "bg-white text-black border-white"
                  : "bg-transparent border-white/20 text-white/70 hover:border-white/50 hover:text-white"
              }`}
            >
              {topic.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
