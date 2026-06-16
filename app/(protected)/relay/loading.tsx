export default function RelayLoading() {
  return (
    <div className="relay-ws relay-ws--loading" aria-busy="true" aria-label="Relay wird geladen">
      <div className="relay-ws__grid">
        <aside className="relay-ws__nav p-2">
          <div className="relay-ws__skel h-8 w-16" />
          <div className="relay-ws__skel mt-2 h-6 w-full" />
          <div className="relay-ws__skel mt-1 h-6 w-full" />
        </aside>
        <section className="relay-ws__inv p-2">
          <div className="relay-ws__skel h-6 w-full" />
          <div className="relay-ws__skel mt-1 h-9 w-full" />
          <div className="relay-ws__skel mt-1 h-9 w-full" />
          <div className="relay-ws__skel mt-1 h-9 w-full" />
        </section>
        <section className="relay-ws__ctx p-3">
          <div className="relay-ws__skel h-5 w-2/3" />
          <div className="relay-ws__skel mt-3 h-16 w-full" />
        </section>
      </div>
    </div>
  );
}
