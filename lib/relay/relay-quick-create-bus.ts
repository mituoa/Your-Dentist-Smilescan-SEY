import type { RelayV3Section } from "@/lib/relay/build-relay-v3-snapshot";

export type RelayQuickCreateAnchor = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
};

export type RelayQuickCreateMode = "task" | "message";

export type RelayQuickCreateBusState = {
  open: boolean;
  anchor: RelayQuickCreateAnchor | null;
  section: RelayV3Section;
  preferredMode: RelayQuickCreateMode;
};

let state: RelayQuickCreateBusState = {
  open: false,
  anchor: null,
  section: "operations",
  preferredMode: "task",
};

let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

export function subscribeRelayQuickCreate(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRelayQuickCreateVersion(): number {
  return version;
}

export function getRelayQuickCreateState(): RelayQuickCreateBusState {
  return state;
}

export function setRelayQuickCreateSection(section: RelayV3Section): void {
  if (state.section === section) return;
  const preferredMode: RelayQuickCreateMode = section === "handoffs" ? "message" : "task";
  state = { ...state, section, preferredMode };
  emit();
}

export function openRelayQuickCreate(
  anchorEl: HTMLElement,
  options?: { section?: RelayV3Section; mode?: RelayQuickCreateMode }
): void {
  const rect = anchorEl.getBoundingClientRect();
  const section = options?.section ?? state.section;
  const preferredMode =
    options?.mode ?? (section === "handoffs" ? "message" : "task");

  state = {
    open: true,
    anchor: {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
    },
    section,
    preferredMode,
  };
  emit();
}

export function closeRelayQuickCreate(): void {
  if (!state.open) return;
  state = { ...state, open: false, anchor: null };
  emit();
}
