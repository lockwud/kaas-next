"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, Layers, FileX2, Pencil, Trash2 } from "lucide-react";

type Section = {
    id: string;
    name: string;
    category: string;
    capacity: number;
    status: "Active" | "Inactive";
};

const INITIAL_SECTIONS: Section[] = [
    { id: "s1", name: "Section A", category: "Primary", capacity: 40, status: "Active" },
    { id: "s2", name: "Section B", category: "Junior High", capacity: 35, status: "Active" },
    { id: "s3", name: "Section C", category: "Senior High", capacity: 30, status: "Inactive" },
];

export default function SectionsPage() {
    const [sections, setSections] = React.useState<Section[]>(INITIAL_SECTIONS);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Section | null>(null);
    const [name, setName] = React.useState("");
    const [category, setCategory] = React.useState("Primary");
    const [capacity, setCapacity] = React.useState("");
    const [status, setStatus] = React.useState<"Active" | "Inactive">("Active");
    const [deleteTarget, setDeleteTarget] = React.useState<Section | null>(null);

    const openAdd = () => {
        setEditing(null);
        setName(""); setCategory("Primary"); setCapacity(""); setStatus("Active");
        setIsModalOpen(true);
    };
    const openEdit = (s: Section) => {
        setEditing(s);
        setName(s.name); setCategory(s.category); setCapacity(String(s.capacity)); setStatus(s.status);
        setIsModalOpen(true);
    };
    const close = () => { setIsModalOpen(false); setEditing(null); };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !capacity) return;
        if (editing) {
            setSections(prev => prev.map(s => s.id === editing.id ? { ...s, name, category, capacity: Number(capacity), status } : s));
        } else {
            setSections(prev => [{ id: Date.now().toString(), name, category, capacity: Number(capacity), status }, ...prev]);
        }
        close();
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setSections(prev => prev.filter(s => s.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Sections</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage and organize student sections across categories.</p>
                    </div>
                    <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> Add Section
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Sections", value: sections.length, color: "bg-blue-50 text-blue-700" },
                        { label: "Active", value: sections.filter(s => s.status === "Active").length, color: "bg-emerald-50 text-emerald-700" },
                        { label: "Inactive", value: sections.filter(s => s.status === "Inactive").length, color: "bg-slate-100 text-slate-600" },
                        { label: "Total Capacity", value: sections.reduce((a, s) => a + s.capacity, 0), color: "bg-amber-50 text-amber-700" },
                    ].map(st => (
                        <div key={st.label} className={`${st.color} rounded-xl p-4`}>
                            <p className="text-2xl font-black">{st.value}</p>
                            <p className="text-xs font-medium mt-0.5 opacity-70">{st.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
                                <th className="px-4 py-3">Section Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Capacity</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.length === 0 ? (
                                <tr><td colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <FileX2 size={28} />
                                        <p className="text-sm font-semibold text-slate-600">No sections found</p>
                                    </div>
                                </td></tr>
                            ) : sections.map((s, i) => (
                                <tr key={s.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/40"} hover:bg-slate-50/70`}>
                                    <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2"><Layers size={14} className="text-emerald-600" />{s.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{s.category}</td>
                                    <td className="px-4 py-3 text-slate-600">{s.capacity} students</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{s.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{editing ? "Edit Section" : "Add New Section"}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Fill in the section details below.</p>
                                </div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Section Name</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Section D" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                        {["Primary", "Junior High", "Senior High"].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Capacity</label>
                                        <input type="number" required min={1} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="40" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                        <select value={status} onChange={e => setStatus(e.target.value as "Active" | "Inactive")} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            <option>Active</option><option>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">{editing ? "Update" : "Add Section"}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Trash2 size={20} /></div>
                            <h4 className="text-base font-bold text-slate-900">Delete Section?</h4>
                            <p className="text-sm text-slate-500 mt-1">This will remove <span className="font-semibold text-slate-700">{deleteTarget.name}</span> permanently.</p>
                            <div className="flex justify-center gap-3 mt-5">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
