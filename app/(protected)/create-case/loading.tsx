/**
 * **Punkt 2 (Status — final):** Segment-`loading` — **statisch**, kein Puls/Shimmer; s. `create-case/page.tsx`.
 *
 * **Punkt 5 (Tot/Fake — final):** Kein generisches „Formular“-Intake-Wording.
 *
 * **Punkt 6 (Loading — final):** Nur während die **Server-Page** (Workspace/Rolle) läuft — **nicht** dasselbe wie
 * `CreateCaseClient` **busy** (Speichern/Upload: `fieldset` + Button-Texte). Fläche an **Breite/Polster** der Maske
 * angeglichen; Mobile **unten** wie das Sheet — milder Übergang, kein dichtes Skelett-„Realtime“-Theater.
 *
 * **Punkt 9 (Mobile — final):** Mobile **max-height** wie `CreateCaseClient` (**SVH + Safe Area**), kein Layout-Sprung
 * beim Übergang Loading → Maske.
 *
 * **Punkt 11 (MVP — final):** Kurzer, sachlicher Ladehinweis — **kein** Marketing-/Plattform-„Onboarding“-Ton.
 *
 * **Punkt 12 (Nice / Future / Non-MVP — final):** Statisches Segment — **kein** Platzhalter für künftiges Realtime/
 * Autosave oder „lebendiges“ Intake — vollständig `create-case/page.tsx` **Punkt 12**.
 *
 * **Punkt 13 (Priorität — final):** P1-Segment — bei Layout-Änderungen **Punkt 13** und Übergang zur Maske prüfen;
 * kein visuelles „Feature-Loading“ — s. `page.tsx` Punkt 13.
 */

export default function CreateCaseLoading() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col justify-end md:justify-start md:mx-auto md:w-full md:max-w-[760px] md:px-5 md:py-10 lg:px-8 lg:py-12 max-md:px-[max(0.75rem,var(--safe-area-left))] max-md:pr-[max(0.75rem,var(--safe-area-right))] max-md:pb-[max(0.5rem,var(--safe-area-bottom))] max-md:pt-[max(0.5rem,var(--safe-area-top))]"
      style={{ background: "transparent" }}
    >
      <div
        className="flex min-h-[min(52dvh,22rem)] w-full flex-col rounded-[24px] border border-slate-200/55 bg-white px-5 py-8 shadow-[0_20px_56px_-16px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.035)] max-md:max-h-[min(calc(100svh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom)_-_1.25rem),50rem)] md:min-h-[min(42dvh,20rem)] md:rounded-[26px] md:border-slate-200/45 md:bg-gradient-to-b md:from-white md:to-[#FAFBFC]/50 md:px-8 md:py-10 md:shadow-[0_8px_36px_-14px_rgba(15,23,42,0.07),0_0_0_1px_rgba(15,23,42,0.028)]"
        aria-busy="true"
        aria-labelledby="create-case-loading-label"
      >
        <div
          className="mx-auto flex w-full max-w-[28rem] flex-col gap-3 md:max-w-none"
          aria-hidden
        >
          <div className="h-2 w-[36%] max-w-[9.5rem] rounded-full bg-slate-200/85 dark:bg-slate-600/30" />
          <div className="h-2.5 w-[58%] rounded-md bg-slate-100 dark:bg-slate-700/20" />
          <div className="h-2.5 w-full rounded-md bg-slate-100 dark:bg-slate-700/20" />
          <div className="h-2.5 w-[76%] rounded-md bg-slate-100 dark:bg-slate-700/20" />
        </div>
        <p
          id="create-case-loading-label"
          role="status"
          aria-live="polite"
          className="mx-auto mt-8 max-w-[28rem] text-center text-sm font-normal leading-relaxed text-slate-500 md:max-w-none"
        >
          Falldaten werden geladen …
        </p>
      </div>
    </div>
  );
}
