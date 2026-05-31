import Image from "next/image";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  attentionSummary: string;
  photoUrl?: string | null;
};

/** Greeting + attention line; profile on the right only. */
export function DashboardHeader({
  greeting,
  displayName,
  attentionSummary,
  photoUrl,
}: DashboardHeaderProps) {
  const initials = displayName
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="yd-med-header">
      <div className="yd-med-header__text">
        <h1 className="yd-med-header__title">
          {greeting}, {displayName}
        </h1>
        <p className="yd-med-header__attention" role="status">
          {attentionSummary}
        </p>
      </div>
      <div className="yd-med-header__profile" aria-hidden={false}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            width={44}
            height={44}
            className="yd-med-header__avatar-img"
          />
        ) : (
          <span className="yd-med-header__avatar-fallback">{initials || "YD"}</span>
        )}
      </div>
    </header>
  );
}
