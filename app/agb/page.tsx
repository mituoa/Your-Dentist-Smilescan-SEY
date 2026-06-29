import { permanentRedirect } from "next/navigation";

export default function AgbRedirectPage() {
  permanentRedirect("/trust/terms");
}
