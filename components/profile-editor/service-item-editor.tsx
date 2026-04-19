"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface ServiceItemEditorProps {
  index: number;
  id: string;
  name: string;
  note: string;
  custom: boolean;
  onNoteChange: (value: string) => void;
  onRemove: () => void;
}

export function ServiceItemEditor({
  name,
  note,
  onNoteChange,
  onRemove,
}: ServiceItemEditorProps) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border">
      <div className="flex-1 font-serif text-base">{name}</div>
      <Input
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="kurze Notiz"
        maxLength={PROFILE_LIMITS.service_note}
        className="w-40 text-xs uppercase tracking-wider font-sans"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-text-tertiary hover:text-danger p-1"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
