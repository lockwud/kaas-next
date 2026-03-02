"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pencil, Printer } from "lucide-react";
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

const classLabel = (record: AssessmentRecord) => `${record.className ?? "-"} ${record.section ?? ""}`.trim();

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

export default function AssessmentsPage() {
  const { success, info } = useToast();
  const [records, setRecords] = React.useState<AssessmentRecord[]>([]);
  const [classFilter, setClassFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState("");
  const [selectedRecord, setSelectedRecord] = React.useState<AssessmentRecord | null>(null);

  const currentAcademicYear = React.useMemo(() => getCurrentAcademicYear(), []);
  const currentTerm = React.useMemo(() => getCurrentTerm(), []);

  React.useEffect(() => {
    let fromStorage: AssessmentRecord[] = [];

    try {
      const raw = JSON.parse(window.localStorage.getItem(ASSESSMENT_RECORDS_STORAGE_KEY) ?? "[]") as Array<
        Partial<AssessmentRecord> & { id: string; subject: string; savedAt: string }
      >;
      fromStorage = raw.map((item) => normalizeStoredRecord(item));
    } catch {
      fromStorage = [];
    }

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
    [...fromStorage, ...seeded].forEach((record) => {
      if (!byId.has(record.id)) {
        byId.set(record.id, record);
      }
    });

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
    const labels = Array.from(new Set(records.map((record) => classLabel(record)).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    return labels.map((label) => ({ value: label, label }));
  }, [records]);

  const subjectOptions = React.useMemo(() => {
    const subjects = Array.from(new Set(records.map((record) => record.subject))).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    return subjects.map((subject) => ({ value: subject, label: subject }));
  }, [records]);

  const yearOptions = React.useMemo(() => {
    const years = Array.from(new Set(records.map((record) => record.academicYear))).sort((a, b) =>
      b.localeCompare(a, undefined, { sensitivity: "base" }),
    );

    return years.map((year) => ({ value: year, label: year }));
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records.filter((record) => {
      const classMatch = !classFilter || classLabel(record) === classFilter;
      const subjectMatch = !subjectFilter || normalize(record.subject) === normalize(subjectFilter);
      const yearMatch = !yearFilter || record.academicYear === yearFilter;
      return classMatch && subjectMatch && yearMatch;
    });
  }, [records, classFilter, subjectFilter, yearFilter]);

  const togglePrinted = (recordId: string) => {
    const target = records.find((record) => record.id === recordId);
    if (!target) {
      return;
    }

    const next = records.map((record) =>
      record.id === recordId
        ? {
          ...record,
          printedAt: record.printedAt ? undefined : new Date().toISOString(),
        }
        : record,
    );

    persistRecords(next);
    success(target.printedAt ? "Assessment marked as not printed." : "Assessment marked as printed.");
  };

  const saveEditedRecord = () => {
    if (!selectedRecord) {
      return;
    }

    if (!canEditRecord(selectedRecord, currentAcademicYear, currentTerm)) {
      info("This assessment cannot be edited now.");
      return;
    }

    const next = records.map((record) => (record.id === selectedRecord.id ? selectedRecord : record));
    persistRecords(next);
    setSelectedRecord(null);
    success("Assessment updated.");
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
          <p className="mt-1 text-sm text-slate-500">View and manage assessments by class, subject, and academic year.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Select label="Class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} options={classOptions} />
            <Select label="Subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} options={subjectOptions} />
            <Select label="Academic Year" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} options={yearOptions} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Printed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const editable = canEditRecord(record, currentAcademicYear, currentTerm);

                    return (
                      <tr key={record.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-4 py-3 font-medium">{classLabel(record) || "-"}</td>
                        <td className="px-4 py-3">{record.subject}</td>
                        <td className="px-4 py-3">{record.academicYear}</td>
                        <td className="px-4 py-3">{formatTerm(record.term)}</td>
                        <td className="px-4 py-3">{record.rows.length}</td>
                        <td className="px-4 py-3">{record.printedAt ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => setSelectedRecord({ ...record })}
                              disabled={!editable}
                              title={editable ? "Edit assessment" : "Editing locked for this record"}
                            >
                              <Pencil size={13} className="mr-1" /> Edit
                            </Button>
                            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => togglePrinted(record.id)}>
                              <Printer size={13} className="mr-1" /> {record.printedAt ? "Unprint" : "Mark Printed"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No assessments found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0F172A] px-6 py-3">
              <div>
                <h3 className="text-base font-semibold text-white">Edit Assessment</h3>
                <p className="text-[11px] text-slate-200">Edit is allowed when not printed, or still in current year/term.</p>
              </div>
              <button type="button" onClick={() => setSelectedRecord(null)} className="rounded-full p-1 text-slate-200 hover:bg-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  label="Class"
                  value={selectedRecord.className ?? ""}
                  onChange={(event) => setSelectedRecord((current) => (current ? { ...current, className: event.target.value } : current))}
                />
                <Input
                  label="Section"
                  value={selectedRecord.section ?? ""}
                  onChange={(event) => setSelectedRecord((current) => (current ? { ...current, section: event.target.value } : current))}
                />
                <Input
                  label="Subject"
                  value={selectedRecord.subject}
                  onChange={(event) => setSelectedRecord((current) => (current ? { ...current, subject: event.target.value } : current))}
                />
                <Input
                  label="Academic Year"
                  value={selectedRecord.academicYear}
                  onChange={(event) => setSelectedRecord((current) => (current ? { ...current, academicYear: event.target.value } : current))}
                />
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr className="bg-[#0F172A] text-[10px] font-semibold uppercase tracking-wide text-white">
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Class Exercise</th>
                        <th className="px-3 py-2">Homework + Project</th>
                        <th className="px-3 py-2">Exam (/100)</th>
                        <th className="px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.rows.length > 0 ? (
                        selectedRecord.rows.map((row) => (
                          <tr key={row.studentId} className="border-t border-slate-100 text-xs text-slate-700">
                            <td className="px-3 py-2 font-medium">{row.studentName}</td>
                            <td className="px-3 py-2">
                              <MiniScore
                                value={row.classExercise}
                                max={20}
                                onChange={(value) =>
                                  setSelectedRecord((current) =>
                                            current
                                      ? {
                                        ...current,
                                        rows: current.rows.map((item) =>
                                          item.studentId === row.studentId
                                            ? { ...item, classExercise: value, total: toWeightedTotal(value, item.homeworkProject, item.exam) }
                                            : item,
                                        ),
                                      }
                                      : current,
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <MiniScore
                                value={row.homeworkProject}
                                max={20}
                                onChange={(value) =>
                                  setSelectedRecord((current) =>
                                            current
                                      ? {
                                        ...current,
                                        rows: current.rows.map((item) =>
                                          item.studentId === row.studentId
                                            ? { ...item, homeworkProject: value, total: toWeightedTotal(item.classExercise, value, item.exam) }
                                            : item,
                                        ),
                                      }
                                      : current,
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <MiniScore
                                value={row.exam}
                                max={100}
                                onChange={(value) =>
                                  setSelectedRecord((current) =>
                                    current
                                      ? {
                                        ...current,
                                        rows: current.rows.map((item) =>
                                          item.studentId === row.studentId
                                            ? { ...item, exam: value, total: toWeightedTotal(item.classExercise, item.homeworkProject, value) }
                                            : item,
                                        ),
                                      }
                                      : current,
                                  )
                                }
                              />
                              <p className="mt-1 text-[10px] text-slate-500">
                                = {((row.exam * EXAM_WEIGHT_MAX) / EXAM_INPUT_MAX).toFixed(1)} /60
                              </p>
                            </td>
                            <td className="px-3 py-2 font-semibold text-[#1D4ED8]">{row.total.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                            This record has no student rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <Button variant="outline" className="h-9 px-4 text-xs" onClick={() => setSelectedRecord(null)}>
                  Cancel
                </Button>
                <Button className="h-9 bg-[#1D4ED8] px-4 text-xs hover:bg-[#1E40AF]" onClick={saveEditedRecord}>
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MiniScore({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="flex w-[120px] items-center overflow-hidden rounded border border-slate-200 bg-white">
      <input
        type="number"
        min={0}
        max={max}
        step="0.1"
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) {
            onChange(0);
            return;
          }
          onChange(Math.max(0, Math.min(max, parsed)));
        }}
        className="h-8 w-full border-0 px-2 text-xs text-slate-800 focus:outline-none"
      />
      <span className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-[10px] text-slate-500">/{max}</span>
    </div>
  );
}
