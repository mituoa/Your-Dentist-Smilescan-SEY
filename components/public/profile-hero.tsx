import { User } from "lucide-react";

interface ProfileHeroProps {
  displayName: string | null;
  title: string | null;
  photoUrl: string | null;
  practiceName: string | null;
}

export function ProfileHero({
  displayName,
  title,
  photoUrl,
  practiceName,
}: ProfileHeroProps) {
  return (
    <section className="pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName || "Arzt"}
              className="w-32 h-32 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-surface-card border border-border flex items-center justify-center">
              <User
                className="w-12 h-12 text-text-tertiary"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-text-primary mb-3">
          {displayName || "Zahnarztpraxis"}
        </h1>
        {title && (
          <p className="text-lg text-text-secondary mb-2">{title}</p>
        )}
        {practiceName && (
          <p className="text-sm text-text-tertiary">{practiceName}</p>
        )}
      </div>
    </section>
  );
}
