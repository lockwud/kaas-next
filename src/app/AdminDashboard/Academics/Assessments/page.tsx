"use client";

import React from "react";
import { 
  Pencil, Printer, Plus, X, Search, ClipboardList, 
  FileX2, CheckCircle2, Eye, BookOpenText, Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { assessments as seededAssessments } from "../../../../lib/school-data";
import { useToast } from "@/hooks/useToast";

const ASSESSMENT_RECORDS_STORAGE_KEY = "kaas_assessment_records";

type Term = "first_term" | "second_term" | "third_term";
const EXAM_INPUT_MAX = 100;
const EXAM_WEIGHT_MAX = 60;

interface AssessmentEntryRow {
  studentId: string;
  studentName: string;
  classExercise: number;
  homeworkProject: number;
  exam: number;
  total: number;
}

interface AssessmentRecord {
  id: string;
  classId: string;
  className?: string;
  section?: string;
  subject: string;
  term: Term;
  academicYear: string;
  printedAt?: string;
  rows: AssessmentEntryRow[];
  savedAt: string;
}

const normalizeStoredRecord = (
  record: Partial<AssessmentRecord> & { id: string; subject: string; savedAt: string },
): AssessmentRecord => {
  const inferredAcademicYear = toAcademicYearFromDate(record.savedAt);
  const inferredTerm = getCurrentTerm(new Date(record.savedAt));

  return {
    id: record.id,
    classId: record.classId ?? "",
    className: record.className,
    section: record.section,
    subject: record.subject,
    term: record.term ?? inferredTerm,
    academicYear: record.academicYear ?? inferredAcademicYear,
    printedAt: record.printedAt,
    rows: Array.isArray(record.rows) ? record.rows : [],
    savedAt: record.savedAt,
  };
};

const normalize = (value: string) => value.trim().toLowerCase();

const classLabel = (record: AssessmentRecord) => 
  `${record.className ?? "-"} ${record.section ?? ""}`.trim();

const getCurrentAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 7 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
};

const getCurrentTerm = (date = new Date()): Term => {
  const month = date.getMonth();
  if (month >= 8) return "first_term";
  if (month <= 3) return "second_term";
  return "third_term";
};

const toAcademicYearFromDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return getCurrentAcademicYear();
  }
  return getCurrentAcademicYear(date);
};

const formatTerm = (term: Term) =>
  term === "first_term" ? "First Term" : term === "second_term" ? "Second Term" : "Third Term";

const canEditRecord = (record: AssessmentRecord, currentAcademicYear: string, currentTerm: Term) =>
  !record.printedAt || (record.academicYear === currentAcademicYear && record.term === currentTerm);

const toWeightedTotal = (classExercise: number, homeworkProject: number, exam: number) =>
  classExercise + homeworkProject + (exam * EXAM_WEIGHT_MAX) / EXAM_INPUT_MAX;

const TERMS_LIST = ["First Term", "Second Term", "Third Term"];

