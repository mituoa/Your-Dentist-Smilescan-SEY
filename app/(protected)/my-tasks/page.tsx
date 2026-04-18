import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function MyTasksPage() {
  const workspace = await getCurrentWorkspace();

  // Arzt hat kein "My Tasks" - er sieht Tasks die er verteilt hat im Dashboard
  if (workspace?.role === "doctor") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Meine Aufgaben · Phase 11
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Meine Aufgaben
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier sieht ein Team-Mitglied alle Aufgaben, die an "alle" oder
        speziell an diese Person verteilt wurden.
      </p>
    </div>
  );
}
