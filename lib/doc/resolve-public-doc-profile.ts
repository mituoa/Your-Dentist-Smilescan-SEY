import "server-only";

import { notFound, redirect } from "next/navigation";
import {
  getPublicProfileBySlug,
  type PublicProfile,
} from "@/lib/queries/public-profile";
import { resolveSlugRedirect } from "@/lib/queries/settings";

/**
 * Load public profile by URL slug, or redirect if slug was renamed (history).
 * @param pathSuffix e.g. "", "/upload", "/upload/success", "/journal", "/journal/my-article"
 */
export async function getPublicDocProfileOrRedirect(
  slug: string,
  pathSuffix: string
): Promise<PublicProfile> {
  const profile = await getPublicProfileBySlug(slug);
  if (profile) return profile;

  const newSlug = await resolveSlugRedirect(slug);
  if (newSlug) {
    redirect(`/doc/${newSlug}${pathSuffix}`);
  }

  notFound();
}