export default function AssessmentsPage() {
  const { success, info } = useToast();
  const [records, setRecords] = React.useState<AssessmentRecord[]>([]);
  const [classFilter, setClassFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState("");
  const [selectedRecord, setSelectedRecord] = React.useState<AssessmentRecord | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<any | null>(null);

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

    const newRecord: AssessmentRecord = {
      id: `a_${Date.now()}`,
      classId: "",
      className: fClass.trim(),
      subject: fSubject.trim(),
      term: fTerm.toLowerCase().replace(" ", "_") as Term,
      academicYear: getCurrentAcademicYear(new Date(fDate)),
      rows: [],
      savedAt: new Date(fDate).toISOString(),
    };

    const next = [newRecord, ...records];
    setRecords(next);
    window.localStorage.setItem(ASSESSMENT_RECORDS_STORAGE_KEY, JSON.stringify(next));
    closeModal();
    success("New assessment record created.");
  };

  const currentAcademicYear = React.useMemo(() => getCurrentAcademicYear(), []);
  const currentTerm = React.useMemo(() => getCurrentTerm(), []);

  React.useEffect(() => {
    let fromStorage: AssessmentRecord[] = [];
    try {
      const raw = JSON.parse(window.localStorage.getItem(ASSESSMENT_RECORDS_STORAGE_KEY) ?? "[]");
      fromStorage = raw.map((item: any) => normalizeStoredRecord(item));
    } catch { fromStorage = []; }

    const seeded: AssessmentRecord[] = seededAssessments.map((assessment) => ({
      id: assessment.id,
      classId: `${assessment.className}_${assessment.term}`,
      className: assessment.className,
      section: "",
      subject: assessment.subject,
      term: assessment.term,
      academicYear: toAcademicYearFromDate(assessment.assessmentDate),
      printedAt: undefined,
      rows: [],
      savedAt: new Date(assessment.assessmentDate).toISOString(),
    }));

    const byId = new Map<string, AssessmentRecord>();
    [...fromStorage, ...seeded].forEach((r) => { if (!byId.has(r.id)) byId.set(r.id, r); });
    const merged = Array.from(byId.values()).sort((a, b) =>
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    setRecords(merged);
  }, []);

  const persistRecords = (next: AssessmentRecord[]) => {
    setRecords(next);
    window.localStorage.setItem(ASSESSMENT_RECORDS_STORAGE_KEY, JSON.stringify(next));
  };

  const classOptions = React.useMemo(() => {
    const labels = Array.from(new Set(records.map((r) => classLabel(r)).filter(Boolean))).sort();
    return labels.map((l) => ({ value: l, label: l }));
  }, [records]);

  const subjectOptions = React.useMemo(() => {
    const subjs = Array.from(new Set(records.map((r) => r.subject))).sort();
    return subjs.map((s) => ({ value: s, label: s }));
  }, [records]);

  const yearOptions = React.useMemo(() => {
    const years = Array.from(new Set(records.map((r) => r.academicYear))).sort().reverse();
    return years.map((y) => ({ value: y, label: y }));
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      const classMatch = !classFilter || classLabel(r) === classFilter;
      const subjectMatch = !subjectFilter || normalize(r.subject) === normalize(subjectFilter);
      const yearMatch = !yearFilter || r.academicYear === yearFilter;
      return classMatch && subjectMatch && yearMatch;
    });
  }, [records, classFilter, subjectFilter, yearFilter]);

  const togglePrinted = (id: string) => {
    const next = records.map((r) => (r.id === id ? { ...r, printedAt: r.printedAt ? undefined : new Date().toISOString() } : r));
    persistRecords(next);
    success("Print status updated.");
  };

  const saveEditedRecord = () => {
    if (!selectedRecord) return;
    if (!canEditRecord(selectedRecord, currentAcademicYear, currentTerm)) {
      info("This assessment cannot be edited now.");
      return;
    }
    const next = records.map((r) => (r.id === selectedRecord.id ? selectedRecord : r));
    persistRecords(next);
    setSelectedRecord(null);
    success("Assessment updated.");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
              <p className="mt-1 text-sm text-slate-500">View and manage assessments by class, subject, and academic year.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"
            >
              <Plus size={15} /> Create Assessment
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Select label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} options={classOptions} />
            <Select label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} options={subjectOptions} />
            <Select label="Academic Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} options={yearOptions} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-900 uppercase text-[11px] font-bold text-white tracking-wider">
                <tr>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Term</th>
                  <th className="px-6 py-4">Rows</th>
                  <th className="px-6 py-4">Printed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => {
                    const editable = canEditRecord(r, currentAcademicYear, currentTerm);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{classLabel(r) || "-"}</td>
                        <td className="px-6 py-4 text-slate-600">{r.subject}</td>
                        <td className="px-6 py-4 text-slate-600">{r.academicYear}</td>
                        <td className="px-6 py-4 text-slate-600">{formatTerm(r.term)}</td>
                        <td className="px-6 py-4 text-slate-600">{r.rows.length}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.printedAt ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {r.printedAt ? "Printed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setViewItem({ ...r, termLabel: formatTerm(r.term) })}>
                              <Eye size={13} className="mr-1" /> View
                            </Button>
                            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setSelectedRecord({ ...r })} disabled={!editable}>
                              <Pencil size={13} className="mr-1" /> Edit
                            </Button>
                            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => togglePrinted(r.id)}>
                              <Printer size={13} className="mr-1" /> {r.printedAt ? "Unmark" : "Mark"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No records match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 12 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900">New Assessment</h3>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Class</label>
                    <Input required value={fClass} onChange={e => setFClass(e.target.value)} placeholder="Class Name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Subject</label>
                    <Input required value={fSubject} onChange={e => setFSubject(e.target.value)} placeholder="Subject" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Term</label>
                  <select value={fTerm} onChange={e => setFTerm(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {TERMS_LIST.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal} className="w-full">Cancel</Button>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Create</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 12 }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                <h3 className="text-lg font-bold">{viewItem.subject}</h3>
                <p className="text-xs text-slate-400">{classLabel(viewItem)} · {viewItem.termLabel}</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ["Class", classLabel(viewItem)],
                  ["Subject", viewItem.subject],
                  ["Year", viewItem.academicYear],
                  ["Term", viewItem.termLabel],
                  ["Status", viewItem.printedAt ? "Printed" : "Pending"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between border-b border-slate-50 pb-2 text-sm">
                    <span className="text-slate-400 font-medium">{l}</span>
                    <span className="text-slate-900 font-semibold">{v}</span>
                  </div>
                ))}
                <Button onClick={() => setViewItem(null)} className="mt-4 w-full">Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div>
                <h3 className="font-bold">Entry Editor</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{selectedRecord.subject} · {selectedRecord.academicYear}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Class (20)</th>
                      <th className="px-4 py-3">HW (20)</th>
                      <th className="px-4 py-3">Exam (100)</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedRecord.rows.map((row) => (
                      <tr key={row.studentId}>
                        <td className="px-4 py-3 font-medium text-slate-900">{row.studentName}</td>
                        <td className="px-4 py-3">
                          <MiniScore value={row.classExercise} max={20} onChange={(v) => {
                            const nextRows = selectedRecord.rows.map(r => r.studentId === row.studentId ? { ...r, classExercise: v, total: toWeightedTotal(v, r.homeworkProject, r.exam) } : r);
                            setSelectedRecord({ ...selectedRecord, rows: nextRows });
                          }} />
                        </td>
                        <td className="px-4 py-3">
                          <MiniScore value={row.homeworkProject} max={20} onChange={(v) => {
                            const nextRows = selectedRecord.rows.map(r => r.studentId === row.studentId ? { ...r, homeworkProject: v, total: toWeightedTotal(r.classExercise, v, r.exam) } : r);
                            setSelectedRecord({ ...selectedRecord, rows: nextRows });
                          }} />
                        </td>
                        <td className="px-4 py-3">
                          <MiniScore value={row.exam} max={100} onChange={(v) => {
                            const nextRows = selectedRecord.rows.map(r => r.studentId === row.studentId ? { ...r, exam: v, total: toWeightedTotal(r.classExercise, r.homeworkProject, v) } : r);
                            setSelectedRecord({ ...selectedRecord, rows: nextRows });
                          }} />
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-600">{row.total.toFixed(1)}</td>
                      </tr>
                    ))}
                    {selectedRecord.rows.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400 italic">No student rows.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-50 pt-6">
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>Discard</Button>
                <Button onClick={saveEditedRecord} className="bg-blue-600 hover:bg-blue-700">Save Entries</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MiniScore({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex w-[110px] items-center overflow-hidden rounded-lg border border-slate-200">
      <input
        type="number" min={0} max={max} step="0.5" value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value) || 0;
          onChange(Math.min(max, Math.max(0, v)));
        }}
        className="w-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
      />
      <span className="bg-slate-50 px-2 py-1.5 text-[10px] font-black text-slate-400">/{max}</span>
    </div>
  );
}
