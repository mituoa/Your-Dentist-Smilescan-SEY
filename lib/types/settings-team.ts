export interface TeamMember {
  user_id: string;
  email: string;
  role: "doctor" | "team";
  joined_at: string | null;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: "doctor" | "team";
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
}
