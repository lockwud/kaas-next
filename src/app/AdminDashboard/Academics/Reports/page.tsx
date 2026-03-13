"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Pagination } from "../../../../components/ui/Pagination";
import { Select } from "../../../../components/ui/Select";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, FileDown, Search } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type AssessmentStoredRecord = {
  id: string;
  classId?: string;
  className?: string;
  section?: string;
  subject: string;
  term: "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM";
  academicYear?: string | null;
  maxScore?: number;
  weights?: Record<string, number>;
  savedAt?: string;
  rows: Array<{
    studentId: string;
    studentName: string;
    classExercise: number;
    homeworkProject: number;
    exam: number;
    total: number;
  }>;
  createdAt?: string;
};

type ReportStatusMap = Record<string, { printedAt?: string }>;

type ReportSubjectRow = {
  subject: string;
  score?: number;
  grade: string;
  remark: string;
};

type ReportCard = {
  id: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  classId?: string;
  term: "first_term" | "second_term" | "third_term";
  academicYear: string;
  subjects: ReportSubjectRow[];
  overallScore: number;
  overallGrade: string;
  attendance: { present: number; total: number; percent: number };
  summary: string;
  behavior: string;
  discipline: string;
  ready: boolean;
  printedAt?: string;
};

const formatTerm = (term: "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM" | "first_term" | "second_term" | "third_term") =>
  term.replace("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const scoreToGrade = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

const scoreToRemark = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
};

const scoreToSummary = (score: number) => {
  if (score >= 85) return "Outstanding performance across all subjects.";
  if (score >= 75) return "Very strong performance with consistent results.";
  if (score >= 65) return "Good performance with room for improvement.";
  if (score >= 50) return "Fair performance; improvement is required.";
  if (score >= 40) return "Below average performance; needs support.";
  return "Poor performance; urgent support required.";
};

const scoreToBehavior = (score: number) => {
  if (score >= 85) return "Outstanding";
  if (score >= 75) return "Very Good";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
};

const scoreToDiscipline = (score: number) => {
  if (score >= 85) return "Exemplary";
  if (score >= 75) return "Very Good";
  if (score >= 65) return "Good";
  if (score >= 50) return "Satisfactory";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
};

const scoreToAttendance = (score: number) => {
  const total = 90;
  const present = Math.max(0, Math.min(total, Math.round((score / 100) * total)));
  const percent = Math.round((present / total) * 100);
  return { present, total, percent };
};

const buildReportKey = (studentId: string, className: string, term: string, academicYear: string) =>
  `${studentId}|${className}|${term}|${academicYear}`;

