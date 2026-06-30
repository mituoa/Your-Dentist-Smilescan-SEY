import { createClient } from "@/lib/supabase/server";
import { resolveTrustReturnPath } from "@/lib/trust/return-path";

export async function loadTrustPageContext(searchParams: Promise<{ return?: string }>) {
  const { return: returnRaw } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);
  const returnTo = resolveTrustReturnPath(returnRaw, { authenticated: isAuthenticated });

  return { returnTo, isAuthenticated };
}
