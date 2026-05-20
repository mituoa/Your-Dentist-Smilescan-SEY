export type YdNavAmbientLine = {
  label?: string;
  value: string;
  tone?: "default" | "urgent" | "muted";
};

export type YdNavAmbientPreview = {
  title: string;
  lines: YdNavAmbientLine[];
};

export type YdNavAmbientMap = Partial<
  Record<"dashboard" | "inbox" | "relay" | "profile" | "journal" | "settings", YdNavAmbientPreview>
>;
