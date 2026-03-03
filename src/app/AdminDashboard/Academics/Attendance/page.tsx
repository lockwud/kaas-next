"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, CalendarCheck, FileX2, Search, CheckCircle, XCircle } from "lucide-react";

type AttendanceRecord = {
    id: string;
    studentName: string;
    className: string;
    date: string;
    status: "Present" | "Absent" | "Late";
};

const INITIAL: AttendanceRecord[] = [
    { id: "1", studentName: "Daniel Moses", className: "JSS 2A", date: "2026-03-02", status: "Present" },
    { id: "2", studentName: "Sandra Ene", className: "JSS 2A", date: "2026-03-02", status: "Absent" },
    { id: "3", studentName: "Musa Idris", className: "SS 1B", date: "2026-03-02", status: "Late" },
    { id: "4", studentName: "Daniel Moses", className: "JSS 2A", date: "2026-03-01", status: "Present" },
    { id: "5", studentName: "Sandra Ene", className: "JSS 2A", date: "2026-03-01", status: "Present" },
];

const STATUS_COLORS: Record<string, string> = {
    Present: "bg-emerald-100 text-emerald-700",
    Absent: "bg-rose-100 text-rose-700",
    Late: "bg-amber-100 text-amber-700",
};

export default function AttendancePage() {
    const [records, setRecords] = React.useState<AttendanceRecord[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [studentName, setStudentName] = React.useState("");
    const [className, setClassName] = React.useState("");
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [status, setStatus] = React.useState<"Present" | "Absent" | "Late">("Present");
    const [search, setSearch] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("All");

    const close = () => { setIsModalOpen(false); setStudentName(""); setClassName(""); setStatus("Present"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !className.trim()) return;
        setRecords(prev => [{ id: Date.now().toString(), studentName, className, date, status }, ...prev]);
        close();
    };

    const filtered = records.filter(r => {
        const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) || r.className.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    const late = records.filter(r => r.status === "Late").length;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Attendance Tracking</h2>
                        <p className="text-slate-500 text-sm mt-1">Track and manage student daily attendance.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> Record Attendance
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle size={24} className="text-emerald-600 shrink-0" />
                        <div><p className="text-2xl font-black text-emerald-700">{present}</p><p className="text-xs text-emerald-600 font-medium">Present</p></div>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 flex items-center gap-3">
                        <XCircle size={24} className="text-rose-600 shrink-0" />
                        <div><p className="text-2xl font-black text-rose-700">{absent}</p><p className="text-xs text-rose-600 font-medium">Absent</p></div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                        <CalendarCheck size={24} className="text-amber-600 shrink-0" />
                        <div><p className="text-2xl font-black text-amber-700">{late}</p><p className="text-xs text-amber-600 font-medium">Late</p></div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or class…" className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    {["All", "Present", "Absent", "Late"].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400"><FileX2 size={24} /><p className="text-sm font-semibold text-slate-600">No records found</p></div>
                                </td></tr>
                            ) : filtered.map((r, i) => (
                                <tr key={r.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                                    <td className="px-4 py-3 font-medium text-slate-800">{r.studentName}</td>
                                    <td className="px-4 py-3 text-slate-600">{r.className}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{r.date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>{r.status}</span>
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
                                <div><h3 className="text-base font-bold text-slate-900">Record Attendance</h3><p className="text-xs text-slate-500 mt-0.5">Mark a student's attendance for a specific date.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
                                    <input required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                                    <input required value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. JSS 2A" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                        <select value={status} onChange={e => setStatus(e.target.value as "Present" | "Absent" | "Late")} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            <option>Present</option><option>Absent</option><option>Late</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Record</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
