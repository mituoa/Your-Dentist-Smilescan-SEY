import { Check } from "lucide-react";

interface ProfileServicesProps {
  services: string[];
}

export function ProfileServices({ services }: ProfileServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Dienstleistungen
        </h2>
        <ul className="space-y-3">
          {services.map((service, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check
                className="w-4 h-4 text-brand shrink-0 mt-1"
                strokeWidth={2}
              />
              <span className="text-text-primary">{service}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
