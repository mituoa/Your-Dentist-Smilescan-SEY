-- ============================================================================
-- 007_fix_signup_rls.sql
-- Fix: RLS blockiert den Signup-Trigger
-- Wir setzen die Helper-Funktionen auf SECURITY DEFINER und fügen
-- INSERT-Policies hinzu die den Trigger-Kontext erlauben
-- ============================================================================

-- 1) Den alten Trigger und die Funktion droppen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2) Funktion neu erstellen - SECURITY DEFINER erlaubt Inserts auch
--    wenn auth.uid() noch NULL ist (während des Signups)
--    Wir setzen explizit search_path auf public um Sicherheitslücken zu vermeiden
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
BEGIN
  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'workspace_name',
    'Meine Praxis'
  );

  base_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Falls Slug leer (seltener Edge-Case), Fallback
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
  -- Log den Fehler, aber blockiere nicht die User-Creation
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3) Trigger neu anlegen
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) INSERT-Policies für die Trigger-Operationen hinzufügen
--    SECURITY DEFINER läuft als Owner der Funktion (postgres/supabase_admin),
--    aber um sicher zu sein adden wir explizite Policies

-- workspaces: erlauben dass der Trigger (postgres role) inserts macht
CREATE POLICY "trigger can insert workspace"
  ON public.workspaces FOR INSERT
  WITH CHECK (true);

-- workspace_members: erlauben dass der Trigger inserts macht
CREATE POLICY "trigger can insert workspace member"
  ON public.workspace_members FOR INSERT
  WITH CHECK (true);

-- profile_data: erlauben dass der Trigger initiales Profile anlegt
CREATE POLICY "trigger can insert profile"
  ON public.profile_data FOR INSERT
  WITH CHECK (true);

-- 5) Helper-Funktionen robuster machen (falls User noch keinen Workspace hat)
CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_doctor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.workspace_members
    WHERE user_id = auth.uid() AND role = 'doctor'
  );
$$;
