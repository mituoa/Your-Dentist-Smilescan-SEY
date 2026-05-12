import { ClinicalTaskDetailSkeleton } from "@/components/workspace/clinical-route-skeleton";

/**
 * **Punkt 6 (Loading):** Initiales Gerüst — `ClinicalTaskDetailSkeleton` (**statisch**, `inboxBarStatic`, **kein** Puls);
 * Mutationen/Pending bleiben in `TaskActions` / `CommentForm` (**Punkt 2**). Details s. `my-tasks/[id]/page.tsx`.
 * **Punkt 9:** Skeleton-Rahmen spiegelt `min-w-0`/`overflow-x-hidden` der Detailseite.
 */

export default function TaskDetailLoading() {
  return <ClinicalTaskDetailSkeleton />;
}
