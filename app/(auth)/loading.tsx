import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

export default function AuthLoading() {
  return (
    <YdPublicOsEnvironment mode="focus">
      <YdProductChrome variant="entry" />
      <main className="yd-product-entry">
        <section className="yd-product-entry-card">
          <div className="flex flex-col items-center gap-5 py-10">
            <YourDentistBrandLockup size="md" centered markOnly priority />
            <YdAuthLoadingState />
          </div>
        </section>
      </main>
    </YdPublicOsEnvironment>
  );
}
