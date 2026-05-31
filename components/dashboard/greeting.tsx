interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  const now = new Date();
  const hour = now.getHours();

  let timeGreeting = "Guten Tag";
  if (hour < 11) timeGreeting = "Guten Morgen";
  else if (hour >= 18) timeGreeting = "Guten Abend";

  const formattedDate = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        {formattedDate}
      </p>
      <h1 className="font-sans text-[2rem] font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
        {timeGreeting}, {name}.
      </h1>
    </div>
  );
}
