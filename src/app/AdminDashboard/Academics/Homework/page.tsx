"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, FileText, FileX2, CheckCircle2, Clock3 } from "lucide-react";

type HW = { id: string; title: string; subject: string; className: string; deadline: string; status: "Open" | "Closed"; };

const INITIAL: HW[] = [
    { id: "1", title: "Trigonometry Problems", subject: "Mathematics", className: "JSS 3", deadline: "2026-03-08", status: "Open" },
    { id: "2", title: "Biology Diagram", subject: "Science", className: "JSS 2", deadline: "2026-03-05", status: "Open" },
    { id: "3", title: "Essay Writing", subject: "English", className: "SS 1", deadline: "2026-02-28", status: "Closed" },
];

export default function HomeworkPage() {
    const [homeworks, setHomeworks] = React.useState<HW[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [title, setTitle] = React.useState(""); const [subject, setSubject] = React.useState(""); const [className, setClassName] = React.useState(""); const [deadline, setDeadline] = React.useState(""); const [status, setStatus] = React.useState<"Open" | "Closed">("Open");
    const [filter, setFilter] = React.useState("All");

    const close = () => { setIsModalOpen(false); setTitle(""); setSubject(""); setClassName(""); setDeadline(""); setStatus("Open"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim() || !className.trim() || !deadline) return;
        setHomeworks(prev => [{ id: Date.now().toString(), title, subject, className, deadline, status }, ...prev]);
        close();
    };

    const filtered = filter === "All" ? homeworks : homeworks.filter(h => h.status === filter);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div><h2 className="text-2xl font-bold text-slate-900">Assign Homework</h2><p className="text-slate-500 text-sm mt-1">Assign and track homework for all classes.</p></div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"><Plus size={15} /> Assign Homework</button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {["All", "Open", "Closed"].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f} {f === "All" ? `(${homeworks.length})` : `(${homeworks.filter(h => h.status === f).length})`}</button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 text-center"><FileX2 size={28} className="text-slate-300 mb-2" /><p className="text-sm font-semibold text-slate-600">No homework found</p></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map(hw => (
                            <div key={hw.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><FileText size={16} /></div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${hw.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{hw.status}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mt-3">{hw.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">{hw.subject}</span>
                                    <span>&bull;</span>
                                    <span>{hw.className}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                                    {hw.status === "Open" ? <Clock3 size={12} className="text-amber-500" /> : <CheckCircle2 size={12} className="text-slate-400" />}
                                    <span>Deadline: <span className="font-semibold text-slate-700">{hw.deadline}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">Assign Homework</h3><p className="text-xs text-slate-500 mt-0.5">Create a new homework assignment.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 Review" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label><input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Mathematics" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Class</label><input required value={className} onChange={e => setClassName(e.target.value)} placeholder="JSS 2" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Deadline</label><input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label><select value={status} onChange={e => setStatus(e.target.value as "Open" | "Closed")} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option>Open</option><option>Closed</option></select></div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Assign</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
