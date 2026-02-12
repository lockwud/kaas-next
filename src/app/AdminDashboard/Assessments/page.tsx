import { redirect } from "next/navigation";

export default function LegacyAssessmentsRedirect() {
  redirect("/AdminDashboard/Academics/Assessments");
}
