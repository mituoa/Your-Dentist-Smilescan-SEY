-- ============================================================================
-- 006_signup_trigger.sql
-- Wenn ein neuer User sich registriert, automatisch:
-- 1. Neuen Workspace anlegen (Name aus User-Metadata oder "Meine Praxis")
-- 2. User als 'doctor' in den Workspace eintragen
-- 3. Leeres profile_data anlegen
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id uuid;
  workspace_name text;
  workspace_slug text;
BEGIN
  -- Workspace-Name aus Metadata oder Default
  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'workspace_name',
    'Meine Praxis'
  );

  -- Slug aus Email generieren (erstmal einfach)
  workspace_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));

  -- Uniqueness sicherstellen
  WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = workspace_slug) LOOP
    workspace_slug := workspace_slug || '-' || substring(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- Workspace anlegen
  INSERT INTO workspaces (name, slug) VALUES (workspace_name, workspace_slug)
  RETURNING id INTO new_workspace_id;

  -- User als doctor einfügen
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'doctor');

  -- Leeres Profile anlegen
  INSERT INTO profile_data (workspace_id, display_name)
  VALUES (new_workspace_id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  RETURN NEW;
END;
$$;

-- Trigger auf auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
