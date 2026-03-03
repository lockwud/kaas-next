"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, Clock, FileX2 } from "lucide-react";

type TimetableEntry = {
    id: string;
    className: string;
    day: string;
    period: string;
    subject: string;
    teacher: string;
    startTime: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["1st Period", "2nd Period", "3rd Period", "4th Period", "5th Period", "6th Period"];

const INITIAL: TimetableEntry[] = [
    { id: "1", className: "JSS 2A", day: "Monday", period: "1st Period", subject: "Mathematics", teacher: "Mr. Appiah", startTime: "07:30" },
    { id: "2", className: "JSS 2A", day: "Monday", period: "2nd Period", subject: "Science", teacher: "Mrs. Amankwah", startTime: "08:30" },
    { id: "3", className: "JSS 2A", day: "Tuesday", period: "1st Period", subject: "English", teacher: "Mr. Yeboah", startTime: "07:30" },
    { id: "4", className: "SS 1B", day: "Wednesday", period: "3rd Period", subject: "Biology", teacher: "Mrs. Osei", startTime: "09:30" },
];

export default function TimeTablePage() {
    const [entries, setEntries] = React.useState<TimetableEntry[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [className, setClassName] = React.useState("");
    const [day, setDay] = React.useState("Monday");
    const [period, setPeriod] = React.useState("1st Period");
    const [subject, setSubject] = React.useState("");
    const [teacher, setTeacher] = React.useState("");
    const [startTime, setStartTime] = React.useState("07:30");
    const [filterDay, setFilterDay] = React.useState("All");
    const [filterClass, setFilterClass] = React.useState("All");

    const close = () => { setIsModalOpen(false); setClassName(""); setSubject(""); setTeacher(""); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!className.trim() || !subject.trim() || !teacher.trim()) return;
        setEntries(prev => [{ id: Date.now().toString(), className, day, period, subject, teacher, startTime }, ...prev]);
        close();
    };

    const allClasses = Array.from(new Set(entries.map(e => e.className)));
    const filtered = entries.filter(e => {
        const matchDay = filterDay === "All" || e.day === filterDay;
        const matchClass = filterClass === "All" || e.className === filterClass;
        return matchDay && matchClass;
    });

    // Group by day
    const groupedByDay = DAYS.reduce<Record<string, TimetableEntry[]>>((acc, d) => {
        acc[d] = filtered.filter(e => e.day === d);
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Academic Timetable</h2>
                        <p className="text-slate-500 text-sm mt-1">View and manage schedules for all classes.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> Add Entry
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Day</label>
                        <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="All">All Days</option>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</label>
                        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="All">All Classes</option>
                            {allClasses.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <Clock size={14} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-700">{filtered.length} Entries</span>
                    </div>
                </div>

                {/* Calendar-style view */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 text-center">
                        <FileX2 size={28} className="text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No timetable entries found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {DAYS.filter(d => filterDay === "All" || d === filterDay).map(d => {
                            const dayEntries = groupedByDay[d];
                            if (!dayEntries || dayEntries.length === 0) return null;
                            return (
                                <div key={d} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="bg-[#0F172A] px-4 py-2.5 flex items-center gap-2">
                                        <Clock size={13} className="text-emerald-400" />
                                        <h3 className="text-sm font-bold text-white">{d}</h3>
                                        <span className="ml-auto text-[10px] text-slate-400 font-medium">{dayEntries.length} period{dayEntries.length !== 1 ? "s" : ""}</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {dayEntries.sort((a, b) => a.period.localeCompare(b.period)).map(entry => (
                                            <div key={entry.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/60 text-sm">
                                                <div className="w-20 shrink-0">
                                                    <p className="text-xs font-semibold text-emerald-600">{entry.startTime}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.period}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-800">{entry.subject}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{entry.teacher}</p>
                                                </div>
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{entry.className}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">Add Timetable Entry</h3><p className="text-xs text-slate-500 mt-0.5">Schedule a subject for a class.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                                        <input required value={className} onChange={e => setClassName(e.target.value)} placeholder="JSS 2A" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Day</label>
                                        <select value={day} onChange={e => setDay(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            {DAYS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
                                        <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            {PERIODS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                                    <input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Mathematics" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Teacher</label>
                                    <input required value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="Mr. Appiah" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Add Entry</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
