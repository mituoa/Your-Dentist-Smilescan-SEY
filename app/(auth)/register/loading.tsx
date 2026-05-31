import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";

export default function RegisterLoading() {
  return (
    <YdAuthEnvironment showBrand={false}>
      <div className="flex flex-col items-center gap-5 py-10">
        <YourDentistBrandLockup size="md" centered markOnly priority />
        <YdAuthLoadingState label="Registrierung wird geladen …" />
      </div>
    </YdAuthEnvironment>
  );
}
