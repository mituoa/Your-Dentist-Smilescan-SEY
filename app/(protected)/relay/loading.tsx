export default function RelayLoading() {
  return (
    <div className="relay-center relay-center--loading" aria-busy="true" aria-label="Relay wird geladen">
      <div className="relay-center__layout">
        <div className="relay-center__areas relay-center__skel" style={{ minHeight: "8rem" }} />
        <div className="relay-center__main">
          <div className="relay-center__panel">
            <div className="relay-center__panel-head">
              <div className="relay-center__skel" style={{ width: "8rem", height: "1.25rem" }} />
              <div className="relay-center__skel" style={{ width: "10rem", height: "1.75rem" }} />
            </div>
            <div className="relay-kanban">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relay-kanban__col">
                  <div className="relay-center__skel" style={{ height: "1rem", margin: "0.75rem" }} />
                  <div className="relay-center__skel" style={{ height: "5rem", margin: "0.5rem" }} />
                  <div className="relay-center__skel" style={{ height: "5rem", margin: "0.5rem" }} />
                </div>
              ))}
            </div>
          </div>
          <div className="relay-center__panel">
            <div className="relay-center__panel-head">
              <div className="relay-center__skel" style={{ width: "12rem", height: "1.25rem" }} />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relay-center__skel"
                style={{ height: "3.25rem", margin: "0 1.125rem 0.5rem" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
