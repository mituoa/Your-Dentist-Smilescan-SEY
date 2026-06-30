"use server";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  deliverPracticeSolutionRequest,
  persistPracticeSolutionRequest,
} from "@/lib/practice-solutions/deliver-request";
import { parsePracticeSolutionRequestBody } from "@/lib/practice-solutions/request";

export async function submitPracticeSolutionRequest(body: unknown) {
  const workspace = await getCurrentWorkspace();
  if (!workspace || workspace.role !== "doctor") {
    return { ok: false as const, error: "unauthorized" };
  }

  const parsed = parsePracticeSolutionRequestBody(body);
  if (!parsed.ok) {
    return { ok: false as const, error: "invalid_payload", message: parsed.error };
  }

  const persisted = await persistPracticeSolutionRequest(workspace.workspace_id, parsed.data);
  const { delivered } = await deliverPracticeSolutionRequest(parsed.data);

  if (persisted || delivered) {
    return {
      ok: true as const,
      received: true,
      persisted,
      delivered,
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[practice-solution-request] dev accept — weder DB noch Mail verfügbar",
      { solutionId: parsed.data.solutionId, workspaceId: workspace.workspace_id }
    );
    return {
      ok: true as const,
      received: true,
      persisted: false,
      delivered: false,
    };
  }

  return { ok: false as const, error: "delivery_unavailable" };
}