export default function ReportsPage() {
  const [assessmentRecords, setAssessmentRecords] = React.useState<AssessmentStoredRecord[]>([]);
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [termFilter, setTermFilter] = React.useState<"all" | "first_term" | "second_term" | "third_term">("all");
  const [studentSearch, setStudentSearch] = React.useState("");
  const [selectedReportIds, setSelectedReportIds] = React.useState<string[]>([]);
  const [activeReport, setActiveReport] = React.useState<ReportCard | null>(null);
  const [reportStatus, setReportStatus] = React.useState<ReportStatusMap>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentPage, setStudentPage] = React.useState(1);
  const [studentPageSize, setStudentPageSize] = React.useState(10);
  const [reportPage, setReportPage] = React.useState(1);
  const [reportPageSize, setReportPageSize] = React.useState(5);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [assessments, reports] = await Promise.all([
          apiRequest<AssessmentStoredRecord[]>(API_ENDPOINTS.assessments),
          apiRequest<Array<{ id: string; printedAt?: string | null }>>(API_ENDPOINTS.reports)
        ]);
        setAssessmentRecords(assessments);
        const statusMap = reports.reduce<ReportStatusMap>((acc, item) => {
          acc[item.id] = { printedAt: item.printedAt ?? undefined };
          return acc;
        }, {});
        setReportStatus(statusMap);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const classOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    assessmentRecords.forEach((record) => {
      const label = `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      if (!map.has(label)) {
        map.set(label, { id: label, label });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [assessmentRecords]);

  const filteredRecords = React.useMemo(() => {
    return assessmentRecords.filter((record) => {
      const recordClassKey = `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      if (classFilter !== "all" && recordClassKey !== classFilter) return false;
      if (termFilter !== "all" && record.term.toLowerCase() !== termFilter.toLowerCase()) return false;
      return true;
    });
  }, [assessmentRecords, classFilter, termFilter]);

  const reportCards = React.useMemo(() => {
    if (filteredRecords.length === 0) return [] as ReportCard[];

    const subjectMap = new Map<string, Set<string>>();
    filteredRecords.forEach((record) => {
      const key = `${record.className ?? "Class"}|${record.term}|${record.academicYear ?? ""}`;
      const set = subjectMap.get(key) ?? new Set<string>();
      set.add(record.subject);
      subjectMap.set(key, set);
    });

    const studentMap = new Map<
      string,
      {
        studentName: string;
        classLabel: string;
        subjectScores: Map<string, { score: number; savedAt: string }>;
        term: "first_term" | "second_term" | "third_term";
        academicYear: string;
        classId: string;
        studentId: string;
      }
    >();

    filteredRecords.forEach((record) => {
      const classLabel = `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      record.rows.forEach((row) => {
        const studentKey = `${row.studentId}|${record.term}|${record.academicYear ?? ""}`;
        if (!studentMap.has(studentKey)) {
          studentMap.set(studentKey, {
            studentId: row.studentId,
            studentName: row.studentName,
            classLabel,
            subjectScores: new Map(),
            term: record.term.toLowerCase() as "first_term" | "second_term" | "third_term",
            academicYear: record.academicYear ?? "",
            classId: record.classId ?? "",
          });
        }
        const entry = studentMap.get(studentKey);
        if (!entry) return;
        const existing = entry.subjectScores.get(record.subject);
        if (!existing || (record.savedAt && new Date(record.savedAt).getTime() >= new Date(existing.savedAt).getTime())) {
          entry.subjectScores.set(record.subject, { score: row.total, savedAt: record.savedAt ?? "" });
        }
      });
    });

    return Array.from(studentMap.entries()).map(([_, data]) => {
      const subjectKey = `${data.classLabel}|${data.term}|${data.academicYear}`;
      const requiredSubjects = Array.from(subjectMap.get(subjectKey) ?? []).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );

      const subjectRows: ReportSubjectRow[] = requiredSubjects.map((subject) => {
        const scoreEntry = data.subjectScores.get(subject);
        if (!scoreEntry) {
          return {
            subject,
            grade: "-",
            remark: "Pending",
          };
        }
        const score = scoreEntry.score;
        return {
          subject,
          score,
          grade: scoreToGrade(score),
          remark: scoreToRemark(score),
        };
      });

      const scores = subjectRows.filter((row) => typeof row.score === "number").map((row) => row.score as number);
      const overallScore = scores.length > 0 ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
      const overallGrade = scoreToGrade(overallScore);
      const attendance = scoreToAttendance(overallScore);
      const ready = requiredSubjects.length > 0 && requiredSubjects.every((subject) => data.subjectScores.has(subject));
      const reportKey = buildReportKey(data.studentId, data.classLabel, data.term, data.academicYear);
      const status = reportStatus[reportKey];

      return {
        id: reportKey,
        studentId: data.studentId,
        studentName: data.studentName,
        classLabel: data.classLabel,
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear,
        subjects: subjectRows,
        overallScore,
        overallGrade,
        attendance,
        summary: scoreToSummary(overallScore),
        behavior: scoreToBehavior(overallScore),
        discipline: scoreToDiscipline(overallScore),
        ready,
        printedAt: status?.printedAt,
      };
    });
  }, [filteredRecords, reportStatus]);

  const filteredStudents = React.useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return reportCards
      .filter((card) => (query ? card.studentName.toLowerCase().includes(query) : true))
      .map((card) => ({
        id: card.id,
        name: card.studentName,
        classLabel: card.classLabel,
        term: formatTerm(card.term),
      }));
  }, [reportCards, studentSearch]);

  React.useEffect(() => {
    setSelectedReportIds(filteredStudents.map((student) => student.id));
    setStudentPage(1);
    setReportPage(1);
  }, [filteredStudents]);

  React.useEffect(() => {
    setStudentPage(1);
    setReportPage(1);
  }, [classFilter, termFilter]);

  const displayedCards = reportCards.filter((card) => selectedReportIds.includes(card.id));

  const studentTotalPages = Math.max(1, Math.ceil(filteredStudents.length / studentPageSize));
  const safeStudentPage = Math.min(Math.max(1, studentPage), studentTotalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeStudentPage - 1) * studentPageSize,
    safeStudentPage * studentPageSize,
  );

  const reportTotalPages = Math.max(1, Math.ceil(displayedCards.length / reportPageSize));
  const safeReportPage = Math.min(Math.max(1, reportPage), reportTotalPages);
  const paginatedCards = displayedCards.slice(
    (safeReportPage - 1) * reportPageSize,
    safeReportPage * reportPageSize,
  );

  React.useEffect(() => {
    if (studentPage > studentTotalPages) {
      setStudentPage(studentTotalPages);
    }
  }, [studentPage, studentTotalPages]);

  React.useEffect(() => {
    if (reportPage > reportTotalPages) {
      setReportPage(reportTotalPages);
    }
  }, [reportPage, reportTotalPages]);

  const ensureReportGenerated = async (card: ReportCard) => {
    const classLabel = card.classLabel;
    const assessmentsForClass = assessmentRecords.filter((record) => {
      const recordClassKey = `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      return (
        recordClassKey === classLabel &&
        record.term.toLowerCase() === card.term &&
        (record.academicYear ?? "") === card.academicYear
      );
    });

    if (assessmentsForClass.length === 0) {
      return;
    }

    await apiRequest(`${API_ENDPOINTS.reports}/generate`, {
      method: "POST",
      body: JSON.stringify({
        className: classLabel,
        term: card.term,
        academicYear: card.academicYear,
        assessments: assessmentsForClass.map((record) => ({
          subject: record.subject,
          maxScore: record.maxScore ?? 100,
          rows: (record.rows ?? []).map((row) => ({
            studentId: row.studentId,
            total: row.total
          }))
        }))
      })
    });
  };

  const markPrinted = async (card: ReportCard) => {
    await ensureReportGenerated(card);
    const updated = { ...reportStatus, [card.id]: { printedAt: new Date().toISOString() } };
    setReportStatus(updated);
    await apiRequest(`${API_ENDPOINTS.reports}/${card.id}/print`, {
      method: "PATCH",
      body: JSON.stringify({ printed: true })
    });
  };

  return (
    <DashboardLayout loading={isLoading}><style jsx global>{`
        @page {
          size: auto;
          margin: 12mm;
        }

        @media print {
          body {
            background: #ffffff !important;
          }

          .print-area {
            font-size: 12pt !important;
            line-height: 1.35 !important;
          }

          .print-overlay,
          .print-actions {
            display: none !important;
          }

          .print-modal {
            position: static !important;
            inset: auto !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
          }

          .print-area {
            padding: 0 !important;
          }

          .print-header {
            border-bottom: 1px solid #e2e8f0 !important;
          }

          .print-table {
            border: 1px solid #e2e8f0 !important;
            border-collapse: collapse !important;
            width: 100% !important;
            table-layout: auto !important;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #e2e8f0 !important;
            padding: 6px 8px !important;
            font-size: 12pt !important;
          }

          .print-table thead {
            background: #f1f5f9 !important;
            color: #334155 !important;
            display: table-header-group !important;
          }

          .print-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Generate Reports ({displayedCards.length})</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 px-3 text-xs">
              <FileDown size={13} className="mr-1" /> Excel
            </Button>
            <Button className="h-9 px-3 text-xs bg-rose-600 hover:bg-rose-700">
              <FileDown size={13} className="mr-1" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Reports & Filters</h3>
            <div className="mt-4 space-y-3">
              <Select
                label="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Classes" },
                  ...classOptions.map((option) => ({ value: option.id, label: option.label })),
                ]}
              />
              <Select
                label="Term"
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value as typeof termFilter)}
                options={[
                  { value: "all", label: "All Terms" },
                  { value: "FIRST_TERM", label: "First Term" },
                  { value: "SECOND_TERM", label: "Second Term" },
                  { value: "THIRD_TERM", label: "Third Term" },
                ]}
              />
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Students ({filteredStudents.length})</span>
                <button
                  onClick={() => setSelectedReportIds(filteredStudents.map((student) => student.id))}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Select All
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {filteredStudents.length === 0 && (
                  <p className="text-xs text-slate-400">No assessment entries yet.</p>
                )}
                {paginatedStudents.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedReportIds.includes(student.id)}
                      onChange={(e) => {
                        setSelectedReportIds((current) =>
                          e.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id),
                        );
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-[10px] text-slate-400">{student.classLabel} • {student.term}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <Pagination
                  totalItems={filteredStudents.length}
                  currentPage={safeStudentPage}
                  pageSize={studentPageSize}
                  onPageChange={setStudentPage}
                  onPageSizeChange={(size) => {
                    setStudentPageSize(size);
                    setStudentPage(1);
                  }}
                  pageSizeOptions={[10, 20, 50]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading assessments...
              </div>
            )}
            {!isLoading && displayedCards.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Assessment entries will appear here once they are saved for a class and term.
              </div>
            )}
            {paginatedCards.map((card) => (
              <div key={card.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Kaas Academy</h4>
                    <p className="text-xs text-slate-500">
                      {card.studentName} • {card.classLabel} • {formatTerm(card.term)}
                    </p>
                    <p className="text-[11px] text-slate-400">Academic Year: {card.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700">Overall Score: {card.overallScore}%</p>
                    <p className="text-[11px] text-slate-400">
                      {card.ready ? "Ready for view & print" : "Waiting for remaining subjects"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.subjects.map((row) => (
                        <tr key={row.subject} className="border-t border-slate-100 text-slate-700">
                          <td className="px-3 py-2">{row.subject}</td>
                          <td className="px-3 py-2">{row.score ?? "-"}</td>
                          <td className="px-3 py-2">{row.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <p>
                    Attendance: {card.attendance.present}/{card.attendance.total} ({card.attendance.percent}%)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setActiveReport(card)}
                      disabled={!card.ready}
                    >
                      <Eye size={11} className="mr-1" /> View
                    </Button>
                    <Button
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => markPrinted(card)}
                      disabled={!card.ready}
                    >
                      {card.printedAt ? "Printed" : "Print"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {displayedCards.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <Pagination
                  totalItems={displayedCards.length}
                  currentPage={safeReportPage}
                  pageSize={reportPageSize}
                  onPageChange={setReportPage}
                  onPageSizeChange={(size) => {
                    setReportPageSize(size);
                    setReportPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 print-overlay" onClick={() => setActiveReport(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl print-modal">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 print-header">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                  <Image src="/KAASLOGO.jpeg" alt="Kaas logo" width={40} height={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Kaas Academy</h3>
                  <p className="text-xs text-slate-500">Terminal Report</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>Academic Year: {activeReport.academicYear}</p>
                <p>Term: {formatTerm(activeReport.term)}</p>
              </div>
            </div>

            <div className="space-y-5 p-6 print-area">
              <div className="rounded-lg border border-slate-200 p-4 text-xs">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Student Details</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-slate-700">
                  <p>
                    <span className="font-semibold">Student Name:</span> {activeReport.studentName}
                  </p>
                  <p>
                    <span className="font-semibold">Class:</span> {activeReport.classLabel}
                  </p>
                  <p>
                    <span className="font-semibold">Student ID:</span> {activeReport.studentId}
                  </p>
                  <p>
                    <span className="font-semibold">Attendance:</span>{" "}
                    {activeReport.attendance.present}/{activeReport.attendance.total} ({activeReport.attendance.percent}%)
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Academic Performance</p>
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs print-table">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Grade</th>
                        <th className="px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReport.subjects.map((row) => (
                        <tr key={row.subject} className="border-t border-slate-100 text-slate-700">
                          <td className="px-3 py-2">{row.subject}</td>
                          <td className="px-3 py-2">{row.score ?? "-"}</td>
                          <td className="px-3 py-2">{row.grade}</td>
                          <td className="px-3 py-2">{row.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4 text-xs">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Summary & Conduct</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-slate-700">
                  <p>
                    <span className="font-semibold">Overall Score:</span> {activeReport.overallScore}%
                  </p>
                  <p>
                    <span className="font-semibold">Overall Grade:</span> {activeReport.overallGrade}
                  </p>
                  <p>
                    <span className="font-semibold">Behavior:</span> {activeReport.behavior}
                  </p>
                  <p>
                    <span className="font-semibold">Discipline:</span> {activeReport.discipline}
                  </p>
                  <p>
                    <span className="font-semibold">Class Position:</span>
                  </p>
                  <p>
                    <span className="font-semibold">Reopening Date:</span>
                  </p>
                </div>
                <p className="mt-3 text-slate-600">{activeReport.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-slate-600">
                <div>
                  <div className="h-px w-full bg-slate-300" />
                  <p className="mt-2 text-center">Class Teacher&apos;s Signature</p>
                </div>
                <div>
                  <div className="h-px w-full bg-slate-300" />
                  <p className="mt-2 text-center">Headmaster&apos;s Signature</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 print-actions">
              <Button variant="outline" onClick={() => setActiveReport(null)}>
                Close
              </Button>
              <Button
                className="bg-emerald-600"
                onClick={async () => {
                  await markPrinted(activeReport);
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
              >
                Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
