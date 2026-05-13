-- ============================================================================
-- 033_signup_trigger_skip_pending_invite.sql
-- Google-OAuth-Nutzer mit ausstehender Team-Einladung: keinen automatischen
-- Solo-Workspace anlegen, damit der Einladungs-Beitritt nicht an der
-- Single-Workspace-Prüfung scheitert.
--
-- Ergänzt die bestehende invite_token-Prüfung in raw_user_meta_data
-- (016_fix_invite_signup.sql) um eine Abfrage gegen team_invitations.
-- E-Mail/Passwort-Registrierung setzt invite_token in Metadata und wird
-- weiterhin über den bestehenden Check abgefangen; dieser zusätzliche Pfad
-- greift primär bei OAuth-Providern (Google), die kein user_metadata setzen.
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

  IF EXISTS (
    SELECT 1 FROM public.team_invitations
    WHERE lower(email) = lower(NEW.email)
      AND status = 'pending'
      AND expires_at > now()
  ) THEN
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
