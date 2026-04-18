import { signOut } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
}

export function UserMenu({ email, workspaceName, role }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm text-text-primary font-medium">
          {workspaceName}
        </div>
        <div className="text-xs text-text-tertiary">
          {email} · {role === "doctor" ? "Arzt" : "Team"}
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center justify-center w-9 h-9 rounded border border-border text-text-secondary hover:text-text-primary hover:bg-surface-sunken transition-colors"
          title="Abmelden"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
