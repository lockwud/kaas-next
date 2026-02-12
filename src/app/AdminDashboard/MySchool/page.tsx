"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Table } from "../../../components/ui/Table";
import { Plus, Search, ShieldCheck, Upload } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { branches, getBranchName, roleCapabilities, roleLabels, users } from "../../../lib/school-data";

interface UserTableRow {
  id: string;
  name: string;
  role: string;
  branch: string;
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
      branch: getBranchName(user.branchId),
      classAssignment: user.classTeacherFor ?? "-",
      portalRights: roleCapabilities[user.role].canManageUsers ? "Full" : "Limited",
    }));

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Role", accessor: "role" as const },
    { header: "Branch", accessor: "branch" as const },
    { header: "Class Teacher For", accessor: "classAssignment" as const },
    { header: "Portal Rights", accessor: "portalRights" as const },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search staff user"
              className="pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full lg:w-auto">
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
            <Button variant="outline" className="h-11 text-xs border-gray-200 text-gray-600">
              <Upload size={14} className="mr-1" /> Import Staff (Excel)
            </Button>
            <Button className="h-11 text-xs whitespace-nowrap">
              <Plus size={14} className="mr-1" /> Add User
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500 tracking-wide">Branches</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{branches.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs uppercase text-gray-500 tracking-wide">Leadership Access</p>
            <p className="text-sm text-gray-700 mt-2">Proprietor and Headmaster have equal management rights.</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <ShieldCheck size={16} className="text-emerald-600" />
              <p className="text-sm">Role-based permissions active</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Each user action is enforced by role and branch scope.</p>
          </div>
        </div>

        <Table
          columns={columns}
          data={rows}
          actions={(row) => (
            <div className="text-xs text-gray-500 font-medium">{row.portalRights}</div>
          )}
        />
      </motion.div>
    </DashboardLayout>
  );
}
