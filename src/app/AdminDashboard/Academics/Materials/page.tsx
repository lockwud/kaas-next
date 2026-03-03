"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, BookOpen, FileX2, Download } from "lucide-react";

type Material = { id: string; title: string; subject: string; className: string; type: "PDF" | "Video" | "Image" | "Doc"; dateAdded: string; };

const TYPE_COLORS: Record<string, string> = {
    PDF: "bg-rose-100 text-rose-700", Video: "bg-violet-100 text-violet-700", Image: "bg-blue-100 text-blue-700", Doc: "bg-amber-100 text-amber-700",
};

const INITIAL: Material[] = [
    { id: "1", title: "Algebra Basics.pdf", subject: "Mathematics", className: "JSS 2", type: "PDF", dateAdded: "2026-02-20" },
    { id: "2", title: "Photosynthesis.mp4", subject: "Science", className: "JSS 1", type: "Video", dateAdded: "2026-02-21" },
    { id: "3", title: "Grammar Rules.docx", subject: "English", className: "SS 1", type: "Doc", dateAdded: "2026-02-22" },
    { id: "4", title: "World Map.png", subject: "Social Studies", className: "JSS 3", type: "Image", dateAdded: "2026-02-25" },
];

export default function MaterialsPage() {
    const [materials, setMaterials] = React.useState<Material[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [title, setTitle] = React.useState(""); const [subject, setSubject] = React.useState(""); const [className, setClassName] = React.useState(""); const [type, setType] = React.useState<Material["type"]>("PDF");
    const [filter, setFilter] = React.useState("All");

    const close = () => { setIsModalOpen(false); setTitle(""); setSubject(""); setClassName(""); setType("PDF"); };
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim() || !className.trim()) return;
        setMaterials(prev => [{ id: Date.now().toString(), title, subject, className, type, dateAdded: new Date().toISOString().slice(0, 10) }, ...prev]);
        close();
    };

    const filtered = filter === "All" ? materials : materials.filter(m => m.type === filter);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div><h2 className="text-2xl font-bold text-slate-900">Study Materials</h2><p className="text-slate-500 text-sm mt-1">Repository for educational resources and study aids.</p></div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"><Plus size={15} /> Upload Material</button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {["All", "PDF", "Video", "Image", "Doc"].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f}</button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 text-center"><FileX2 size={28} className="text-slate-300 mb-2" /><p className="text-sm font-semibold text-slate-600">No materials found</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(m => (
                            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"><BookOpen size={18} /></div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[m.type]}`}>{m.type}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mt-3 text-sm truncate" title={m.title}>{m.title}</h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">{m.subject}</span>
                                    <span>&bull;</span>
                                    <span>{m.className}</span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-[10px] text-slate-400">{m.dateAdded}</span>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                                        <Download size={12} /> Download
                                    </button>
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
                                <div><h3 className="text-base font-bold text-slate-900">Upload Material</h3><p className="text-xs text-slate-500 mt-0.5">Add a new study resource.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Material Title / Filename</label><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Algebra Chapter 3.pdf" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label><input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Mathematics" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                    <div><label className="block text-xs font-semibold text-slate-600 mb-1">Class</label><input required value={className} onChange={e => setClassName(e.target.value)} placeholder="JSS 2" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-600 mb-1">Type</label><select value={type} onChange={e => setType(e.target.value as Material["type"])} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option>PDF</option><option>Video</option><option>Image</option><option>Doc</option></select></div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Upload</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
