"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-session";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/Login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <>{children}</>;
}
