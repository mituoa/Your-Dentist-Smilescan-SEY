import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthIntro, YdAuthLegalFooter, YdAuthLoadingState } from "@/components/auth/yd-auth-ui";

export default function ResetPasswordLoading() {
  return (
    <YdAuthEnvironment>
      <YdAuthIntro title="Neues Passwort festlegen" subtitle="Einen Moment bitte." fieldIndex={0} />
      <YdAuthLoadingState label="Seite wird vorbereitet …" />
      <YdAuthLegalFooter className="mt-8" />
    </YdAuthEnvironment>
  );
}
