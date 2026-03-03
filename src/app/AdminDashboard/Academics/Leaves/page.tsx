"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, FileX2, UserPen, CheckCircle2, Clock3 } from "lucide-react";

type LeaveRequest = { id: string; studentName: string; className: string; duration: string; reason: string; status: "Pending" | "Approved" | "Rejected"; };

const INITIAL: LeaveRequest[] = [
    { id: "1", studentName: "Daniel Moses", className: "JSS 2A", duration: "2 days", reason: "Medical Appointment", status: "Approved" },
    { id: "2", studentName: "Sandra Ene", className: "JSS 2A", duration: "1 day", reason: "Family Emergency", status: "Pending" },
    { id: "3", studentName: "Musa Idris", className: "SS 1B", duration: "3 days", reason: "Travel", status: "Rejected" },
];

const STATUS_STYLE: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
};

export default function LeavesPage() {
    const [leaves, setLeaves] = React.useState<LeaveRequest[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [studentName, setStudentName] = React.useState(""); const [className, setClassName] = React.useState(""); const [duration, setDuration] = React.useState(""); const [reason, setReason] = React.useState(""); const [status, setStatus] = React.useState<"Pending" | "Approved" | "Rejected">("Pending");
    const [filter, setFilter] = React.useState("All");

    const close = () => { setIsModalOpen(false); setStudentName(""); setClassName(""); setDuration(""); setReason(""); setStatus("Pending"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !className.trim() || !duration.trim() || !reason.trim()) return;
        setLeaves(prev => [{ id: Date.now().toString(), studentName, className, duration, reason, status }, ...prev]);
        close();
    };
    const updateStatus = (id: string, newStatus: "Pending" | "Approved" | "Rejected") => setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    const filtered = filter === "All" ? leaves : leaves.filter(l => l.status === filter);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div><h2 className="text-2xl font-bold text-slate-900">Student Leaves</h2><p className="text-slate-500 text-sm mt-1">Manage and approve leave requests from students.</p></div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"><Plus size={15} /> New Request</button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[["Pending", "bg-amber-50 text-amber-700", Clock3], ["Approved", "bg-emerald-50 text-emerald-700", CheckCircle2], ["Rejected", "bg-rose-50 text-rose-700", X]].map(([label, cls, Icon]: any) => (
                        <div key={label} className={`${cls} rounded-xl p-4 flex items-center gap-3`}>
                            <Icon size={20} className="shrink-0 opacity-70" />
                            <div><p className="text-2xl font-black">{leaves.filter(l => l.status === label).length}</p><p className="text-xs font-medium mt-0.5 opacity-70">{label}</p></div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                    {["All", "Pending", "Approved", "Rejected"].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f}</button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead><tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
                            <th className="px-4 py-3">Student Name</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="h-40 text-center"><div className="flex flex-col items-center justify-center gap-2 text-slate-400"><FileX2 size={24} /><p className="text-sm font-semibold text-slate-600">No requests found</p></div></td></tr>
                            ) : filtered.map((l, i) => (
                                <tr key={l.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                                    <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2"><UserPen size={13} className="text-slate-400" />{l.studentName}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.className}</td>
                                    <td className="px-4 py-3 text-slate-600">{l.duration}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[150px] truncate">{l.reason}</td>
                                    <td className="px-4 py-3"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[l.status]}`}>{l.status}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        {l.status === "Pending" && (
                                            <div className="inline-flex items-center gap-1">
                                                <button onClick={() => updateStatus(l.id, "Approved")} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition-colors">Approve</button>
                                                <button onClick={() => updateStatus(l.id, "Rejected")} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-semibold hover:bg-rose-200 transition-colors">Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">New Leave Request</h3><p className="text-xs text-slate-500 mt-0.5">Submit a student leave request.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label><input required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Class</label><input required value={className} onChange={e => setClassName(e.target.value)} placeholder="JSS 2A" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label><input required value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 2 days" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label><select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label><textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="State the reason for leave…" className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" /></div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Submit</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
