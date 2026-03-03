"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../../../../components/ui/BackButton";
import {
  Mail,
  MessageCircle,
  Printer,
  Eye,
  X,
  Download,
  Search,
  BookOpen,
  Award,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import {
  reports,
  students,
  assessments,
  getStudentName,
  getBranchName,
} from "../../../../lib/school-data";
import { TerminalReport } from "../../../../types/school";

// ─── helpers ───────────────────────────────────────────────────────────────

const TERM_LABELS: Record<string, string> = {
  first_term: "First Term",
  second_term: "Second Term",
  third_term: "Third Term",
};

function getGradeColor(grade: string): string {
  if (["A+", "A"].includes(grade)) return "bg-emerald-100 text-emerald-700";
  if (["B+", "B"].includes(grade)) return "bg-blue-100 text-blue-700";
  if (["C+", "C"].includes(grade)) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  return "F";
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Print Modal ────────────────────────────────────────────────────────────

function ReportModal({
  report,
  onClose,
}: {
  report: TerminalReport;
  onClose: () => void;
}) {
  const student = students.find((s) => s.id === report.studentId);
  const branchName = getBranchName(report.branchId);
  const studentName = student?.fullName ?? "Unknown Student";
  const studentClass = student
    ? `${student.className}${student.section}`
    : report.className;

  // Derive per-subject rows from assessments linked to this class/term
  const subjectRows = assessments
    .filter(
      (a) =>
        a.className === report.className &&
        a.term === report.term
    )
    .map((a) => {
      // Simulate a score proportional to the overall scorePercent ± small deviation
      const base = report.scorePercent;
      const offset = Math.floor((a.subject.charCodeAt(0) % 10) - 4);
      const score = Math.min(100, Math.max(40, base + offset));
      return {
        subject: a.subject,
        score,
        grade: gradeFromScore(score),
      };
    });

  // If no assessments exist, add fallback subjects
  const displayRows =
    subjectRows.length > 0
      ? subjectRows
      : [
        { subject: "Mathematics", score: report.scorePercent, grade: report.grade },
        { subject: "English Language", score: Math.max(40, report.scorePercent - 5), grade: gradeFromScore(report.scorePercent - 5) },
      ];

  const attendance = Math.floor(58 + ((report.scorePercent % 5)));
  const totalSessions = 60;
  const attendancePercent = Math.round((attendance / totalSessions) * 100);

  const behaviorRating = report.scorePercent >= 80 ? "Outstanding" : report.scorePercent >= 65 ? "Very Good" : "Good";
  const disciplineRating = report.scorePercent >= 80 ? "Exemplary" : "Good";
  const classPosition = 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {initials(branchName)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{branchName}</h2>
                <p className="text-xs text-slate-500">Academic Progress Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Academic Year: 2024/2025
              </p>
              <p className="text-[11px] text-slate-500">Term: {TERM_LABELS[report.term]}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
              aria-label="Close report"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Student Details */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-emerald-600 px-4 py-2">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <BookOpen size={11} /> Student Details
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Student Name</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Student ID</p>
                  <p className="font-semibold text-slate-800 mt-0.5">STU-{student?.admissionNo ?? report.id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Class</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{studentClass}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Attendance</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {attendance}/{totalSessions} ({attendancePercent}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-emerald-600 px-4 py-2">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <ClipboardList size={11} /> Academic Performance
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                    <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Score</th>
                    <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">Grade</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{row.subject}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-800">{row.score}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getGradeColor(row.grade)}`}>
                          {row.grade}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">
                        {row.score >= 90 ? "Excellent" : row.score >= 75 ? "Very Good" : row.score >= 60 ? "Good" : "Needs Improvement"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary & Conduct */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-emerald-600 px-4 py-2">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <TrendingUp size={11} /> Summary &amp; Conduct
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Overall Score</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{report.scorePercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Overall Grade</p>
                  <p className={`text-xl font-black mt-0.5 ${report.grade.startsWith("A") ? "text-emerald-600" : report.grade.startsWith("B") ? "text-blue-600" : "text-amber-600"}`}>
                    {report.grade}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Behavioral Rating</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{behaviorRating}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Discipline Rating</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{disciplineRating}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Class Position</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{classPosition}</p>
                </div>
              </div>
            </div>

            {/* Signature Lines */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {["Teacher's Signature", "Parent/Guardian\nSignature", "Principal's Signature"].map((sig) => (
                <div key={sig} className="flex flex-col items-center gap-2">
                  <div className="w-full border-t-2 border-dashed border-slate-300" />
                  <p className="text-[10px] text-center text-slate-400 whitespace-pre-line">{sig}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-slate-400">
              Report Date: {new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50/60">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors shadow-sm"
            >
              <Mail size={15} /> Send by Email
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Report Card ────────────────────────────────────────────────────────────

function ReportCard({
  report,
  onView,
}: {
  report: TerminalReport;
  onView: (r: TerminalReport) => void;
}) {
  const branchName = getBranchName(report.branchId);
  const studentName = getStudentName(report.studentId);
  const student = students.find((s) => s.id === report.studentId);
  const studentClass = student
    ? `${student.className} ${student.section}`
    : report.className;

  const subjectRows = assessments
    .filter((a) => a.className === report.className && a.term === report.term)
    .map((a) => ({
      subject: a.subject,
      score: Math.min(100, Math.max(40, report.scorePercent + (a.subject.charCodeAt(0) % 10) - 4)),
    }));

  const displaySubjects = subjectRows.length > 0
    ? subjectRows
    : [
      { subject: "Mathematics", score: report.scorePercent },
      { subject: "English", score: Math.max(40, report.scorePercent - 5) },
    ];

  const attendance = Math.floor(58 + (report.scorePercent % 5));
  const behavior = report.scorePercent >= 80 ? "Outstanding" : "Very Good";
  const discipline = report.scorePercent >= 80 ? "Exemplary" : "Good";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{branchName}</p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{studentName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {studentClass} &bull; {TERM_LABELS[report.term]}
            </p>
            <p className="text-xs text-slate-500">
              Academic Year: 2024/2025 &bull; Grade:{" "}
              <span className={`font-bold ${report.grade.startsWith("A") ? "text-emerald-600" : "text-blue-600"}`}>
                {report.grade}
              </span>{" "}
              | Score: {report.scorePercent}
            </p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${getGradeColor(report.grade)}`}>
            {report.grade}
          </span>
        </div>
      </div>

      {/* Subject table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
            <th className="px-4 py-2.5 text-left">Subject</th>
            <th className="px-4 py-2.5 text-center">Score</th>
            <th className="px-4 py-2.5 text-left">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {displaySubjects.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-4 py-2.5 text-slate-700 font-medium">{row.subject}</td>
              <td className="px-4 py-2.5 text-center font-bold text-slate-900">{row.score}</td>
              <td className="px-4 py-2.5 text-slate-500 text-xs">
                {row.score >= 90 ? "Excellent" : row.score >= 75 ? "Very Good" : "Good"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
        <p className="text-xs text-slate-500">
          Attendance: {attendance}/60 &bull; Behavior: {behavior} &bull; Discipline: {discipline}
        </p>
        <button
          type="button"
          onClick={() => onView(report)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Eye size={13} /> View
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [termFilter, setTermFilter] = React.useState<string>("all");
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [selectedReport, setSelectedReport] = React.useState<TerminalReport | null>(null);

  const uniqueClasses = Array.from(new Set(reports.map((r) => r.className)));

  const filtered = reports.filter((r) => {
    const matchTerm = termFilter === "all" || r.term === termFilter;
    const matchClass = classFilter === "all" || r.className === classFilter;
    const name = getStudentName(r.studentId).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    return matchTerm && matchClass && matchSearch;
  });

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Terminal Report Center</h2>
            <p className="text-slate-500 text-sm mt-1">
              Generate, preview and deliver term reports to guardians.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors"
            >
              <Download size={15} /> Export PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <MessageCircle size={15} /> Send WhatsApp
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end shadow-sm">
          {/* Term filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Term</label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Terms</option>
              <option value="first_term">First Term</option>
              <option value="second_term">Second Term</option>
              <option value="third_term">Third Term</option>
            </select>
          </div>

          {/* Class filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Search Student</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name…"
                className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Stats badge */}
          <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <Award size={14} className="text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              {filtered.length} Report{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Report Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filtered.map((report) => (
              <ReportCard key={report.id} report={report} onView={setSelectedReport} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-slate-200 text-center">
            <ClipboardList size={32} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No reports found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </motion.div>

      {/* Print Modal */}
      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </DashboardLayout>
  );
}
