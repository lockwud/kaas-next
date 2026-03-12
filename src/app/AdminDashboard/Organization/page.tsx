"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Phone, MapPin, Globe, Award, Target, X, Settings, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";

type BranchApi = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  country: string;
  timezone: string;
  registrationNumber: string;
  taxNumber?: string | null;
  isActive: boolean;
  _count?: {
    users: number;
    students: number;
    classes: number;
    subjects: number;
  };
};

type OrganizationSummary = {
  school: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  metrics: {
    branches: number;
    users: number;
    students: number;
    classes: number;
    subjects: number;
  };
};

type BranchForm = {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  country: string;
  timezone: string;
  registrationNumber: string;
  taxNumber: string;
  isActive: boolean;
};

const emptyBranchForm: BranchForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  state: "",
  district: "",
  country: "Ghana",
  timezone: "Africa/Accra",
  registrationNumber: "",
  taxNumber: "",
  isActive: true,
};

export default function OrganizationPage() {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [summary, setSummary] = React.useState<OrganizationSummary | null>(null);
  const [branches, setBranches] = React.useState<BranchApi[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<BranchApi | null>(null);
  const [form, setForm] = React.useState<BranchForm>(emptyBranchForm);

  const fetchOrganization = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryPayload, branchesPayload] = await Promise.all([
        apiRequest<OrganizationSummary>("/organization/summary"),
        apiRequest<BranchApi[]>("/organization/branches"),
      ]);

      setSummary(summaryPayload);
      setBranches(branchesPayload);
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load organization data.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  React.useEffect(() => {
    void fetchOrganization();
  }, [fetchOrganization]);

  const setField = (key: keyof BranchForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyBranchForm);
    setSelectedBranch(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openManageModal = (branch: BranchApi) => {
    setSelectedBranch(branch);
    setForm({
      code: branch.code,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      state: branch.state,
      district: branch.district,
      country: branch.country,
      timezone: branch.timezone,
      registrationNumber: branch.registrationNumber,
      taxNumber: branch.taxNumber ?? "",
      isActive: branch.isActive,
    });
    setIsManageModalOpen(true);
  };

  const createBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest<BranchApi>("/organization/branches", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          state: form.state,
          district: form.district,
          country: form.country,
          timezone: form.timezone,
          registrationNumber: form.registrationNumber,
          taxNumber: form.taxNumber || undefined,
        }),
      });

      success("Branch created successfully.");
      setIsModalOpen(false);
      resetForm();
      await fetchOrganization();
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to create branch.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBranch) {
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest<BranchApi>(`/organization/branches/${selectedBranch.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          state: form.state,
          district: form.district,
          country: form.country,
          timezone: form.timezone,
          registrationNumber: form.registrationNumber,
          taxNumber: form.taxNumber || null,
          isActive: form.isActive,
        }),
      });

      success("Branch updated successfully.");
      setIsManageModalOpen(false);
      resetForm();
      await fetchOrganization();
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to update branch.");
    } finally {
      setIsSaving(false);
    }
  };

  const archiveBranch = async () => {
    if (!selectedBranch) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiRequest<BranchApi>(`/organization/branches/${selectedBranch.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      });

      success("Branch archived successfully.");
      setIsManageModalOpen(false);
      resetForm();
      await fetchOrganization();
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to archive branch.");
    } finally {
      setIsDeleting(false);
    }
  };

  const schoolName = summary?.school.name ?? "School";

  return (
    <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="h-32 w-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Building2 size={64} className="text-white" />
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{schoolName}</h1>
                <p className="text-indigo-200 font-medium">Organization and branch management</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-2 font-medium"><MapPin size={14} /> {summary?.metrics.branches ?? 0} Branches</span>
                <span className="flex items-center gap-2 font-medium"><Globe size={14} /> {summary?.metrics.users ?? 0} Users</span>
                <span className="flex items-center gap-2 font-medium"><Phone size={14} /> {summary?.metrics.students ?? 0} Students</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                <Target size={20} />
                <h3 className="font-bold uppercase tracking-wider text-[10px]">Branches</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed italic font-medium">
                Keep every campus aligned with one shared structure while preserving local operations.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                <Award size={20} />
                <h3 className="font-bold uppercase tracking-wider text-[10px]">Coverage</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed italic font-medium">
                Classes: {summary?.metrics.classes ?? 0} | Subjects: {summary?.metrics.subjects ?? 0}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">School Branches</h2>
                <p className="text-xs text-slate-500">Manage multiple campus locations.</p>
              </div>
              <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                <Plus size={16} className="mr-1" /> Add Branch
              </Button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-hidden">
              <Table
                columns={[
                  { header: "Branch Name", accessor: "name", className: "font-bold text-slate-900" },
                  {
                    header: "Location",
                    accessor: (row) => `${row.district}, ${row.state}`,
                    className: "text-slate-500 text-xs",
                  },
                  { header: "Code", accessor: "code", className: "text-slate-600 font-bold text-xs" },
                  {
                    header: "Status",
                    accessor: (row) => (
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${row.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                          }`}
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                    ),
                  },
                ]}
                data={branches}
                loading={isLoading}
                actions={(row) => (
                  <Button
                    variant="ghost"
                    onClick={() => openManageModal(row)}
                    className="text-slate-500 font-bold text-xs hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    Manage
                  </Button>
                )}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">Add New Branch</h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={createBranch} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Branch Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
                  <Input label="Branch Code" value={form.code} onChange={(e) => setField("code", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Branch Email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
                  <Input label="Contact Number" value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />
                </div>
                <Input label="Address" value={form.address} onChange={(e) => setField("address", e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="State" value={form.state} onChange={(e) => setField("state", e.target.value)} required />
                  <Input label="District" value={form.district} onChange={(e) => setField("district", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Country" value={form.country} onChange={(e) => setField("country", e.target.value)} required />
                  <Input label="Timezone" value={form.timezone} onChange={(e) => setField("timezone", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Registration Number" value={form.registrationNumber} onChange={(e) => setField("registrationNumber", e.target.value)} required />
                  <Input label="Tax Number (Optional)" value={form.taxNumber} onChange={(e) => setField("taxNumber", e.target.value)} />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8"
                    isLoading={isSaving}
                    loadingText="Saving..."
                    blurOnLoading
                  >
                    Create Branch
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManageModalOpen && selectedBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Settings size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Manage {selectedBranch.name}</h3>
                </div>
                <button onClick={() => setIsManageModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={updateBranch} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Branch Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
                  <Select
                    label="Branch Status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(e) => setField("isActive", e.target.value === "active")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Branch Code" value={form.code} onChange={(e) => setField("code", e.target.value)} required />
                  <Input label="Branch Email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Location Address" value={form.address} onChange={(e) => setField("address", e.target.value)} required />
                  <Input label="Contact" value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Archive Branch</p>
                    <p className="text-[10px] text-slate-500">Set this branch as inactive.</p>
                  </div>
                  <Button variant="ghost" className="text-red-600 hover:bg-red-50 text-xs font-bold" onClick={archiveBranch} isLoading={isDeleting}>
                    <Trash2 size={14} className="mr-2" /> Archive
                  </Button>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsManageModalOpen(false)}>Dismiss</Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8"
                    isLoading={isSaving}
                    loadingText="Saving..."
                    blurOnLoading
                  >
                    <Check size={16} className="mr-2" /> Save Changes
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
