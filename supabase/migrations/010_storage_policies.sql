-- ============================================================================
-- 010_storage_policies.sql
-- Storage-Policies für submission-photos Bucket
-- WICHTIG: Diese laufen nicht per SQL wenn der Bucket über Dashboard gemacht wurde.
-- Muss händisch im Dashboard angelegt werden (siehe Anleitung am Ende).
-- Dieses Skript ist nur Doku.
-- ============================================================================

-- Policy 1: öffentliches Hochladen (public INSERT)
-- WURDE IM DASHBOARD ANGELEGT — siehe Phase-6 Dokumentation

-- Policy 2: nur authentifizierte Members lesen Fotos ihres Workspaces
-- (storage.objects hat keine direkten workspace_id Spalte, deswegen über Foldern-Struktur)

-- Hinweis: In dieser Phase müssen die Storage-Policies manuell im Supabase-Dashboard
-- gesetzt werden (siehe STEP 11 unten).
