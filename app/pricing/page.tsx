import { redirect } from "next/navigation";

/** Dedicated pricing overview — same ecosystem as /register#pricing */
export default function PricingPage() {
  redirect("/register#pricing");
}
