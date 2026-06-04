import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLikelyMissingDbRelationError } from "@/lib/supabase/postgrest-errors";
import type { OutboundMessageRow } from "@/lib/outbound-messages/types";

const SELECT = `
  id,
  workspace_id,
  submission_id,
  patient_email,
  subject,
  body,
  message_kind,
  status,
  sent_at,
  sent_by,
  error_message,
  provider_message_id,
  created_at,
  updated_at
`;

export const getOutboundMessagesForSubmission = cache(
  async (
    submissionId: string,
    workspaceId: string
  ): Promise<OutboundMessageRow[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("outbound_messages")
      .select(SELECT)
      .eq("submission_id", submissionId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      if (isLikelyMissingDbRelationError(error)) {
        return [];
      }
      console.error(
        "[outbound-messages] list",
        (error as { code?: string })?.code ?? "unknown"
      );
      return [];
    }

    return (data ?? []) as OutboundMessageRow[];
  }
);
