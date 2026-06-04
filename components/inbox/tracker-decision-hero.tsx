type TrackerDecisionHeroProps = {
  headline: string;
};

/** Entscheidungs-Hero — „Was muss ich heute entscheiden?“ */
export function TrackerDecisionHero({ headline }: TrackerDecisionHeroProps) {
  return (
    <div className="yd-tq-decision-hero" role="status">
      <p className="yd-tq-decision-hero__text">{headline}</p>
    </div>
  );
}
