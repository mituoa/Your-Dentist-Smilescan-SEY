/** Foto-Workflow-Checks — Qualität für den Prozess, keine Diagnose. */

export type PhotoWorkflowCheck = {
  id: string;
  label: string;
  done: boolean;
};

export function buildPhotoWorkflowChecks(photoCount: number): PhotoWorkflowCheck[] {
  if (photoCount <= 0) {
    return [{ id: "missing", label: "Noch keine Bilder übermittelt", done: false }];
  }

  return [
    { id: "quality", label: "Bildqualität zur Einordnung ausreichend", done: photoCount >= 1 },
    { id: "visible", label: "Betroffener Bereich dokumentiert", done: photoCount >= 1 },
    {
      id: "complete",
      label: "Informationen für nächsten Schritt vorhanden",
      done: photoCount >= 2,
    },
  ];
}
