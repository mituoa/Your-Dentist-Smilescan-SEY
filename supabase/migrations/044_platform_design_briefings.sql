-- ============================================================================
-- 044_platform_design_briefings.sql
-- Internes Design-Briefing (UI/UX, Website, visuelle Markenführung)
-- Plattformweit — nicht workspace-gebunden; bearbeitbar für künftige Pflege.
-- ============================================================================

CREATE TYPE platform_design_briefing_status AS ENUM ('draft', 'active', 'archived');

CREATE TYPE platform_design_briefing_impl_status AS ENUM (
  'pending',
  'in_progress',
  'review',
  'done'
);

CREATE TABLE platform_design_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status platform_design_briefing_status NOT NULL DEFAULT 'active',
  scope_label text,
  target_audience text,
  preamble_markdown text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE platform_design_briefing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid NOT NULL REFERENCES platform_design_briefings(id) ON DELETE CASCADE,
  section_number integer NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  content_markdown text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (briefing_id, section_number),
  UNIQUE (briefing_id, slug)
);

CREATE INDEX idx_platform_design_briefing_sections_briefing
  ON platform_design_briefing_sections(briefing_id, sort_order);

CREATE TABLE platform_design_briefing_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id uuid NOT NULL REFERENCES platform_design_briefings(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL,
  implementation_status platform_design_briefing_impl_status NOT NULL DEFAULT 'pending',
  implementation_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (briefing_id, slug)
);

CREATE INDEX idx_platform_design_briefing_areas_briefing
  ON platform_design_briefing_areas(briefing_id, sort_order);

CREATE TABLE platform_design_briefing_area_sections (
  area_id uuid NOT NULL REFERENCES platform_design_briefing_areas(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES platform_design_briefing_sections(id) ON DELETE CASCADE,
  PRIMARY KEY (area_id, section_id)
);

CREATE INDEX idx_platform_design_briefing_area_sections_section
  ON platform_design_briefing_area_sections(section_id);

-- updated_at Trigger
CREATE OR REPLACE FUNCTION set_platform_design_briefing_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER platform_design_briefings_updated_at
  BEFORE UPDATE ON platform_design_briefings
  FOR EACH ROW EXECUTE FUNCTION set_platform_design_briefing_updated_at();

CREATE TRIGGER platform_design_briefing_sections_updated_at
  BEFORE UPDATE ON platform_design_briefing_sections
  FOR EACH ROW EXECUTE FUNCTION set_platform_design_briefing_updated_at();

CREATE TRIGGER platform_design_briefing_areas_updated_at
  BEFORE UPDATE ON platform_design_briefing_areas
  FOR EACH ROW EXECUTE FUNCTION set_platform_design_briefing_updated_at();

-- RLS: Lesen für eingeloggte Nutzer:innen; Schreiben nur serverseitig (Service Role)
ALTER TABLE platform_design_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_design_briefing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_design_briefing_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_design_briefing_area_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read platform design briefings"
  ON platform_design_briefings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated read platform design briefing sections"
  ON platform_design_briefing_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated read platform design briefing areas"
  ON platform_design_briefing_areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated read platform design briefing area sections"
  ON platform_design_briefing_area_sections FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE platform_design_briefings IS
  'Internes Design-Briefing — verbindliche UI/UX- und Markenvorgaben (plattformweit).';

COMMENT ON TABLE platform_design_briefing_sections IS
  'Abschnitte 1–19 des internen Design-Briefings; einzeln bearbeitbar.';

COMMENT ON TABLE platform_design_briefing_areas IS
  'Geltungsbereiche (Software, Website, Patient, PDF, …) mit Umsetzungsstatus.';
