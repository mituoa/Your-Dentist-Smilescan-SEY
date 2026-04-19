interface ProfileVitaProps {
  vitaMarkdown: string | null;
}

export function ProfileVita({ vitaMarkdown }: ProfileVitaProps) {
  if (!vitaMarkdown?.trim()) return null;

  const paragraphs = vitaMarkdown.split(/\n\n+/).filter((p) => p.trim());

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Über mich
        </h2>
        <div className="space-y-4 text-text-secondary leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
