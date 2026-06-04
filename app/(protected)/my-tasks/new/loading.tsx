import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";

export default function NewPraxisTaskLoading() {
  return (
    <div className="flex min-h-[min(480px,75dvh)] flex-col items-center justify-center py-16">
      <YdAuthLoadingState label="Formular wird geladen …" />
    </div>
  );
}
