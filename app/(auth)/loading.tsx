import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";

/** Route-Wechsel im Auth-Bereich — gleiche OS-Atmosphäre, ambientes Laden. */
export default function AuthLoading() {
  return (
    <YdAuthEnvironment showBrand={false}>
      <div className="flex flex-col items-center gap-5 py-10">
        <YourDentistBrandLockup size="md" centered markOnly priority />
        <YdAuthLoadingState label="Bereich wird vorbereitet …" />
      </div>
    </YdAuthEnvironment>
  );
}
