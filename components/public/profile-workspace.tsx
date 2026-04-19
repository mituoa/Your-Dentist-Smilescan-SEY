interface ProfileWorkspaceProps {
  practiceName: string | null;
  practiceAddress: string | null;
  practiceEmploymentStatus: string | null;
  practicePhone: string | null;
  practiceEmail: string | null;
  practiceWebsite: string | null;
}

export function ProfileWorkspace(props: ProfileWorkspaceProps) {
  const hasAny =
    props.practiceName ||
    props.practiceAddress ||
    props.practicePhone ||
    props.practiceEmail ||
    props.practiceWebsite;

  if (!hasAny) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Praxis
        </h2>
        <div className="space-y-3 text-text-primary">
          {props.practiceName && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Name
              </div>
              <div>{props.practiceName}</div>
            </div>
          )}
          {props.practiceAddress && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Adresse
              </div>
              <div className="whitespace-pre-line">{props.practiceAddress}</div>
            </div>
          )}
          {props.practicePhone && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Telefon
              </div>
              <a
                href={`tel:${props.practicePhone}`}
                className="hover:text-brand transition-colors"
              >
                {props.practicePhone}
              </a>
            </div>
          )}
          {props.practiceEmail && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                E-Mail
              </div>
              <a
                href={`mailto:${props.practiceEmail}`}
                className="hover:text-brand transition-colors"
              >
                {props.practiceEmail}
              </a>
            </div>
          )}
          {props.practiceWebsite && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Website
              </div>
              <a
                href={props.practiceWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {props.practiceWebsite}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
