"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, Megaphone } from "lucide-react";

type Notice = { id: string; title: string; date: string; content: string; audience: string; };

const INITIAL: Notice[] = [
    { id: "1", title: "Mid-Term Examination", date: "2026-03-15", content: "The mid-term exams will commence on March 15th. All students are expected to be fully prepared.", audience: "All Students" },
    { id: "2", title: "School Holiday - Independence Day", date: "2026-03-06", content: "There will be no school on March 6th in observance of Independence Day.", audience: "All" },
    { id: "3", title: "New Timetable Update", date: "2026-03-02", content: "The updated timetable for the second term is now available. Please collect from the administrative office.", audience: "JSS Students" },
];

export default function NoticeBoardPage() {
    const [notices, setNotices] = React.useState<Notice[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [title, setTitle] = React.useState(""); const [content, setContent] = React.useState(""); const [audience, setAudience] = React.useState("All"); const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [viewNotice, setViewNotice] = React.useState<Notice | null>(null);

    const close = () => { setIsModalOpen(false); setTitle(""); setContent(""); setAudience("All"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setNotices(prev => [{ id: Date.now().toString(), title, content, audience, date }, ...prev]);
        close();
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div><h2 className="text-2xl font-bold text-slate-900">Notice Board</h2><p className="text-slate-500 text-sm mt-1">Post and view school announcements and notices.</p></div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"><Plus size={15} /> Post Notice</button>
                </div>

                <div className="space-y-4">
                    {notices.map((notice, i) => (
                        <motion.div key={notice.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewNotice(notice)}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5"><Megaphone size={16} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{notice.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.content}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] text-slate-400">{notice.date}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">{notice.audience}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Post Notice Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={close}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                                <div><h3 className="text-base font-bold text-slate-900">Post Notice</h3><p className="text-xs text-slate-500 mt-0.5">Publish a new announcement.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Notice title" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Audience</label><select value={audience} onChange={e => setAudience(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option>All</option><option>All Students</option><option>JSS Students</option><option>SS Students</option><option>Staff</option></select></div>
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Content</label><textarea required value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Write the notice content here…" className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" /></div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Post</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Notice Modal */}
            <AnimatePresence>
                {viewNotice && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => setViewNotice(null)}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-amber-50/70">
                                <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><Megaphone size={16} /></div><div><h3 className="text-base font-bold text-slate-900">{viewNotice.title}</h3><p className="text-xs text-slate-500">{viewNotice.date} &bull; {viewNotice.audience}</p></div></div>
                                <button onClick={() => setViewNotice(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-700 leading-relaxed">{viewNotice.content}</p>
                                <div className="flex justify-end mt-6">
                                    <button onClick={() => setViewNotice(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
