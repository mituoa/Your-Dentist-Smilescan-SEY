import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

export default function RegisterLoading() {
  return (
    <YdPublicOsEnvironment mode="register" scroll landingAtmosphere instantEnter>
      <YdProductChrome variant="entry" />
      <main className="yd-product-entry yd-clinical-entry">
        <section className="yd-product-entry-card yd-clinical-entry-panel yd-auth-register-page-card">
          <div className="flex flex-col items-center gap-5 py-10">
            <YourDentistBrandLockup size="md" centered markOnly priority />
            <YdAuthLoadingState label="Registrierung wird geladen …" />
          </div>
        </section>
      </main>
    </YdPublicOsEnvironment>
  );
}
