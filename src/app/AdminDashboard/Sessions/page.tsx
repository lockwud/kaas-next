"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, Pencil, Trash2, CalendarRange, CheckCircle2, Clock3 } from "lucide-react";

type Session = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "Active" | "Upcoming" | "Closed";
    terms: number;
};

const INITIAL_SESSIONS: Session[] = [
    { id: "1", name: "Academic Year 2025/2026", startDate: "2025-09-01", endDate: "2026-07-31", status: "Active", terms: 3 },
    { id: "2", name: "Academic Year 2024/2025", startDate: "2024-09-01", endDate: "2025-07-31", status: "Closed", terms: 3 },
    { id: "3", name: "Summer Remedial 2025", startDate: "2025-07-15", endDate: "2025-08-30", status: "Closed", terms: 1 },
];

const STATUS_STYLE: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Upcoming: "bg-blue-100 text-blue-700",
    Closed: "bg-slate-100 text-slate-500",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
    Active: <CheckCircle2 size={12} />,
    Upcoming: <Clock3 size={12} />,
    Closed: <X size={12} />,
};

export default function SessionsPage() {
    const [sessions, setSessions] = React.useState<Session[]>(INITIAL_SESSIONS);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Session | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<Session | null>(null);

    // Form state
    const [name, setName] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [status, setStatus] = React.useState<Session["status"]>("Upcoming");
    const [terms, setTerms] = React.useState("3");

    const openAdd = () => { setEditing(null); setName(""); setStartDate(""); setEndDate(""); setStatus("Upcoming"); setTerms("3"); setIsModalOpen(true); };
    const openEdit = (s: Session) => { setEditing(s); setName(s.name); setStartDate(s.startDate); setEndDate(s.endDate); setStatus(s.status); setTerms(String(s.terms)); setIsModalOpen(true); };
    const close = () => { setIsModalOpen(false); setEditing(null); };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !startDate || !endDate) return;
        if (editing) {
            setSessions(prev => prev.map(s => s.id === editing.id ? { ...s, name, startDate, endDate, status, terms: Number(terms) } : s));
        } else {
            setSessions(prev => [{ id: Date.now().toString(), name, startDate, endDate, status, terms: Number(terms) }, ...prev]);
        }
        close();
    };

    const activeSession = sessions.find(s => s.status === "Active");

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Academic Sessions</h2>
                        <p className="text-slate-500 text-sm mt-1">Configure and track academic years and session periods.</p>
                    </div>
                    <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> New Session
                    </button>
                </div>

                {/* Active session banner */}
                {activeSession && (
                    <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <Calendar size={22} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest">Current Active Session</p>
                                <h3 className="text-lg font-black mt-0.5">{activeSession.name}</h3>
                                <p className="text-emerald-200 text-xs mt-0.5">
                                    {activeSession.startDate} → {activeSession.endDate} · {activeSession.terms} Term{activeSession.terms !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => openEdit(activeSession)} className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold text-white transition-colors">
                            Edit Session
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total Sessions", value: sessions.length, color: "bg-slate-50 text-slate-700", icon: <CalendarRange size={18} /> },
                        { label: "Active", value: sessions.filter(s => s.status === "Active").length, color: "bg-emerald-50 text-emerald-700", icon: <CheckCircle2 size={18} /> },
                        { label: "Closed", value: sessions.filter(s => s.status === "Closed").length, color: "bg-slate-100 text-slate-500", icon: <Clock3 size={18} /> },
                    ].map(st => (
                        <div key={st.label} className={`${st.color} rounded-xl p-4 flex items-center gap-3`}>
                            <span className="opacity-60 shrink-0">{st.icon}</span>
                            <div><p className="text-2xl font-black">{st.value}</p><p className="text-xs font-medium opacity-70 mt-0.5">{st.label}</p></div>
                        </div>
                    ))}
                </div>

                {/* Sessions list */}
                <div className="space-y-3">
                    {sessions.map(session => (
                        <div key={session.id} className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${session.status === "Active" ? "border-emerald-200 ring-1 ring-emerald-200" : "border-slate-200"}`}>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900">{session.name}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[session.status]}`}>
                                                {STATUS_ICON[session.status]} {session.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><CalendarRange size={11} /> {session.startDate} → {session.endDate}</span>
                                            <span>{session.terms} Term{session.terms !== 1 ? "s" : ""}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEdit(session)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"><Pencil size={15} /></button>
                                    <button onClick={() => setDeleteTarget(session)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{editing ? "Edit Session" : "New Academic Session"}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Define the session name, duration, and terms.</p>
                                </div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Session Name</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Academic Year 2026/2027" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                                        <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                                        <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Terms</label>
                                        <select value={terms} onChange={e => setTerms(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            <option value="1">1 Term</option>
                                            <option value="2">2 Terms</option>
                                            <option value="3">3 Terms</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                        <select value={status} onChange={e => setStatus(e.target.value as Session["status"])} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            <option>Active</option>
                                            <option>Upcoming</option>
                                            <option>Closed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">{editing ? "Update" : "Create Session"}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Trash2 size={20} /></div>
                            <h4 className="text-base font-bold text-slate-900">Delete Session?</h4>
                            <p className="text-sm text-slate-500 mt-1">This will permanently remove <span className="font-semibold text-slate-700">{deleteTarget.name}</span>.</p>
                            <div className="flex justify-center gap-3 mt-5">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={() => { setSessions(prev => prev.filter(s => s.id !== deleteTarget.id)); setDeleteTarget(null); }} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
