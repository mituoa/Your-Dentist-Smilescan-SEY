import { Suspense } from "react";

import { InboxPreviewView } from "./inbox-preview-view";

function InboxPreviewFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center text-[14px]" style={{ color: "#64748B" }}>
      Vorschau wird geladen…
    </div>
  );
}

export default function InboxPreviewPage() {
  return (
    <Suspense fallback={<InboxPreviewFallback />}>
      <InboxPreviewView />
    </Suspense>
  );
}
