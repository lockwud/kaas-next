import { redirect } from "next/navigation";

export default function LegacyReportsRedirect() {
  redirect("/AdminDashboard/Academics/Reports");
}
