"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, Mail, Phone, MapPin, Globe, Award, Target, X, Settings, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface BranchRow {
    id: string;
    name: string;
    location: string;
    manager: string;
    contact: string;
    status: "Active" | "Inactive";
}

export default function OrganizationPage() {
    const { success } = useToast();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);
    const [selectedBranch, setSelectedBranch] = React.useState<BranchRow | null>(null);

    // Modal state for branch
    const [branchName, setBranchName] = React.useState("");
    const [branchLocation, setBranchLocation] = React.useState("");
    const [branchManager, setBranchManager] = React.useState("");
    const [branchContact, setBranchContact] = React.useState("");
    const [branchStatus, setBranchStatus] = React.useState<"Active" | "Inactive">("Active");

    const branches: BranchRow[] = [
        { id: "BR-001", name: "Main Campus (Accra)", location: "East Legon, Accra", manager: "Dr. K. Mensah", contact: "+233 24 123 4567", status: "Active" },
        { id: "BR-002", name: "Kumasi Branch", location: "Adum, Kumasi", manager: "Mrs. S. Owusu", contact: "+233 20 987 6543", status: "Active" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting branch data:", { branchName, branchLocation, branchManager, branchContact, branchStatus });
        success(`Branch "${branchName}" has been saved successfully.`);
        setIsModalOpen(false);
        setIsManageModalOpen(false);
        // Reset
        setBranchName("");
        setBranchLocation("");
        setBranchManager("");
        setBranchContact("");
    };

    const handleManage = (branch: BranchRow) => {
        setSelectedBranch(branch);
        setBranchName(branch.name);
        setBranchLocation(branch.location);
        setBranchManager(branch.manager);
        setBranchContact(branch.contact);
        setBranchStatus(branch.status);
        setIsManageModalOpen(true);
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
                {/* School Header */}
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
                                <h1 className="text-3xl font-bold">International School of Ghana</h1>
                                <p className="text-indigo-200 font-medium">Secondary & Pre-Tertiary Excellence Since 1995</p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                                <span className="flex items-center gap-2 font-medium"><MapPin size={14} /> Accra - East Legon</span>
                                <span className="flex items-center gap-2 font-medium"><Globe size={14} /> www.isghana.edu</span>
                                <span className="flex items-center gap-2 font-medium"><Phone size={14} /> +233 302 445 667</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Mission & Vision */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-emerald-600">
                                <Target size={20} />
                                <h3 className="font-bold uppercase tracking-wider text-[10px]">Our Mission</h3>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed italic font-medium">
                                "To provide a globally competitive education while fostering moral integrity and creative leadership in every student."
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-3 mb-4 text-indigo-600">
                                <Award size={20} />
                                <h3 className="font-bold uppercase tracking-wider text-[10px]">Our Vision</h3>
                            </div>
                            <p className="text-slate-600 text-xs leading-relaxed italic font-medium">
                                "To be the leading center of academic excellence and character development in West Africa."
                            </p>
                        </div>
                    </div>

                    {/* Branches Listing */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">School Branches</h2>
                                <p className="text-xs text-slate-500">Manage multiple campus locations.</p>
                            </div>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                                <Plus size={16} className="mr-1" /> Add Branch
                            </Button>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-hidden">
                            <Table
                                columns={[
                                    { header: "Branch Name", accessor: "name", className: "font-bold text-slate-900" },
                                    { header: "Location", accessor: "location", className: "text-slate-500 text-xs" },
                                    { header: "Manager", accessor: "manager", className: "text-slate-600 font-bold text-xs" },
                                    {
                                        header: "Status", accessor: (row) => (
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${row.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                                                {row.status}
                                            </span>
                                        )
                                    },
                                ]}
                                data={branches}
                                actions={(row) => <Button variant="ghost" onClick={() => handleManage(row)} className="text-slate-500 font-bold text-xs hover:text-indigo-600 hover:bg-indigo-50">Manage</Button>}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Create Branch Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Add New Branch</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <Input label="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Takoradi Campus" required />
                                <Input label="Location" value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} placeholder="Full address" required />
                                <Input label="Branch Manager" value={branchManager} onChange={(e) => setBranchManager(e.target.value)} placeholder="Full name" required />
                                <Input label="Contact Number" value={branchContact} onChange={(e) => setBranchContact(e.target.value)} placeholder="+233..." required />

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8">Create Branch</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Branch Modal */}
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
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
                                    <Select
                                        label="Branch Status"
                                        options={[
                                            { value: "Active", label: "Active" },
                                            { value: "Inactive", label: "Inactive" }
                                        ]}
                                        value={branchStatus}
                                        onChange={(e) => setBranchStatus(e.target.value as any)}
                                    />
                                </div>
                                <Input label="Manager" value={branchManager} onChange={(e) => setBranchManager(e.target.value)} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Location" value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} required />
                                    <Input label="Contact" value={branchContact} onChange={(e) => setBranchContact(e.target.value)} required />
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Dangerous Action</p>
                                        <p className="text-[10px] text-slate-500">Remove this branch from organization records.</p>
                                    </div>
                                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 text-xs font-bold"><Trash2 size={14} className="mr-2" /> Delete Branch</Button>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsManageModalOpen(false)}>Dismiss</Button>
                                    <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8">
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
