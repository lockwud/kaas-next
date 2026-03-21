"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { usePathname } from "next/navigation";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Pagination } from "../../../../components/ui/Pagination";
import { Select } from "../../../../components/ui/Select";
import { SearchableSelect } from "../../../../components/ui/SearchableSelect";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, FileDown, RefreshCw, Search, X, Printer } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import type { AttendanceRecord, VacationDateRecord, ReopeningDateRecord } from "@/lib/attendance-types";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type AssessmentStoredRecord = {
  id: string;
  classId?: string;
  className?: string;
  section?: string;
  subject: string;
  term: "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM";
  academicYear?: string | null;
  vacationDate?: string | null;
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
  classExercise?: number;
  homeworkProject?: number;
  exam?: number;
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
  vacationDate?: string;
  reopeningDate?: string;
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

const formatTerm = (
  term:
    | "FIRST_TERM"
    | "SECOND_TERM"
    | "THIRD_TERM"
    | "first_term"
    | "second_term"
    | "third_term",
) =>
  term
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeTermKey = (term?: string) =>
  term ? term.trim().toLowerCase().replace(/\s+/g, "_") : "";

const scoreToGrade = (score: number) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

const scoreToRemark = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Satisfactory";
  if (score >= 40) return "Poor";
  return "Below Average";
};

const scoreToSummary = (score: number) => {
  if (score >= 80) return "Outstanding performance across all subjects.";
  if (score >= 70) return "Very strong performance with consistent results.";
  if (score >= 60) return "Good performance with room for improvement.";
  if (score >= 50) return "Satisfactory performance; improvement needed.";
  if (score >= 40) return "Below average performance; needs support.";
  return "Very poor performance; urgent intervention required.";
};

// Behavior rating based on conduct and social interaction (independent from academic score)
const scoreToBehavior = (rating: number) => {
  if (rating >= 90) return "Exemplary";
  if (rating >= 80) return "Outstanding";
  if (rating >= 70) return "Very Good";
  if (rating >= 60) return "Good";
  if (rating >= 50) return "Satisfactory";
  if (rating >= 40) return "Needs Improvement";
  return "Unsatisfactory";
};

// Discipline rating based on compliance with school rules (independent from academic score)
const scoreToDiscipline = (rating: number) => {
  if (rating >= 90) return "Impeccable";
  if (rating >= 80) return "Excellent";
  if (rating >= 70) return "Very Commendable";
  if (rating >= 60) return "Commendable";
  if (rating >= 50) return "Acceptable";
  if (rating >= 40) return "Concerning";
  return "Critical";
};

const gradeInterpretation = [
  { range: "80 - 100", grade: "A", remark: "Excellent" },
  { range: "70 - 79", grade: "B", remark: "Very Good" },
  { range: "60 - 69", grade: "C", remark: "Good" },
  { range: "50 - 59", grade: "D", remark: "Satisfactory" },
  { range: "40 - 49", grade: "E", remark: "Poor" },
  { range: "0 - 39", grade: "F", remark: "Below Average" },
];

// Behavior rating scale for teachers to assess
const behaviorRatingScale = [
  { range: "90 - 100", rating: "Exemplary", description: "Always demonstrates outstanding conduct and positive social interactions" },
  { range: "80 - 89", rating: "Outstanding", description: "Consistently shows excellent behavior and character" },
  { range: "70 - 79", rating: "Very Good", description: "Usually behaves well with minor occasional issues" },
  { range: "60 - 69", rating: "Good", description: "Generally demonstrates good conduct" },
  { range: "50 - 59", rating: "Satisfactory", description: "Behavior meets basic expectations" },
  { range: "40 - 49", rating: "Needs Improvement", description: "Behavior requires monitoring and improvement" },
  { range: "0 - 39", rating: "Unsatisfactory", description: "Significant behavioral issues observed" },
];

// Discipline rating scale for teachers to assess
const disciplineRatingScale = [
  { range: "90 - 100", rating: "Impeccable", description: "Always complies with all school rules and regulations" },
  { range: "80 - 89", rating: "Excellent", description: "Consistently follows school policies without issues" },
  { range: "70 - 79", rating: "Very Commendable", description: "Usually observes rules with rare minor violations" },
  { range: "60 - 69", rating: "Commendable", description: "Generally follows rules and regulations" },
  { range: "50 - 59", rating: "Acceptable", description: "Basic compliance with school rules" },
  { range: "40 - 49", rating: "Concerning", description: "Multiple rule violations require attention" },
  { range: "0 - 39", rating: "Critical", description: "Serious disciplinary issues require immediate intervention" },
];

const formatExamWeight = (exam?: number) => {
  if (typeof exam !== "number") return "-";
  if (exam <= 60) return exam;
  const converted = exam * 0.5;
  return Number.isInteger(converted) ? converted : Number(converted.toFixed(1));
};

