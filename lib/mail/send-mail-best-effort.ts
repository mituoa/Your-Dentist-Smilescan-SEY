import "server-only";

import { sendTransactionalMail } from "@/lib/mail/send-mail";
import type { SendTransactionalMailInput } from "@/lib/mail/send-mail";

export async function sendTransactionalMailBestEffort(
  input: SendTransactionalMailInput,
  logContext: string
): Promise<{ sent: boolean; reason?: string; messageId?: string }> {
  try {
    const info = await sendTransactionalMail({
      ...input,
      mailContext: input.mailContext ?? logContext,
    });
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[mail] ${logContext}: Versand fehlgeschlagen`);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}
