"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Table } from "../../../components/ui/Table";
import { ShieldCheck, Search, UserPlus2, Upload, Users2, KeyRound, GraduationCap } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { roleCapabilities, roleLabels, users } from "../../../lib/school-data";

interface UserTableRow {
  id: string;
  name: string;
  role: string;
  classAssignment: string;
  portalRights: string;
}

export default function MySchoolPage() {
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const rows: UserTableRow[] = users
    .filter((user) => (roleFilter === "all" ? true : user.role === roleFilter))
    .filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((user) => ({
      id: user.id,
      name: user.fullName,
      role: roleLabels[user.role],
      classAssignment: user.classTeacherFor ?? "-",
      portalRights: roleCapabilities[user.role].canManageUsers ? "Full" : "Limited",
    }));

  const leadershipCount = users.filter((user) => user.role === "proprietor" || user.role === "headmaster").length;
  const classTeacherCount = users.filter((user) => user.role === "class_teacher").length;

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Users Management</p>
          <h2 className="mt-2 text-2xl font-semibold">Manage Staff Access and Role Permissions</h2>
          <p className="mt-1 text-sm text-slate-300">Control user roles, class responsibility, and portal access in one place.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard icon={<Users2 size={16} />} label="Total Users" value={users.length.toString()} helper="All active portal users" />
          <MetricCard icon={<KeyRound size={16} />} label="Leadership" value={leadershipCount.toString()} helper="Proprietor + Headmaster" />
          <MetricCard icon={<GraduationCap size={16} />} label="Class Teachers" value={classTeacherCount.toString()} helper="Assigned class supervisors" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="relative xl:col-span-4">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by staff name"
                className="pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="xl:col-span-2">
              <Select
                options={[
                  { value: "all", label: "All Roles" },
                  { value: "proprietor", label: "Proprietor" },
                  { value: "headmaster", label: "Headmaster" },
                  { value: "subject_teacher", label: "Subject Teacher" },
                  { value: "class_teacher", label: "Class Teacher" },
                ]}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              />
            </div>

            <div className="flex gap-2 xl:col-span-6 xl:justify-end">
              <Button variant="outline" className="h-11 border-slate-200 text-slate-600">
                <Upload size={14} className="mr-1" /> Import Staff
              </Button>
              <Button className="h-11 bg-slate-900 text-white hover:bg-slate-800">
                <UserPlus2 size={14} className="mr-1" /> Add User
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <ShieldCheck size={16} className="text-emerald-600" />
            <p className="text-sm font-medium">Role-based security is active</p>
          </div>

          <Table
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Role", accessor: "role" },
              { header: "Class Teacher For", accessor: "classAssignment" },
              { header: "Portal Rights", accessor: "portalRights" },
            ]}
            data={rows}
            actions={(row) => <span className="text-xs font-medium text-slate-500">{row.portalRights}</span>}
          />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function MetricCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-600">
        <span className="rounded-lg bg-slate-100 p-1.5">{icon}</span>
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{helper}</p>
    </div>
  );
}
