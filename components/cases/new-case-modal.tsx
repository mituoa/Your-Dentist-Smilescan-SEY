"use client";

import { CreateCaseClient } from "@/components/cases/create-case-client";

type Props = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
};

export function NewCaseModal({ open, onClose, workspaceId }: Props) {
  if (!open) return null;

  return <CreateCaseClient workspaceId={workspaceId} onClose={onClose} overlay="workspace" />;
}
