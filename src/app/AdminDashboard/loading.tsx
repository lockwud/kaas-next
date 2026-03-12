import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { OrbitLoader } from "../../components/ui/LoadingIndicator";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <OrbitLoader />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Loading</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
