"use client";

import React from "react";
<<<<<<< HEAD
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import { Plus, X, BookOpenText, FileX2, Pencil, Trash2 } from "lucide-react";

type Subject = { id: string; name: string; code: string; category: string; };

const INITIAL: Subject[] = [
    { id: "1", name: "Mathematics", code: "MAT-01", category: "Core" },
    { id: "2", name: "Science", code: "SCI-01", category: "Core" },
    { id: "3", name: "English Language", code: "ENG-01", category: "Core" },
    { id: "4", name: "Social Studies", code: "SOC-01", category: "Core" },
    { id: "5", name: "French", code: "FRN-01", category: "Elective" },
    { id: "6", name: "Physical Education", code: "PHY-01", category: "Co-curricular" },
];

const CATEGORIES = ["Core", "Elective", "Co-curricular"];

export default function SubjectsPage() {
    const [subjects, setSubjects] = React.useState<Subject[]>(INITIAL);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Subject | null>(null);
    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");
    const [category, setCategory] = React.useState("Core");
    const [deleteTarget, setDeleteTarget] = React.useState<Subject | null>(null);
    const [filter, setFilter] = React.useState("All");

    const openAdd = () => { setEditing(null); setName(""); setCode(""); setCategory("Core"); setIsModalOpen(true); };
    const openEdit = (s: Subject) => { setEditing(s); setName(s.name); setCode(s.code); setCategory(s.category); setIsModalOpen(true); };
    const close = () => { setIsModalOpen(false); setEditing(null); };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !code.trim()) return;
        if (editing) {
            setSubjects(prev => prev.map(s => s.id === editing.id ? { ...s, name, code, category } : s));
        } else {
            setSubjects(prev => [{ id: Date.now().toString(), name, code, category }, ...prev]);
        }
        close();
    };

    const filtered = filter === "All" ? subjects : subjects.filter(s => s.category === filter);

    const categoryColors: Record<string, string> = {
        Core: "bg-emerald-100 text-emerald-700",
        Elective: "bg-blue-100 text-blue-700",
        "Co-curricular": "bg-violet-100 text-violet-700",
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Subjects</h2>
                        <p className="text-slate-500 text-sm mt-1">Configure and manage subjects offered in the school.</p>
                    </div>
                    <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                        <Plus size={15} /> Add Subject
                    </button>
                </div>

                {/* Category filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {["All", ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === cat ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                            {cat} {cat === "All" ? `(${subjects.length})` : `(${subjects.filter(s => s.category === cat).length})`}
                        </button>
                    ))}
                </div>

                {/* Grid cards */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 text-center">
                        <FileX2 size={28} className="text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No subjects found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(s => (
                            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <BookOpenText size={18} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"><Pencil size={13} /></button>
                                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><Trash2 size={13} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 mt-3 text-sm">{s.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{s.code}</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${categoryColors[s.category] ?? "bg-slate-100 text-slate-600"}`}>{s.category}</span>
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
                                <div><h3 className="text-base font-bold text-slate-900">{editing ? "Edit Subject" : "Add New Subject"}</h3><p className="text-xs text-slate-500 mt-0.5">Fill in the subject details.</p></div>
                                <button onClick={close} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Name</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Biology" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Code</label>
                                    <input required value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. BIO-01" className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={close} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">{editing ? "Update" : "Add Subject"}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Trash2 size={20} /></div>
                            <h4 className="text-base font-bold text-slate-900">Delete Subject?</h4>
                            <p className="text-sm text-slate-500 mt-1">Remove <span className="font-semibold text-slate-700">{deleteTarget.name}</span> permanently?</p>
                            <div className="flex justify-center gap-3 mt-5">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={() => { setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id)); setDeleteTarget(null); }} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
=======
import { motion } from "framer-motion";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type SubjectRow = {
  id: string;
  name: string;
  code: string;
  category: string;
};

type SubjectApi = {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  category?: string;
};

const toSubjectRow = (item: SubjectApi): SubjectRow => ({
  id: item.id,
  name: item.name ?? item.title ?? "Unnamed Subject",
  code: item.code ?? "-",
  category: item.category ?? "General",
});

export default function SubjectsPage() {
  const { error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [rows, setRows] = React.useState<SubjectRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const payload = await apiRequest<SubjectApi[]>(API_ENDPOINTS.subjects);
      setRows(payload.map(toSubjectRow));
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load subjects.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subjects Directory</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  paginatedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.code}</td>
                      <td className="px-4 py-3">{row.category}</td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">
                      No subject records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              totalItems={rows.length}
              currentPage={safeCurrentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
>>>>>>> 01a8e06688c9533ae81b8f4fae260ea3e001c00f
}
