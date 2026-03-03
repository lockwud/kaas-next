"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Video, Lock, Plus, X, Users, Clock } from "lucide-react";

type LiveClass = { id: string; title: string; subject: string; className: string; host: string; date: string; startTime: string; status: "Scheduled" | "Live" | "Ended"; };

const INITIAL: LiveClass[] = [
    { id: "1", title: "Algebra: Quadratic Equations", subject: "Mathematics", className: "JSS 3", host: "Mr. Appiah", date: "2026-03-05", startTime: "10:00", status: "Scheduled" },
    { id: "2", title: "Photosynthesis Deep Dive", subject: "Science", className: "JSS 2", host: "Mrs. Amankwah", date: "2026-03-02", startTime: "09:00", status: "Ended" },
];

export default function LiveClassesPage() {
    const [sessions, setSessions] = React.useState<LiveClass[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isProModal, setIsProModal] = React.useState(false);
    const [title, setTitle] = React.useState(""); const [subject, setSubject] = React.useState(""); const [className, setClassName] = React.useState(""); const [host, setHost] = React.useState(""); const [date, setDate] = React.useState(""); const [startTime, setStartTime] = React.useState("08:00");

    const close = () => { setIsModalOpen(false); setTitle(""); setSubject(""); setClassName(""); setHost(""); setDate(""); setStartTime("08:00"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim() || !className.trim() || !host.trim() || !date) return;
        setSessions(prev => [{ id: Date.now().toString(), title, subject, className, host, date, startTime, status: "Scheduled" }, ...prev]);
        close();
    };

    const STATUS_STYLE: Record<string, string> = { Scheduled: "bg-blue-100 text-blue-700", Live: "bg-rose-100 text-rose-700", Ended: "bg-slate-100 text-slate-500" };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                {/* Pro Banner */}
                <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl" />
                    <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2"><Lock size={14} className="text-violet-200" /><span className="text-xs font-bold uppercase tracking-widest text-violet-200">Pro Feature</span></div>
                            <h2 className="text-xl font-black">Live Classes</h2>
                            <p className="text-violet-200 text-sm mt-1 max-w-sm">Host interactive virtual classes, record sessions, and monitor attendance in real-time.</p>
                        </div>
                        <button onClick={() => setIsProModal(true)} className="px-4 py-2 rounded-xl bg-white text-violet-700 font-bold text-sm hover:bg-violet-50 transition-colors shadow-sm">Upgrade to Pro</button>
                    </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Scheduled Sessions</h3>
                        <p className="text-slate-500 text-sm mt-0.5">Preview upcoming and past live class sessions.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold text-white shadow-sm transition-colors"><Plus size={15} /> Schedule Session</button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {sessions.map(s => (
                        <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0"><Video size={18} /></div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 mt-3">{s.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{s.subject} &bull; {s.className}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Users size={11} /> {s.host}</span>
                                <span className="flex items-center gap-1"><Clock size={11} /> {s.date} at {s.startTime}</span>
                            </div>
                            {s.status === "Scheduled" && (
                                <button onClick={() => setIsProModal(true)} className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors">
                                    <Lock size={11} /> Join Session (Pro)
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">Schedule Live Session</h3><p className="text-xs text-slate-500 mt-0.5">Set up a virtual class session.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Session Title</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Algebra" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label><input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Mathematics" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Class</label><input required value={className} onChange={e => setClassName(e.target.value)} placeholder="JSS 2" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Host Teacher</label><input required value={host} onChange={e => setHost(e.target.value)} placeholder="Mr. Appiah" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Date</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-semibold text-white transition-colors">Schedule</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isProModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => setIsProModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600"><Lock size={28} /></div>
                            <h4 className="text-lg font-bold text-slate-900">Upgrade to Pro</h4>
                            <p className="text-sm text-slate-500 mt-2">Live Classes is a Pro feature. Upgrade your plan to host and join virtual sessions, record classes, and more.</p>
                            <div className="flex flex-col gap-2 mt-6">
                                <button className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-bold text-white transition-colors">Upgrade Now</button>
                                <button onClick={() => setIsProModal(false)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">Maybe later</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
