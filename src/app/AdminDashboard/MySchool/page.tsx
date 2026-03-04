"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Table } from "../../../components/ui/Table";
import { ShieldAlert, ShieldCheck, Search, UserPlus2, Upload, Users2, KeyRound, GraduationCap, X, Check } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { roleCapabilities, roleLabels } from "../../../lib/school-data";
import { useToast } from "@/hooks/useToast";
import { ApiRequestError, apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

interface UserTableRow {
  id: string;
  name: string;
  role: string;
  classAssignment: string;
  portalRights: string;
}

export default function MySchoolPage() {
  const { success, error } = useToast();
  const errorRef = React.useRef(error);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isForbidden, setIsForbidden] = React.useState(false);
  const [managedUsers, setManagedUsers] = React.useState<Array<{
    id: string;
    fullName: string;
    role: string;
    classTeacherFor?: string | null;
    user?: { email: string };
  }>>([]);

  // Form State
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState("subject_teacher");
  const [newUserPassword, setNewUserPassword] = React.useState("Pass123$1");

  React.useEffect(() => {
    errorRef.current = error;
  }, [error]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<Array<{
          id: string;
          fullName: string;
          role: string;
          classTeacherFor?: string | null;
          user?: { email: string };
        }>>(API_ENDPOINTS.usersManagement);
        setManagedUsers(payload);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 403) {
          setIsForbidden(true);
          return;
        }
        errorRef.current(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const roleToKey = (role: string): keyof typeof roleLabels | null => {
    const normalized = role.toLowerCase();
    if (normalized === "subject_teacher") return "subject_teacher";
    if (normalized === "class_teacher") return "class_teacher";
    if (normalized === "headmaster") return "headmaster";
    if (normalized === "administrator") return "administrator";
    if (normalized === "proprietor") return "proprietor";
    return null;
  };

  const keyToBackendRole = (role: string): string => {
    switch (role) {
      case "subject_teacher":
        return "SUBJECT_TEACHER";
      case "class_teacher":
        return "CLASS_TEACHER";
      case "headmaster":
        return "HEADMASTER";
      case "proprietor":
        return "PROPRIETOR";
      default:
        return "ADMINISTRATOR";
    }
  };

  const sourceUsers = managedUsers.map((user) => {
    const roleKey = roleToKey(user.role);
    return {
      id: user.id,
      fullName: user.fullName,
      role: roleKey ?? "administrator",
      classTeacherFor: user.classTeacherFor ?? undefined,
    };
  });

  const rows: UserTableRow[] = sourceUsers
    .filter((user) => (roleFilter === "all" ? true : user.role === roleFilter))
    .filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((user) => ({
      id: user.id,
      name: user.fullName,
      role: roleLabels[user.role as keyof typeof roleLabels] ?? user.role,
      classAssignment: user.classTeacherFor ?? "-",
      portalRights: roleCapabilities[user.role as keyof typeof roleCapabilities]?.canManageUsers ? "Full" : "Limited",
    }));

  const leadershipCount = sourceUsers.filter((user) => user.role === "proprietor" || user.role === "headmaster").length;
  const classTeacherCount = sourceUsers.filter((user) => user.role === "class_teacher").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const created = await apiRequest<{
        id: string;
        fullName: string;
        role: string;
        classTeacherFor?: string | null;
        user?: { email: string };
      }>(API_ENDPOINTS.usersManagement, {
        method: "POST",
        body: JSON.stringify({
          fullName: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: keyToBackendRole(newUserRole),
        }),
      });

      setManagedUsers((current) => [created, ...current]);
      success(`User "${newUserName}" has been added successfully.`);
      setIsModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("subject_teacher");
      setNewUserPassword("Pass123$1");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 403) {
        setIsForbidden(true);
        return;
      }
      error(err instanceof Error ? err.message : "Unable to add user.");
    } finally {
      setIsCreating(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {isForbidden && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert size={22} />
            </div>
            <h2 className="text-xl font-semibold text-rose-900">Forbidden</h2>
            <p className="mt-2 text-sm text-rose-700">
              You do not have permission to view users management data.
            </p>
          </div>
        )}

        {!isForbidden && (
          <>
        <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Users Management</p>
          <h2 className="mt-2 text-2xl font-semibold">Manage Staff Access and Role Permissions</h2>
          <p className="mt-1 text-sm text-slate-300">Control user roles, class responsibility, and portal access in one place.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard icon={<Users2 size={16} />} label="Total Users" value={sourceUsers.length.toString()} helper="All active portal users" />
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
              <Button onClick={() => setIsModalOpen(true)} className="h-11 bg-slate-900 text-white hover:bg-slate-800">
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
            loading={isLoading}
            actions={(row) => <span className="text-xs font-medium text-slate-500">{row.portalRights}</span>}
          />
        </div>
          </>
        )}
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {!isForbidden && isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <UserPlus2 size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Add System User</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@school.edu.gh"
                  required
                />
                <Input
                  label="Temporary Password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Set first-login password"
                  required
                />
                <Select
                  label="System Role"
                  options={[
                    { value: "subject_teacher", label: "Subject Teacher" },
                    { value: "class_teacher", label: "Class Teacher" },
                    { value: "headmaster", label: "Headmaster" },
                    { value: "proprietor", label: "Proprietor" },
                    { value: "admin", label: "System Admin" },
                  ]}
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                />

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-2">
                  <p className="text-[10px] text-amber-800 leading-relaxed italic">
                    <strong>Note:</strong> New users will receive an email to set their password.
                    Their permissions will be inherited based on the selected role.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8 shadow-md" isLoading={isCreating}>
                    <Check size={16} className="mr-2" /> Provision Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function MetricCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-600">
        <span className="rounded-lg bg-slate-100 p-1.5">{icon}</span>
        <p className="text-xs uppercase tracking-wide font-bold">{label}</p>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{helper}</p>
    </div>
  );
}
