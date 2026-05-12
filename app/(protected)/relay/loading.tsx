import { ClinicalRelayBoardSkeleton } from "@/components/workspace/clinical-route-skeleton";

/** Ladezustand für `/relay` — gleiche visuelle Sprache wie das Board, ohne Funktions-Vortäuschung. */
export default function RelayLoading() {
  return <ClinicalRelayBoardSkeleton />;
}
