"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Building, Calendar, ChevronRight, Database, Settings, Share2, Shield, Users } from "lucide-react";
import DashboardLayout from "../../../components/DashboardLayout";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/useToast";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type HubSummary = {
  configuredModules?: number;
  totalModules?: number;
  lastUpdatedAt?: string;
};

type GroupItem = {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  desc: string;
  path: string;
};

export default function SettingsHubPage() {
  const { error } = useToast();
  const errorRef = React.useRef(error);
  const [summary, setSummary] = React.useState<HubSummary>({});

  React.useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const settingsGroups: Array<{ title: string; items: GroupItem[] }> = [
    {
      title: "Core Configuration",
      items: [
        { icon: <Calendar />, label: "Academic Year", desc: "Manage terms and sessions", path: "/AdminDashboard/Settings/AcademicYear" },
        { icon: <Building />, label: "School Profile", desc: "Basic info and branding", path: "/AdminDashboard/Settings/SchoolProfile" },
      ],
    },
    {
      title: "Security & Access",
      items: [
        { icon: <Users />, label: "User Roles", desc: "Permissions and team access", path: "/AdminDashboard/Settings/UserRoles" },
        { icon: <Shield />, label: "Security", desc: "Login methods and audit logs", path: "/AdminDashboard/Settings/Security" },
      ],
    },
    {
      title: "Integrations & Data",
      items: [
        { icon: <Share2 />, label: "Integrations", desc: "Connect with WhatsApp, Email", path: "/AdminDashboard/Settings/Integration" },
        { icon: <Database />, label: "Backup", desc: "Export and restore school data", path: "/AdminDashboard/Settings/Backup" },
      ],
    },
    {
      title: "Communication",
      items: [
        { icon: <Bell />, label: "Notifications", desc: "SMS and Push settings", path: "/AdminDashboard/Settings/Notifications" },
      ],
    },
  ];

  React.useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<HubSummary>(API_ENDPOINTS.settingsHub);
        setSummary(payload);
      } catch (err) {
        errorRef.current(err instanceof Error ? err.message : "Unable to load settings hub summary.");
      }
    };
    void load();
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your school configuration with backend-driven modules.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3">
          <StatCard label="Configured Modules" value={`${summary.configuredModules ?? 0}`} />
          <StatCard label="Total Modules" value={`${summary.totalModules ?? settingsGroups.reduce((acc, group) => acc + group.items.length, 0)}`} />
          <StatCard
            label="Last Updated"
            value={summary.lastUpdatedAt ? new Date(summary.lastUpdatedAt).toLocaleString() : "-"}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          {settingsGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="ml-1 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {group.items.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                          {React.cloneElement(item.icon, { size: 24 })}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 transition-colors group-hover:text-emerald-900">{item.label}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="translate-x-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
