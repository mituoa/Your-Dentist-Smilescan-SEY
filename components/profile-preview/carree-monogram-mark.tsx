/** Carree-Referenz: überlappendes CD-Monogramm (Logo + Wasserzeichen). */
export function CarreeMonogramMark({
  letters,
  className,
}: {
  letters: string;
  className?: string;
}) {
  const pair = letters.slice(0, 2).toUpperCase() || "PR";
  const c = pair.charAt(0);
  const d = pair.charAt(1);

  return (
    <svg
      viewBox="0 0 120 88"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="4"
        y="72"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="76"
        fontWeight="700"
        letterSpacing="-5"
        fill="currentColor"
      >
        {c}
      </text>
      <text
        x="46"
        y="72"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="76"
        fontWeight="700"
        letterSpacing="-5"
        fill="currentColor"
      >
        {d}
      </text>
    </svg>
  );
}
