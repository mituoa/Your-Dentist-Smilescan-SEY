import {
  getIntakeChannelLabel,
  intakeChannelBadgeVariant,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type IntakeChannelBadgeProps = {
  channel: IntakeChannel;
  className?: string;
};

/** Dezenter Pill-Badge für Tracker-Liste; `unknown` wird nicht angezeigt. */
export function IntakeChannelBadge({ channel, className }: IntakeChannelBadgeProps) {
  if (channel === "unknown") return null;

  const variant = intakeChannelBadgeVariant(channel);

  return (
    <span
      className={cn("yd-intake-channel-badge", `yd-intake-channel-badge--${variant}`, className)}
    >
      {getIntakeChannelLabel(channel)}
    </span>
  );
}
