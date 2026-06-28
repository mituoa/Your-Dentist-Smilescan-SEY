export default function RelayLoading() {
  return (
    <div className="relay-center relay-center--premium relay-center--v2 relay-center--loading" aria-busy="true" aria-label="Relay wird geladen">
      <div className="relay-center__layout">
        <div className="relay-center__skel" style={{ minHeight: "16rem", borderRadius: "16px" }} />
        <div className="relay-center__main">
          <div className="relay-center__skel" style={{ height: "3rem", marginBottom: "12px" }} />
          <div className="relay-center__skel" style={{ height: "6rem", marginBottom: "12px" }} />
          <div className="relay-center__skel" style={{ height: "6rem" }} />
        </div>
      </div>
    </div>
  );
}
