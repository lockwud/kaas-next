"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/Table";
import { Input } from "../../../../components/ui/Input";
import { motion } from "framer-motion";
import { Shield, Users, Plus, ChevronLeft, X, Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface RoleRow {
    id: string;
    role: string;
    usersCount: number;
    description: string;
}

export default function UserRolesPage() {
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [roles, setRoles] = React.useState<RoleRow[]>([]);
    const [newRoleTitle, setNewRoleTitle] = React.useState("");
    const [newRoleDescription, setNewRoleDescription] = React.useState("");

    React.useEffect(() => {
        const load = async () => {
            try {
                const payload = await apiRequest<RoleRow[]>("/settings/user-roles");
                setRoles(payload);
            } catch (err) {
                error(err instanceof Error ? err.message : "Unable to load user roles.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [error]);

    const createRole = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!newRoleTitle.trim() || !newRoleDescription.trim()) {
            error("Role title and description are required.");
            return;
        }

        setIsCreating(true);
        try {
            const payload = await apiRequest<RoleRow>("/settings/user-roles", {
                method: "POST",
                body: JSON.stringify({
                    role: newRoleTitle.trim(),
                    description: newRoleDescription.trim(),
                }),
            });
            setRoles((current) => [payload, ...current]);
            success("New role has been created successfully.");
            setIsModalOpen(false);
            setNewRoleTitle("");
            setNewRoleDescription("");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to create role.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/AdminDashboard/Settings" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <ChevronLeft size={14} /> Settings
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-900">User Roles</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Define access levels and user responsibilities.</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                        <Plus size={18} className="mr-2" /> New Role
                    </Button>
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table
                        columns={[
                            {
                                header: "Role Name", accessor: (row) => (
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{row.role}</span>
                                        {row.role === "Super Admin" && <Lock size={12} className="text-slate-400" />}
                                    </div>
                                )
                            },
                            { header: "Description", accessor: "description", className: "text-slate-500 text-xs italic" },
                            {
                                header: "Users", accessor: (row) => (
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <Users size={14} className="text-slate-400" /> {row.usersCount} Members
                                    </div>
                                )
                            },
                        ]}
                        data={roles}
                        loading={isLoading}
                        actions={() => (
                            <Button variant="ghost" className="text-xs text-blue-600 font-bold">Edit Permissions</Button>
                        )}
                    />
                </div>

                {/* Permission Matrix Preview (Static) */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Check size={18} className="text-emerald-500" /> Permission Matrix Overview
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                                    <th className="text-left pb-4">Module</th>
                                    <th className="px-4 pb-4">View</th>
                                    <th className="px-4 pb-4">Create</th>
                                    <th className="px-4 pb-4">Edit</th>
                                    <th className="px-4 pb-4">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <PermissionRow module="Students" view create edit del />
                                <PermissionRow module="Finance" view create edit />
                                <PermissionRow module="Academics" view create edit del />
                                <PermissionRow module="Inventory" view />
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Define New Role</h3>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="Role Title" placeholder="e.g. Librarian" value={newRoleTitle} onChange={(event) => setNewRoleTitle(event.target.value)} required />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    className="w-full min-h-20 rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                                    placeholder="Purpose of this role..."
                                    value={newRoleDescription}
                                    onChange={(event) => setNewRoleDescription(event.target.value)}
                                />
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700">
                                You can configure specific module-level permissions after creating the role.
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={createRole} isLoading={isCreating}>Create Role</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}

function PermissionRow({ module, view, create, edit, del }: { module: string; view?: boolean; create?: boolean; edit?: boolean; del?: boolean }) {
    return (
        <tr>
            <td className="py-3 font-medium text-slate-700">{module}</td>
            <td className="px-4 py-3 text-center">{view ? <div className="h-5 w-5 rounded-md bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center"><Check size={12} strokeWidth={4} /></div> : <div className="h-5 w-5 rounded-md bg-slate-100 mx-auto" />}</td>
            <td className="px-4 py-3 text-center">{create ? <div className="h-5 w-5 rounded-md bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center"><Check size={12} strokeWidth={4} /></div> : <div className="h-5 w-5 rounded-md bg-slate-100 mx-auto" />}</td>
            <td className="px-4 py-3 text-center">{edit ? <div className="h-5 w-5 rounded-md bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center"><Check size={12} strokeWidth={4} /></div> : <div className="h-5 w-5 rounded-md bg-slate-100 mx-auto" />}</td>
            <td className="px-4 py-3 text-center">{del ? <div className="h-5 w-5 rounded-md bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center"><Check size={12} strokeWidth={4} /></div> : <div className="h-5 w-5 rounded-md bg-slate-100 mx-auto" />}</td>
        </tr>
    );
}
