-- ============================================================================
-- 016_fix_invite_signup.sql
-- Invite-basierte Registrierung: keinen automatischen Solo-Workspace anlegen,
-- wenn user_metadata.invite_token gesetzt ist (siehe 007_fix_signup_rls.sql).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid;
  workspace_name text;
  workspace_slug text;
  base_slug text;
  invite_tok text;
BEGIN
  invite_tok := NEW.raw_user_meta_data->>'invite_token';

  IF invite_tok IS NOT NULL AND btrim(invite_tok) <> '' THEN
    RETURN NEW;
  END IF;

  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'workspace_name',
    'Meine Praxis'
  );

  base_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);

  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'praxis';
  END IF;

  workspace_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = workspace_slug) LOOP
    workspace_slug := base_slug || '-' || substring(gen_random_uuid()::text, 1, 4);
  END LOOP;

  INSERT INTO public.workspaces (name, slug)
  VALUES (workspace_name, workspace_slug)
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'doctor');

  INSERT INTO public.profile_data (workspace_id, display_name)
  VALUES (new_workspace_id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Nur Auflistung für manuelle Bereinigung (kein DELETE).
-- Optional im SQL Editor ausführen — nicht zwingend bei jedem Deploy laufen lassen.
-- Kandidaten: genau ein Mitglied, keine Submissions, display_name leer/NULL.
-- Hinweis: profile_data.display_name setzt der Trigger oft auf die E-Mail;
-- dann erscheinen solche Workspaces hier nicht.
-- ---------------------------------------------------------------------------
/*
SELECT w.id AS workspace_id,
       w.name,
       w.slug,
       wm.user_id AS sole_member_user_id,
       pd.display_name
FROM public.workspaces w
JOIN public.workspace_members wm ON wm.workspace_id = w.id
JOIN public.profile_data pd ON pd.workspace_id = w.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_members wm2
  WHERE wm2.workspace_id = w.id AND wm2.user_id <> wm.user_id
)
AND NOT EXISTS (
  SELECT 1 FROM public.submissions s WHERE s.workspace_id = w.id
)
AND (pd.display_name IS NULL OR btrim(pd.display_name) = '');
*/
