/** Referenz: großes überlappendes Serif-Monogramm (Praxisinitialen, z. B. CD). */
export function CarreeWatermarkLetters({
  letters,
  className,
}: {
  letters: string;
  className?: string;
}) {
  const pair = letters.slice(0, 2).toUpperCase() || "PR";
  const first = pair.charAt(0);
  const second = pair.charAt(1) || "";

  return (
    <span className={className} aria-hidden>
      <span className="yd-carree-hero__watermark-glyph yd-carree-hero__watermark-glyph--first">
        {first}
      </span>
      {second ? (
        <span className="yd-carree-hero__watermark-glyph yd-carree-hero__watermark-glyph--second">
          {second}
        </span>
      ) : null}
    </span>
  );
}
