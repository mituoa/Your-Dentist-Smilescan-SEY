-- ============================================================================
-- 011_backfill_slugs.sql
-- Vorhandene Workspaces bekommen ihre Slugs aus profile_data.display_name neu
-- Sonst wäre dein Workspace-Slug noch "baysal-b" (aus Email generiert in Phase 2)
-- ============================================================================

DO $$
DECLARE
  ws RECORD;
  new_slug text;
  suffix int := 0;
  candidate text;
BEGIN
  FOR ws IN
    SELECT w.id, w.slug, pd.display_name
    FROM workspaces w
    LEFT JOIN profile_data pd ON pd.workspace_id = w.id
  LOOP
    IF ws.display_name IS NOT NULL AND trim(ws.display_name) != '' THEN
      new_slug := lower(trim(ws.display_name));
      new_slug := replace(new_slug, 'ä', 'ae');
      new_slug := replace(new_slug, 'ö', 'oe');
      new_slug := replace(new_slug, 'ü', 'ue');
      new_slug := replace(new_slug, 'ß', 'ss');
      new_slug := regexp_replace(new_slug, '[^a-z0-9\s-]', '', 'g');
      new_slug := regexp_replace(new_slug, '\s+', '-', 'g');
      new_slug := regexp_replace(new_slug, '-+', '-', 'g');
      new_slug := regexp_replace(new_slug, '^-+|-+$', '', 'g');

      candidate := new_slug;
      suffix := 0;
      WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = candidate AND id != ws.id) LOOP
        suffix := suffix + 1;
        candidate := new_slug || '-' || suffix;
      END LOOP;

      UPDATE workspaces SET slug = candidate WHERE id = ws.id;
    END IF;
  END LOOP;
END $$;
