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
      <label className="block text-sm font-medium text-slate-900 dark:text-white">
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
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:py-1.5 ${
                selected
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
