"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, Calendar, MapPin, Clock } from "lucide-react";

type Event = { id: string; title: string; date: string; location: string; description: string; category: string; };

const CATEGORY_COLORS: Record<string, string> = {
    Academic: "bg-blue-100 text-blue-700",
    Sports: "bg-emerald-100 text-emerald-700",
    Cultural: "bg-violet-100 text-violet-700",
    Social: "bg-amber-100 text-amber-700",
};

const INITIAL: Event[] = [
    { id: "1", title: "Sports Day", date: "2026-03-20", location: "Main Field", description: "Annual inter-house sports competition.", category: "Sports" },
    { id: "2", title: "Science Fair", date: "2026-03-28", location: "School Hall", description: "Showcasing student science projects.", category: "Academic" },
    { id: "3", title: "Cultural Day", date: "2026-04-05", location: "Assembly Ground", description: "Celebration of cultural diversity.", category: "Cultural" },
];

export default function EventsPage() {
    const [events, setEvents] = React.useState<Event[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewEvent, setViewEvent] = React.useState<Event | null>(null);
    const [title, setTitle] = React.useState("");
    const [date, setDate] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [category, setCategory] = React.useState("Academic");

    const close = () => { setIsModalOpen(false); setTitle(""); setDate(""); setLocation(""); setDescription(""); setCategory("Academic"); };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date || !location.trim()) return;
        setEvents(prev => [{ id: Date.now().toString(), title, date, location, description, category }, ...prev]);
        close();
    };

    const upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = events.filter(e => new Date(e.date) < new Date());

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">School Events</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage and view upcoming school activities and events.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> Add Event
                    </button>
                </div>

                {upcoming.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Calendar size={14} className="text-emerald-600" /> Upcoming Events ({upcoming.length})</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcoming.map(ev => (
                                <div key={ev.id} onClick={() => setViewEvent(ev)} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-700 shrink-0">
                                            <span className="text-lg font-black leading-none">{new Date(ev.date).getDate()}</span>
                                            <span className="text-[9px] font-semibold uppercase">{new Date(ev.date).toLocaleString("default", { month: "short" })}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[ev.category] ?? "bg-slate-100 text-slate-600"}`}>{ev.category}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mt-3">{ev.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin size={11} /> {ev.location}</span>
                                        <span className="flex items-center gap-1"><Clock size={11} /> {ev.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {past.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-3">Past Events</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                            {past.map(ev => (
                                <div key={ev.id} className="bg-white rounded-xl border border-slate-200 p-5">
                                    <h3 className="font-bold text-slate-900">{ev.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{ev.date} &bull; {ev.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">Add Event</h3><p className="text-xs text-slate-500 mt-0.5">Schedule a new school event.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Event Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Parent-Teacher Meeting" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                            <option>Academic</option><option>Sports</option><option>Cultural</option><option>Social</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                                    <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Main Hall" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief event description…" className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Add Event</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => setViewEvent(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-emerald-600" />
                                    <div><h3 className="text-base font-bold text-slate-900">{viewEvent.title}</h3><p className="text-xs text-slate-500">{viewEvent.date}</p></div>
                                </div>
                                <button onClick={() => setViewEvent(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[viewEvent.category]}`}>{viewEvent.category}</span>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-xs text-slate-500">Date</p><p className="font-semibold text-slate-800 mt-0.5">{viewEvent.date}</p></div>
                                    <div><p className="text-xs text-slate-500">Location</p><p className="font-semibold text-slate-800 mt-0.5">{viewEvent.location}</p></div>
                                </div>
                                <div><p className="text-xs text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700 leading-relaxed">{viewEvent.description || "No description provided."}</p></div>
                                <div className="flex justify-end"><button onClick={() => setViewEvent(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
