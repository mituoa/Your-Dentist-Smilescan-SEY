export interface ServiceStructured {
  id: string;
  name: string;
  note: string;
  custom: boolean;
}

export interface ProfileEditorData {
  workspace_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  display_name: string | null;
  founding_year: number | null;
  photo_url: string | null;
  vita_markdown: string | null;
  specializations: string[];
  services_structured: ServiceStructured[];
  practice_name: string | null;
  practice_address: string | null;
  practice_employment_status: string | null;
  practice_phone: string | null;
  practice_email: string | null;
  practice_website: string | null;
  practice_hours: string | null;
  logo_url: string | null;
  accent_color: string | null;
  profile_background_color: string | null;
  appointment_link: string | null;
}