const ReportBody = ({ report }: { report: ReportCard }) => {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 print-header report-header-bar">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/40 bg-white/90">
            <Image
              src="/KAASLOGO.jpeg"
              alt="Kaas logo"
              width={40}
              height={40}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold">Kaas Montessori School</h3>
            <p className="text-xs text-white/80">Terminal Report</p>
          </div>
        </div>
        <div className="text-right text-[11px] text-white/80">
          <p className="font-semibold text-white">
            Academic Year: {report.academicYear}
          </p>
          <p>Term: {formatTerm(report.term)}</p>
        </div>
      </div>

      <div className="space-y-5 p-6 print-area">
        <div className="rounded-lg border border-slate-200 p-4 text-xs">
          <p className="text-[11px] font-semibold uppercase report-section-title">
            Student Details
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
            <p>
              <span className="report-label">Student Name:</span>{" "}
              {report.studentName}
            </p>
            <p>
              <span className="report-label">Class:</span> {report.classLabel}
            </p>
            <p>
              <span className="report-label">Vacation Date:</span>{" "}
              {report.vacationDate || "-"}
            </p>
            <p>
              <span className="report-label">Attendance:</span>{" "}
              {report.attendance.present}/{report.attendance.total} (
              {report.attendance.percent}%)
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase report-section-title">
            Academic Performance
          </p>
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs print-table report-table">
              <thead>
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Class Exercise</th>
                  <th className="px-3 py-2">Homework + Project</th>
                  <th className="px-3 py-2">Exam (60%)</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((row) => (
                  <tr
                    key={row.subject}
                    className="border-t border-slate-100 text-slate-700"
                  >
                    <td className="px-3 py-2 subject">{row.subject}</td>
                    <td className="px-3 py-2">{row.classExercise ?? "-"}</td>
                    <td className="px-3 py-2">{row.homeworkProject ?? "-"}</td>
                    <td className="px-3 py-2">{formatExamWeight(row.exam)}</td>
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
          <p className="text-[11px] font-semibold uppercase report-section-title">
            Interpretation Of Score & Grade Mapping
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs print-table report-table">
              <thead>
                <tr>
                  <th className="px-3 py-2">Score Range</th>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {gradeInterpretation.map((row) => (
                  <tr
                    key={row.grade}
                    className="border-t border-slate-100 text-slate-700"
                  >
                    <td className="px-3 py-2">{row.range}</td>
                    <td className="px-3 py-2">{row.grade}</td>
                    <td className="px-3 py-2">{row.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 text-xs">
          <p className="text-[11px] font-semibold uppercase report-section-title">
            Summary & Conduct
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-slate-700">
            <p>
              <span className="report-label">Overall Score:</span>{" "}
              {report.overallScore}%
            </p>
            <p>
              <span className="report-label">Overall Grade:</span>{" "}
              {report.overallGrade}
            </p>
            <p>
              <span className="report-label">Behavior:</span> {report.behavior}
            </p>
            <p>
              <span className="report-label">Discipline:</span>{" "}
              {report.discipline}
            </p>
            <p>
              <span className="report-label">Class Position:</span>
            </p>
            <p>
              <span className="report-label">Reopening Date:</span>{" "}
              {report.reopeningDate || "-"}
            </p>
          </div>
          <p className="mt-3 text-slate-600">{report.summary}</p>
        </div>

        <div className="pt-20 text-xs text-slate-600">
          <div className="mx-auto max-w-[240px]">
            <div className="h-px w-full bg-slate-300" />
            <p className="mt-2 text-center">
              Headmaster&apos;s Signature
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const scoreToAttendance = (score: number) => {
  const total = 90;
  const present = Math.max(
    0,
    Math.min(total, Math.round((score / 100) * total)),
  );
  const percent = Math.round((present / total) * 100);
  return { present, total, percent };
};

const buildReportKey = (
  studentId: string,
  className: string,
  term: string,
  academicYear: string,
) => `${studentId}|${className}|${term}|${academicYear}`;

export default function ReportsPage() {
  const { success, error } = useToast();
  const [assessmentRecords, setAssessmentRecords] = React.useState<
    AssessmentStoredRecord[]
  >([]);
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [termFilter, setTermFilter] = React.useState<
    "all" | "first_term" | "second_term" | "third_term"
  >("all");
  const [yearFilter, setYearFilter] = React.useState<string>("all");
  const [studentSearch, setStudentSearch] = React.useState("");
  const [selectedReportIds, setSelectedReportIds] = React.useState<string[]>(
    [],
  );
  const [activeReport, setActiveReport] = React.useState<ReportCard | null>(
    null,
  );
  const reportModalRef = React.useRef<HTMLDivElement | null>(null);
  const reportContentRef = React.useRef<HTMLDivElement | null>(null);
  const printRef = React.useRef<HTMLDivElement | null>(null);
  const [reportScale, setReportScale] = React.useState(1);
  const [reportStatus, setReportStatus] = React.useState<ReportStatusMap>({});
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);
  const [vacationDates, setVacationDates] = React.useState<VacationDateRecord[]>([]);
  const [reopeningDates, setReopeningDates] = React.useState<ReopeningDateRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isBulkExporting, setIsBulkExporting] = React.useState(false);
  const [studentPage, setStudentPage] = React.useState(1);
  const [studentPageSize, setStudentPageSize] = React.useState(10);
  const [reportPage, setReportPage] = React.useState(1);
  const [reportPageSize, setReportPageSize] = React.useState(5);
  const pathname = usePathname();

  const load = async () => {
    setIsLoading(true);
    try {
      const [assessments, reports, attendancePayload, vacationPayload, reopeningPayload] = await Promise.all([
        apiRequest<AssessmentStoredRecord[]>(API_ENDPOINTS.assessments),
        apiRequest<Array<{ id: string; printedAt?: string | null }>>(
          API_ENDPOINTS.reports,
        ).catch(() => []), // Handle reports API failure gracefully
        apiRequest<AttendanceRecord[]>(API_ENDPOINTS.attendance).catch(() => null),
        apiRequest<VacationDateRecord[]>(API_ENDPOINTS.vacationDates).catch(() => null),
        apiRequest<ReopeningDateRecord[]>(API_ENDPOINTS.reopeningDates).catch(() => null),
      ]);
      setAssessmentRecords(assessments || []);
      setAttendanceRecords(attendancePayload ?? []);
      setVacationDates(vacationPayload ?? []);
      setReopeningDates(reopeningPayload ?? []);
      const count = Array.isArray(assessments) ? assessments.length : 0;
      if (count > 0) {
        success(`${count} assessment(s) loaded for reporting.`);
      }
      const statusMap = reports.reduce<ReportStatusMap>((acc, item) => {
        acc[item.id] = { printedAt: item.printedAt ?? undefined };
        return acc;
      }, {});
      setReportStatus(statusMap);
    } catch (err) {
      console.error("Failed to load reports data:", err);
      error("Failed to load reports. Please try refreshing.");
      setAssessmentRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
  }, [pathname]);

  const classOptions = React.useMemo(() => {
    const byName = new Map<
      string,
      Array<{ id: string; label: string; section: string }>
    >();
    assessmentRecords.forEach((record) => {
      const className = record.className ?? "Class";
      const section = record.section ?? "";
      const label = `${className}${section}`.trim();
      if (!label) return;
      const key = className.trim().toLowerCase();
      const list = byName.get(key) ?? [];
      list.push({ id: label, label, section });
      byName.set(key, list);
    });

    const filtered: Array<{ id: string; label: string }> = [];
    byName.forEach((list) => {
      const hasSection = list.some((opt) => opt.section.trim() !== "");
      list.forEach((opt) => {
        if (hasSection && opt.section.trim() === "") return;
        filtered.push({ id: opt.id, label: opt.label });
      });
    });

    const deduped = new Map<string, { id: string; label: string }>();
    filtered.forEach((opt) => {
      if (!deduped.has(opt.id)) {
        deduped.set(opt.id, opt);
      }
    });

    return Array.from(deduped.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [assessmentRecords]);

  const yearOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    assessmentRecords.forEach((record) => {
      if (record.academicYear) {
        if (!map.has(record.academicYear)) {
          map.set(record.academicYear, { id: record.academicYear, label: record.academicYear });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.label.localeCompare(a.label));
  }, [assessmentRecords]);

  const filteredRecords = React.useMemo(() => {
    return assessmentRecords.filter((record) => {
      const recordClassKey =
        `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      if (classFilter !== "all" && recordClassKey !== classFilter) return false;
      if (termFilter !== "all" && record.term?.toLowerCase() !== termFilter)
        return false;
      if (yearFilter !== "all" && (record.academicYear ?? "") !== yearFilter)
        return false;
      return true;
    });
  }, [assessmentRecords, classFilter, termFilter, yearFilter]);

  const attendanceLookup = React.useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    attendanceRecords.forEach((record) => {
      const termKey = normalizeTermKey(record.term);
      if (!termKey || !record.academicYear) return;
      record.entries?.forEach((entry) => {
        const key = `${entry.studentId}|${termKey}|${record.academicYear}`;
        map.set(key, { present: entry.present, total: record.total });
      });
    });
    return map;
  }, [attendanceRecords]);

  const vacationDateLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    vacationDates.forEach((record) => {
      const termKey = normalizeTermKey(record.term);
      if (!termKey || !record.academicYear) return;
      map.set(`${termKey}|${record.academicYear}`, record.vacationDate);
    });
    return map;
  }, [vacationDates]);

  const reopeningDateLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    reopeningDates.forEach((record) => {
      const termKey = normalizeTermKey(record.term);
      if (!termKey || !record.academicYear) return;
      map.set(`${termKey}|${record.academicYear}`, record.reopeningDate);
    });
    return map;
  }, [reopeningDates]);

  const reportCards = React.useMemo(() => {
    if (filteredRecords.length === 0) return [] as ReportCard[];

    // Build subjectMap - key must include section to match classLabel
    const subjectMap = new Map<string, Set<string>>();
    filteredRecords.forEach((record) => {
      const classLabel = `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      const key = `${classLabel}|${(record.term ?? "").toLowerCase()}|${record.academicYear ?? ""}`;
      const set = subjectMap.get(key) ?? new Set<string>();
      set.add(record.subject);
      subjectMap.set(key, set);
    });

    const studentMap = new Map<
      string,
      {
        studentName: string;
        classLabel: string;
        subjectScores: Map<
          string,
          {
            total: number;
            classExercise: number;
            homeworkProject: number;
            exam: number;
            savedAt: string;
          }
        >;
        term: "first_term" | "second_term" | "third_term";
        academicYear: string;
        classId: string;
        studentId: string;
      }
    >();

    filteredRecords.forEach((record) => {
      const classLabel =
        `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      record.rows?.forEach((row) => {
        const studentKey = `${row.studentId}|${(record.term ?? "").toLowerCase()}|${record.academicYear ?? ""}`;
        if (!studentMap.has(studentKey)) {
          studentMap.set(studentKey, {
            studentId: row.studentId,
            studentName: row.studentName,
            classLabel,
            subjectScores: new Map(),
            term: record.term.toLowerCase() as
              | "first_term"
              | "second_term"
              | "third_term",
            academicYear: record.academicYear ?? "",
            classId: record.classId ?? "",
          });
        }
        const entry = studentMap.get(studentKey);
        if (!entry) return;
        const existing = entry.subjectScores.get(record.subject);
        const recordTime = record.savedAt
          ? new Date(record.savedAt).getTime()
          : 0;
        const existingTime = existing?.savedAt
          ? new Date(existing.savedAt).getTime()
          : 0;
        if (!existing || recordTime >= existingTime) {
          entry.subjectScores.set(record.subject, {
            total: row.total,
            classExercise: row.classExercise,
            homeworkProject: row.homeworkProject,
            exam: row.exam,
            savedAt: record.savedAt ?? "",
          });
        }
      });
    });

    return Array.from(studentMap.entries()).map(([, data]) => {
      const subjectKey = `${data.classLabel}|${data.term}|${data.academicYear}`;
      const requiredSubjects = Array.from(
        subjectMap.get(subjectKey) ?? [],
      ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      const vacationDate = vacationDateLookup.get(
        `${data.term}|${data.academicYear}`,
      );
      const reopeningDate = reopeningDateLookup.get(
        `${data.term}|${data.academicYear}`,
      );

      const subjectRows: ReportSubjectRow[] = requiredSubjects.map(
        (subject) => {
          const scoreEntry = data.subjectScores.get(subject);
          if (!scoreEntry) {
            return {
              subject,
              grade: "-",
              remark: "Pending",
            };
          }
          const score = scoreEntry.total;
          return {
            subject,
            classExercise: scoreEntry.classExercise,
            homeworkProject: scoreEntry.homeworkProject,
            exam: scoreEntry.exam,
            score,
            grade: scoreToGrade(score),
            remark: scoreToRemark(score),
          };
        },
      );

      const scores = subjectRows
        .filter((row) => typeof row.score === "number")
        .map((row) => row.score as number);
      const overallScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((sum, value) => sum + value, 0) / scores.length,
            )
          : 0;
      const overallGrade = scoreToGrade(overallScore);
      const attendanceKey = `${data.studentId}|${data.term}|${data.academicYear}`;
      const attendanceValue = attendanceLookup.get(attendanceKey);
      const attendance = attendanceValue
        ? {
            present: attendanceValue.present,
            total: attendanceValue.total,
            percent: attendanceValue.total
              ? Math.round((attendanceValue.present / attendanceValue.total) * 100)
              : 0,
          }
        : scoreToAttendance(overallScore);
      const ready = subjectRows.some((s) => typeof s.score === "number");
      const reportKey = buildReportKey(
        data.studentId,
        data.classLabel,
        data.term,
        data.academicYear,
      );
      const status = reportStatus[reportKey];

      // Behavior and discipline are independent from academic scores
      // They will be set by teachers separately (defaulting to "Very Good" / "Excellent")
      const behaviorRating = 85; // Default - should be set by teacher in separate UI
      const disciplineRating = 88; // Default - should be set by teacher in separate UI
      
      return {
        id: reportKey,
        studentId: data.studentId,
        studentName: data.studentName,
        classLabel: data.classLabel,
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear,
        vacationDate,
        reopeningDate,
        subjects: subjectRows,
        overallScore,
        overallGrade,
        attendance,
        summary: scoreToSummary(overallScore),
        behavior: scoreToBehavior(behaviorRating),
        discipline: scoreToDiscipline(disciplineRating),
        ready,
        printedAt: status?.printedAt,
      };
    });
  }, [filteredRecords, reportStatus, attendanceLookup, vacationDateLookup, reopeningDateLookup]);

  const filteredStudents = React.useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return reportCards
      .filter((card) =>
        query ? card.studentName.toLowerCase().includes(query) : true,
      )
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
  }, [classFilter, termFilter, yearFilter]);

  const displayedCards = reportCards.filter((card) =>
    selectedReportIds.includes(card.id),
  );

  const studentTotalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / studentPageSize),
  );
  const safeStudentPage = Math.min(Math.max(1, studentPage), studentTotalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeStudentPage - 1) * studentPageSize,
    safeStudentPage * studentPageSize,
  );

  const reportTotalPages = Math.max(
    1,
    Math.ceil(displayedCards.length / reportPageSize),
  );
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
      const recordClassKey =
        `${record.className ?? "Class"}${record.section ?? ""}`.trim();
      return (
        recordClassKey === classLabel &&
        record.term.toLowerCase() === card.term &&
        (record.academicYear ?? "") === card.academicYear
      );
    });

    if (assessmentsForClass.length === 0) {
      return;
    }

    // Try to generate report on server, but don't fail if API is unavailable
    try {
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
              total: row.total,
            })),
          })),
        }),
      });
    } catch (err) {
      // Silently handle API errors - report is already generated locally
      console.warn("Report generation API unavailable, using local data:", err);
    }
  };

  const markPrinted = async (card: ReportCard) => {
    await ensureReportGenerated(card);
    const updated = {
      ...reportStatus,
      [card.id]: { printedAt: new Date().toISOString() },
    };
    setReportStatus(updated);
    
    // Try to update print status on server, but don't fail if API is unavailable
    try {
      await apiRequest(`${API_ENDPOINTS.reports}/${card.id}/print`, {
        method: "PATCH",
        body: JSON.stringify({ printed: true }),
      });
    } catch (err) {
      // Silently handle API errors - local state is already updated
      console.warn("Print status update API unavailable, using local state:", err);
    }
  };

  const computeReportScale = React.useCallback(() => {
    if (!reportModalRef.current || !reportContentRef.current) return;
    const modal = reportModalRef.current;
    const content = reportContentRef.current;
    const padding = 24;
    const availableWidth = modal.clientWidth - padding * 2;
    const availableHeight = modal.clientHeight - padding * 2;
    const contentWidth = content.scrollWidth;
    const contentHeight = content.scrollHeight;
    if (!contentWidth || !contentHeight || availableWidth <= 0 || availableHeight <= 0) {
      setReportScale(1);
      return;
    }
    const nextScale = Math.min(
      1,
      availableWidth / contentWidth,
      availableHeight / contentHeight,
    );
    setReportScale(Number.isFinite(nextScale) ? Math.max(0.6, nextScale) : 1);
  }, []);

  React.useLayoutEffect(() => {
    if (!activeReport) return;
    computeReportScale();
    const handleResize = () => computeReportScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeReport, computeReportScale]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: activeReport
      ? `${activeReport.studentName.replace(/[^a-zA-Z0-9]/g, "_")}_${activeReport.classLabel.replace(/[^a-zA-Z0-9]/g, "_")}_Report`
      : "KAAS_Report",
  });

  const waitForImages = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );
  };

  const renderReportToPdfBlob = async (card: ReportCard) => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-9999px";
    host.style.top = "0";
    host.style.width = "210mm";
    host.style.background = "white";
    host.style.zIndex = "0";
    document.body.appendChild(host);

    const root = createRoot(host);
    root.render(
      <div className="report-theme report-export">
        <div className="report-watermark" aria-hidden="true">
          <Image
            src="/KAASLOGO.jpeg"
            alt="School Logo Watermark"
            width={400}
            height={400}
            style={{ width: "100%", height: "auto" }}
            unoptimized
            priority
          />
        </div>
        <div className="print-modal-content">
          <ReportBody report={card} />
        </div>
      </div>,
    );

    await new Promise((resolve) => setTimeout(resolve, 120));
    await waitForImages(host);

    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: (doc) => {
        const reportRoot = doc.querySelector(".report-export");
        if (!reportRoot || !doc.defaultView) return;
        const sanitizeCss = (cssText: string) =>
          cssText
            .replace(/color-mix\([^)]*\)/gi, "rgba(0,0,0,0)")
            .replace(/(oklch|oklab|lch|lab)\([^)]*\)/gi, "rgba(0,0,0,0)")
            .replace(/color\([^)]*\)/gi, "rgba(0,0,0,0)");
        const hasModernColor = (value: string) => {
          const lower = value.toLowerCase();
          return (
            lower.includes("lab(") ||
            lower.includes("oklab(") ||
            lower.includes("lch(") ||
            lower.includes("oklch(") ||
            lower.includes("color(") ||
            lower.includes("color-mix(")
          );
        };
        const normalizeColor = (value: string, fallback: string) =>
          hasModernColor(value) ? fallback : value;
        const elements = Array.from(
          reportRoot.querySelectorAll<HTMLElement>("*"),
        );
        elements.push(reportRoot as HTMLElement);
        elements.forEach((el) => {
          const computed = doc.defaultView?.getComputedStyle(el);
          if (!computed) return;
          if (computed.color) el.style.color = normalizeColor(computed.color, "#0f172a");
          if (computed.borderColor) el.style.borderColor = normalizeColor(computed.borderColor, "#e2e8f0");
          if (computed.outlineColor) el.style.outlineColor = normalizeColor(computed.outlineColor, "#e2e8f0");
          if (computed.textDecorationColor) {
            el.style.textDecorationColor = normalizeColor(computed.textDecorationColor, "#0f172a");
          }
          if (computed.caretColor) el.style.caretColor = normalizeColor(computed.caretColor, "#0f172a");
          if (computed.columnRuleColor) {
            el.style.columnRuleColor = normalizeColor(computed.columnRuleColor, "#e2e8f0");
          }
          if (computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)") {
            el.style.backgroundColor = normalizeColor(computed.backgroundColor, "#ffffff");
          }
          if (computed.backgroundImage && hasModernColor(computed.backgroundImage)) {
            el.style.backgroundImage = "none";
          }
          if (computed.boxShadow && hasModernColor(computed.boxShadow)) {
            el.style.boxShadow = "none";
          }
          if (computed.textShadow && hasModernColor(computed.textShadow)) {
            el.style.textShadow = "none";
          }
          if (computed.fill && computed.fill !== "none") {
            el.style.fill = normalizeColor(computed.fill, "#0f172a");
          }
          if (computed.stroke && computed.stroke !== "none") {
            el.style.stroke = normalizeColor(computed.stroke, "#0f172a");
          }
          if (computed.filter && hasModernColor(computed.filter)) {
            el.style.filter = "none";
          }
        });
        const docEl = doc.documentElement as HTMLElement;
        const bodyEl = doc.body as HTMLElement;
        docEl.style.backgroundColor = "#ffffff";
        bodyEl.style.backgroundColor = "#ffffff";
        const styleNodes = Array.from(doc.querySelectorAll("style"));
        styleNodes.forEach((node) => {
          if (node.textContent) {
            node.textContent = sanitizeCss(node.textContent);
          }
        });
        const linkNodes = Array.from(
          doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        );
        linkNodes.forEach((link) => {
          try {
            const sheet = link.sheet as CSSStyleSheet | null;
            if (sheet?.cssRules) {
              let cssText = "";
              Array.from(sheet.cssRules).forEach((rule) => {
                cssText += `${rule.cssText}\n`;
              });
              const style = doc.createElement("style");
              style.textContent = sanitizeCss(cssText);
              link.replaceWith(style);
              return;
            }
          } catch {
            // Ignore and fall through to removal below
          }
          link.remove();
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const blob = pdf.output("blob");
    root.unmount();
    host.remove();
    return blob;
  };

  const bulkExportZip = async () => {
    if (selectedReportIds.length === 0) {
      error("Select students to export.");
      return;
    }
    const cardsToExport = reportCards.filter((c) =>
      selectedReportIds.includes(c.id),
    );
    if (cardsToExport.length === 0) {
      error("No reports selected for export.");
      return;
    }

    setIsBulkExporting(true);
    try {
      const zip = new JSZip();
      for (const card of cardsToExport) {
        const blob = await renderReportToPdfBlob(card);
        const student = card.studentName.replace(/[^a-zA-Z0-9]/g, "_");
        const classLabel = card.classLabel.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `${student}_${classLabel}_${formatTerm(card.term)}.pdf`;
        zip.file(fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `reports_${new Date().toISOString().split("T")[0]}.zip`;
      saveAs(zipBlob, zipName);

      for (const card of cardsToExport) {
        await markPrinted(card);
      }

      success(`Exported ${cardsToExport.length} report(s) to ZIP.`);
    } catch (err) {
      console.error("Bulk export failed:", err);
      error("Bulk export failed. Please try again.");
    } finally {
      setIsBulkExporting(false);
    }
  };


  return (
    <DashboardLayout loading={isLoading}>
      <style jsx global>{`
        .report-theme {
          --report-primary: #0f172a;
          --report-accent: #b45309;
          --report-soft: #f8fafc;
          --report-soft-2: #fff7ed;
          --report-ink: #0f172a;
        }

        .report-theme .report-header-bar {
          background: linear-gradient(120deg, var(--report-primary) 0%, var(--report-primary) 70%, var(--report-accent) 100%);
          color: white;
        }

        .report-theme .report-section-title {
          color: var(--report-primary);
          letter-spacing: 0.08em;
        }

        .report-theme .report-label {
          color: var(--report-accent);
          font-weight: 700;
        }

        .report-theme .report-chip {
          background: var(--report-soft);
          color: var(--report-primary);
          border: 1px solid rgba(15, 118, 110, 0.2);
        }

        .report-theme .report-table thead th {
          background: var(--report-primary);
          color: white;
        }

        .report-theme .report-table tbody tr:nth-child(even) {
          background: var(--report-soft);
        }

        .report-theme .report-table td.subject {
          color: var(--report-primary);
          font-weight: 700;
        }

        .report-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0.08;
          z-index: 0;
        }

        .report-watermark img {
          width: 45%;
          max-width: 420px;
          height: auto;
          filter: grayscale(100%);
        }

        .report-preview {
          position: relative;
          z-index: 1;
          transform: scale(var(--report-scale, 1));
          transform-origin: top center;
          width: 100%;
        }

        .print-only {
          display: none;
        }

        .report-export {
          position: relative;
          width: 190mm;
          margin: 0 auto;
          background: white;
        }

        @page {
          size: auto;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          /* Keep colors and layout; printing uses report content only */

          .print-modal {
            display: block !important;
          }

          /* Hide non-print elements */
          .print-overlay,
          .print-actions {
            display: none !important;
            visibility: hidden !important;
          }

          .print-content-wrapper {
            overflow: visible !important;
          }

          /* Hide non-print elements */
          .report-watermark,
          .print-watermark {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 45% !important;
            opacity: 0.08 !important;
            z-index: 0 !important;
            pointer-events: none !important;
          }

          .print-modal-content {
            position: relative !important;
            z-index: 1 !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 8mm 8mm 10mm !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            visibility: visible !important;
          }

          .print-area {
            font-size: 9pt !important;
            line-height: 1.1 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          .print-header {
            border-bottom: 1px solid #ccc !important;
            margin-bottom: 6pt !important;
            padding-bottom: 4pt !important;
          }

          .print-table {
            border: 1px solid #ccc !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #ccc !important;
            padding: 2px 4px !important;
            font-size: 8pt !important;
          }

          .print-table thead {
            display: table-header-group !important;
          }

          .print-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .report-preview {
            --report-scale: 1 !important;
            transform: none !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          .report-preview > .print-modal-content {
            width: 100% !important;
          }

          .print-only {
            display: none !important;
          }
        }
      `}</style>
      <div className="reports-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Generate Reports ({displayedCards.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => void load()}>
              <RefreshCw size={13} className="mr-1" /> Refresh
            </Button>
            <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => {
              // Simple CSV export for selected reports
              if (selectedReportIds.length === 0) {
                error("Select students to export.");
                return;
              }
              const cardsToExport = reportCards.filter(c => selectedReportIds.includes(c.id));
              if (cardsToExport.length === 0) {
                error("No reports selected for export.");
                return;
              }
              // Build CSV content
              const headers = ["Student Name", "Class", "Term", "Academic Year", "Subject", "Score", "Grade", "Remark"];
              const rows: string[][] = [];
              cardsToExport.forEach(card => {
                card.subjects.forEach(subj => {
                  rows.push([
                    card.studentName,
                    card.classLabel,
                    card.term,
                    card.academicYear,
                    subj.subject,
                    String(subj.score ?? "-"),
                    subj.grade,
                    subj.remark
                  ]);
                });
              });
              const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = window.document.createElement("a");
              link.href = url;
              link.download = `report_${new Date().toISOString().split("T")[0]}.csv`;
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
              URL.revokeObjectURL(url);
              success(`Exported ${cardsToExport.length} report(s) to CSV.`);
            }}>
              <FileDown size={13} className="mr-1" /> Excel
            </Button>
            <Button
              variant="outline"
              className="h-9 px-3 text-xs"
              onClick={() => void bulkExportZip()}
              disabled={isBulkExporting}
            >
              <FileDown size={13} className="mr-1" />{" "}
              {isBulkExporting ? "Exporting..." : "Bulk ZIP"}
            </Button>
            <Button className="h-9 px-3 text-xs bg-rose-600 hover:bg-rose-700" onClick={() => {
              if (selectedReportIds.length === 0) {
                error("Select students to print.");
                return;
              }
              // Find the first selected card and open print modal for it
              const firstSelectedCard = reportCards.find(c => selectedReportIds.includes(c.id));
              if (firstSelectedCard) {
                setActiveReport(firstSelectedCard);
              } else {
                error("No reports selected for printing.");
              }
            }}>
              <FileDown size={13} className="mr-1" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">
              Reports & Filters
            </h3>
            <div className="mt-4 space-y-3">
              <SearchableSelect
                label="Class"
                value={classFilter}
                onChange={setClassFilter}
                options={[
                  { value: "all", label: "All Classes" },
                  ...classOptions.map((option) => ({
                    value: option.id,
                    label: option.label,
                  })),
                ]}
                placeholder="Select class..."
                searchPlaceholder="Search class..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <SearchableSelect
                label="Term"
                value={termFilter}
                onChange={(value) => setTermFilter(value as typeof termFilter)}
                options={[
                  { value: "all", label: "All Terms" },
                  { value: "first_term", label: "First Term" },
                  { value: "second_term", label: "Second Term" },
                  { value: "third_term", label: "Third Term" },
                ]}
                placeholder="Select term..."
                searchPlaceholder="Search term..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <SearchableSelect
                label="Academic Year"
                value={yearFilter}
                onChange={setYearFilter}
                options={[
                  { value: "all", label: "All Years" },
                  ...yearOptions.map((option) => ({
                    value: option.id,
                    label: option.label,
                  })),
                ]}
                placeholder="Select year..."
                searchPlaceholder="Search year..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
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
                  onClick={() =>
                    setSelectedReportIds(
                      filteredStudents.map((student) => student.id),
                    )
                  }
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Select All
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {filteredStudents.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No assessment entries yet.
                  </p>
                )}
                {paginatedStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReportIds.includes(student.id)}
                      onChange={(e) => {
                        setSelectedReportIds((current) =>
                          e.target.checked
                            ? [...current, student.id]
                            : current.filter((id) => id !== student.id),
                        );
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {student.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {student.classLabel} • {student.term}
                      </p>
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
                Assessment entries will appear here once they are saved for a
                class and term.
              </div>
            )}
            {paginatedCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Kaas Montessori School
                    </h4>
                    <p className="text-xs text-slate-500">
                      {card.studentName} • {card.classLabel} •{" "}
                      {formatTerm(card.term)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Academic Year: {card.academicYear}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700">
                      Overall Score: {card.overallScore}%
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {card.ready
                        ? "Ready for view & print"
                        : "Available subjects with assessments"}
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
                        <tr
                          key={row.subject}
                          className="border-t border-slate-100 text-slate-700"
                        >
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
                    Attendance: {card.attendance.present}/
                    {card.attendance.total} ({card.attendance.percent}%)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => setActiveReport(card)}
                      disabled={card.subjects.length === 0}
                    >
                      <Eye size={11} className="mr-1" /> View
                    </Button>
                    <Button
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => markPrinted(card)}
                      disabled={card.subjects.length === 0}
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
      </div>

      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 print-overlay"
            onClick={() => setActiveReport(null)}
          />
          <div
            ref={reportModalRef}
            className="relative flex h-[92vh] w-full max-w-3xl items-start justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print-modal report-theme"
          >
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 print-actions">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:bg-slate-50"
                title="Print"
                onClick={async () => {
                  await markPrinted(activeReport);
                  handlePrint();
                }}
              >
                <Printer size={16} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:bg-slate-50"
                title="Close"
                onClick={() => setActiveReport(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex h-full w-full items-start justify-center overflow-hidden print-content-wrapper">
              <div
                className="report-preview"
                style={{
                  ["--report-scale" as string]: reportScale,
                }}
              >
                <div ref={printRef} className="relative print-modal-content report-theme" id="print-report">
                  <div className="report-watermark print-watermark" aria-hidden="true">
                    <Image
                      src="/KAASLOGO.jpeg"
                      alt="School Logo Watermark"
                      width={400}
                      height={400}
                      style={{ width: "100%", height: "auto" }}
                      unoptimized
                      priority
                    />
                  </div>
                  <div className="flex items-center justify-between px-6 py-4 print-header report-header-bar">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-white/40 bg-white/90">
                        <Image
                          src="/KAASLOGO.jpeg"
                          alt="Kaas logo"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Kaas Montessori School
                        </h3>
                        <p className="text-xs text-white/80">
                          Terminal Report
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-white/80">
                      <p className="font-semibold text-white">
                        Academic Year: {activeReport.academicYear}
                      </p>
                      <p>Term: {formatTerm(activeReport.term)}</p>
                    </div>
                  </div>

                  <div className="space-y-5 p-6 print-area">
                    <div className="rounded-lg border border-slate-200 p-4 text-xs">
                      <p className="text-[11px] font-semibold uppercase report-section-title">
                        Student Details
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
                        <p>
                          <span className="report-label">Student Name:</span>{" "}
                          {activeReport.studentName}
                        </p>
                        <p>
                          <span className="report-label">Class:</span>{" "}
                          {activeReport.classLabel}
                        </p>
                        <p>
                          <span className="report-label">Vacation Date:</span>{" "}
                          {activeReport.vacationDate || "-"}
                        </p>
                        <p>
                          <span className="report-label">Attendance:</span>{" "}
                          {activeReport.attendance.present}/
                          {activeReport.attendance.total} (
                          {activeReport.attendance.percent}%)
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase report-section-title">
                        Academic Performance
                      </p>
                      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs print-table report-table">
                          <thead>
                            <tr>
                              <th className="px-3 py-2">Subject</th>
                              <th className="px-3 py-2">Class Exercise</th>
                              <th className="px-3 py-2">Homework + Project</th>
                              <th className="px-3 py-2">Exam (60%)</th>
                              <th className="px-3 py-2">Total</th>
                              <th className="px-3 py-2">Grade</th>
                              <th className="px-3 py-2">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeReport.subjects.map((row) => (
                              <tr
                                key={row.subject}
                                className="border-t border-slate-100 text-slate-700"
                              >
                                <td className="px-3 py-2 subject">{row.subject}</td>
                                <td className="px-3 py-2">{row.classExercise ?? "-"}</td>
                                <td className="px-3 py-2">{row.homeworkProject ?? "-"}</td>
                                <td className="px-3 py-2">{formatExamWeight(row.exam)}</td>
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
                      <p className="text-[11px] font-semibold uppercase report-section-title">
                        Interpretation Of Score & Grade Mapping
                      </p>
                      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs print-table report-table">
                          <thead>
                            <tr>
                              <th className="px-3 py-2">Score Range</th>
                              <th className="px-3 py-2">Grade</th>
                              <th className="px-3 py-2">Remark</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradeInterpretation.map((row) => (
                              <tr
                                key={row.grade}
                                className="border-t border-slate-100 text-slate-700"
                              >
                                <td className="px-3 py-2">{row.range}</td>
                                <td className="px-3 py-2">{row.grade}</td>
                                <td className="px-3 py-2">{row.remark}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 text-xs">
                      <p className="text-[11px] font-semibold uppercase report-section-title">
                        Summary & Conduct
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-slate-700">
                        <p>
                          <span className="report-label">Overall Score:</span>{" "}
                          {activeReport.overallScore}%
                        </p>
                        <p>
                          <span className="report-label">Overall Grade:</span>{" "}
                          {activeReport.overallGrade}
                        </p>
                        <p>
                          <span className="report-label">Behavior:</span>{" "}
                          {activeReport.behavior}
                        </p>
                        <p>
                          <span className="report-label">Discipline:</span>{" "}
                          {activeReport.discipline}
                        </p>
                        <p>
                          <span className="report-label">Class Position:</span>
                        </p>
                        <p>
                          <span className="report-label">Reopening Date:</span>
                          {" "}
                          {activeReport.reopeningDate || "-"}
                        </p>
                      </div>
                      <p className="mt-3 text-slate-600">{activeReport.summary}</p>
                    </div>

                    <div className="pt-20 text-xs text-slate-600">
                      <div className="mx-auto max-w-[240px]">
                        <div className="h-px w-full bg-slate-300" />
                        <p className="mt-2 text-center">
                          Headmaster&apos;s Signature
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
