import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { PageLoadingSkeleton } from "../../components/ui/PageLoadingSkeleton";

export default function Loading() {
  return (
    <DashboardLayout>
      <PageLoadingSkeleton />
    </DashboardLayout>
  );
}
