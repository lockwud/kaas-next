"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { assessments } from "../../../../lib/school-data";
import { BackButton } from "../../../../components/ui/BackButton";
import {
  Plus, X, Search, ClipboardList, FileX2,
  CheckCircle2, Eye, BookOpenText, Calendar
} from "lucide-react";

type Assessment = {
  id: string;
  className: string;
  subject: string;
  term: string;
  maxScore: number;
  assessmentDate: string;
};

type NewAssessment = Omit<Assessment, "id">;

const TERMS = ["First Term", "Second Term", "Third Term"];

function gradeLabel(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return { label: "A", cls: "bg-emerald-100 text-emerald-700" };
  if (pct >= 65) return { label: "B", cls: "bg-blue-100 text-blue-700" };
  if (pct >= 50) return { label: "C", cls: "bg-amber-100 text-amber-700" };
  if (pct >= 40) return { label: "D", cls: "bg-orange-100 text-orange-700" };
  return { label: "F", cls: "bg-rose-100 text-rose-700" };
}

export default function AssessmentsPage() {
  const [rows, setRows] = React.useState<Assessment[]>(() =>
    assessments.map((a) => ({
      id: a.id,
      className: a.className,
      subject: a.subject,
      term: a.term.replace("_", " "),
      maxScore: a.maxScore,
      assessmentDate: a.assessmentDate,
    }))
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<Assessment | null>(null);
  const [search, setSearch] = React.useState("");
  const [filterTerm, setFilterTerm] = React.useState("All");

  // Form state
  const [fClass, setFClass] = React.useState("");
  const [fSubject, setFSubject] = React.useState("");
  const [fTerm, setFTerm] = React.useState("First Term");
  const [fMaxScore, setFMaxScore] = React.useState("100");
  const [fDate, setFDate] = React.useState(new Date().toISOString().slice(0, 10));

  const closeModal = () => {
    setIsModalOpen(false);
    setFClass(""); setFSubject(""); setFTerm("First Term"); setFMaxScore("100");
    setFDate(new Date().toISOString().slice(0, 10));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fClass.trim() || !fSubject.trim()) return;
    const newA: Assessment = {
      id: `a_${Date.now()}`,
      className: fClass.trim(),
      subject: fSubject.trim(),
      term: fTerm,
      maxScore: Number(fMaxScore),
      assessmentDate: fDate,
    };
    setRows(prev => [newA, ...prev]);
    closeModal();
  };

  const allTerms = Array.from(new Set(rows.map(r => r.term)));
  const filtered = rows.filter(r => {
    const matchSearch =
      r.className.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase());
    const matchTerm = filterTerm === "All" || r.term === filterTerm;
    return matchSearch && matchTerm;
  });

  const uniqueClasses = Array.from(new Set(rows.map(r => r.className))).length;
  const uniqueSubjects = Array.from(new Set(rows.map(r => r.subject))).length;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assessment Builder</h2>
            <p className="text-slate-500 text-sm mt-1">Create and track assessments for terminal report generation.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            <Plus size={15} /> Create Assessment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Assessments", value: rows.length, color: "bg-blue-50 text-blue-700", icon: <ClipboardList size={18} /> },
            { label: "Classes Covered", value: uniqueClasses, color: "bg-emerald-50 text-emerald-700", icon: <CheckCircle2 size={18} /> },
            { label: "Subjects", value: uniqueSubjects, color: "bg-violet-50 text-violet-700", icon: <BookOpenText size={18} /> },
            { label: "Showing", value: filtered.length, color: "bg-amber-50 text-amber-700", icon: <ClipboardList size={18} /> },
          ].map(st => (
            <div key={st.label} className={`${st.color} rounded-xl p-4 flex items-center gap-3`}>
              <span className="opacity-60 shrink-0">{st.icon}</span>
              <div>
                <p className="text-2xl font-black">{st.value}</p>
                <p className="text-xs font-medium opacity-70 mt-0.5">{st.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by class or subject…"
              className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {["All", ...allTerms].map(t => (
            <button
              key={t}
              onClick={() => setFilterTerm(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterTerm === t ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Max Score</th>
                  <th className="px-4 py-3">Grade Band</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-52 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                        <FileX2 size={28} />
                        <p className="text-sm font-semibold text-slate-600">No assessments found</p>
                        <p className="text-xs text-slate-400">
                          {search || filterTerm !== "All" ? "Try adjusting your filters" : "Create your first assessment above"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((row, i) => {
                  const grade = gradeLabel(row.maxScore * 0.75, row.maxScore); // illustrative average
                  return (
                    <tr key={row.id} className={`border-t border-slate-100 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.className}</td>
                      <td className="px-4 py-3 text-slate-700">{row.subject}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{row.term}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{row.maxScore}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${grade.cls}`}>{grade.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs flex items-center gap-1">
                        <Calendar size={11} /> {row.assessmentDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewItem(row)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Create Assessment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Assessment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define a new assessment for report generation.</p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                    <input
                      required value={fClass} onChange={e => setFClass(e.target.value)}
                      placeholder="e.g. JSS 2"
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                    <input
                      required value={fSubject} onChange={e => setFSubject(e.target.value)}
                      placeholder="Mathematics"
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Term</label>
                  <select
                    value={fTerm} onChange={e => setFTerm(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Max Score</label>
                    <input
                      type="number" required min={1} max={300}
                      value={fMaxScore} onChange={e => setFMaxScore(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Assessment Date</label>
                    <input
                      type="date" required value={fDate} onChange={e => setFDate(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ClipboardList size={20} />
                  </div>
                  <button onClick={() => setViewItem(null)} className="p-1.5 rounded-full text-white/70 hover:bg-white/20 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-black mt-3">{viewItem.subject}</h3>
                <p className="text-blue-200 text-xs mt-0.5">{viewItem.className} · {viewItem.term}</p>
              </div>

              <div className="p-6 space-y-3 text-sm">
                {[
                  ["Class", viewItem.className],
                  ["Subject", viewItem.subject],
                  ["Term", viewItem.term],
                  ["Max Score", String(viewItem.maxScore)],
                  ["Assessment Date", viewItem.assessmentDate],
                  ["Assessment ID", viewItem.id],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-slate-500 text-xs font-semibold">{label}</span>
                    <span className="font-semibold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
