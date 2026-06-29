import { permanentRedirect } from "next/navigation";

export default function DatenschutzRedirectPage() {
  permanentRedirect("/trust/privacy");
}
