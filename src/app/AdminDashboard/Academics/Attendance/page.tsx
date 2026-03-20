"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, RefreshCw, Save, Search } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Pagination } from "../../../../components/ui/Pagination";
import { Select } from "../../../../components/ui/Select";
import { SearchableSelect } from "../../../../components/ui/SearchableSelect";
import { useToast } from "@/hooks/useToast";
import { apiRequest, ApiRequestError } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import type { AttendanceRecord, VacationDateRecord } from "@/lib/attendance-types";

type ClassApi = {
  id: string;
  className?: string;
  name?: string;
  section?: string;
};

type StudentApi = {
  id: string;
  fullName?: string;
  className?: string;
  section?: string;
  classId?: string;
  admissionNo?: string;
};

type AcademicSession = {
  id: string;
  session?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

type AcademicMeta = {
  sessions: AcademicSession[];
  terms: string[];
};

type AttendanceRow = {
  id: string;
  name: string;
  admissionNo: string;
  classLabel: string;
  present: number;
  percent: number;
};

const normalizeTerm = (term?: string) => {
  if (!term) return "";
  return term.trim().toLowerCase().replace(/\s+/g, "_");
};

const formatTerm = (term?: string) => {
  if (!term) return "-";
  return term.replace("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildClassLabel = (item?: ClassApi | null) => {
  if (!item) return "";
  const className = item.className ?? item.name ?? "Class";
  const section = item.section ?? "";
  return `${className} ${section}`.trim();
};

const parseNumber = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function AttendancePage() {
  const { success, error } = useToast();
  const [classes, setClasses] = React.useState<ClassApi[]>([]);
  const [students, setStudents] = React.useState<StudentApi[]>([]);
  const [terms, setTerms] = React.useState<string[]>([]);
  const [academicSessions, setAcademicSessions] = React.useState<AcademicSession[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [selectedTerm, setSelectedTerm] = React.useState("first_term");
  const [selectedYear, setSelectedYear] = React.useState("");
  const [attendanceTotal, setAttendanceTotal] = React.useState(90);
  const [attendanceDate, setAttendanceDate] = React.useState("");
  const [attendanceEntries, setAttendanceEntries] = React.useState<Record<string, number>>({});
  const [vacationDate, setVacationDate] = React.useState("");
  const [studentSearch, setStudentSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingAttendance, setIsSavingAttendance] = React.useState(false);
  const [isSavingVacation, setIsSavingVacation] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const load = async () => {
    setIsLoading(true);
    try {
      const [classesPayload, studentsPayload, academicMetaPayload] = await Promise.all([
        apiRequest<ClassApi[]>(API_ENDPOINTS.classes),
        apiRequest<StudentApi[]>(API_ENDPOINTS.students).catch(() => []),
        apiRequest<AcademicMeta>(API_ENDPOINTS.academicMeta).catch(() => ({ sessions: [], terms: [] })),
      ]);

      setClasses(classesPayload);
      setStudents(studentsPayload);
      setAcademicSessions(academicMetaPayload.sessions ?? []);
      const termOptions = (academicMetaPayload.terms ?? []).map((term) => term.toLowerCase());
      setTerms(termOptions.length ? termOptions : ["first_term", "second_term", "third_term"]);

      const activeSession = academicMetaPayload.sessions?.find((item) => item.status === "Active");
      if (activeSession?.session) {
        setSelectedYear(activeSession.session);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load attendance directory.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedClass = React.useMemo(
    () => classes.find((item) => item.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const selectedClassLabel = React.useMemo(
    () => buildClassLabel(selectedClass),
    [selectedClass],
  );

  const filteredStudents = React.useMemo(() => {
    if (!selectedClass) return [] as StudentApi[];

    const className = selectedClass.className ?? selectedClass.name ?? "";
    const section = (selectedClass.section ?? "").toLowerCase();

    return students.filter((student) => {
      if (student.classId && student.classId === selectedClass.id) return true;
      const studentClassName = (student.className ?? "").toLowerCase();
      const studentSection = (student.section ?? "").toLowerCase();
      if (!className) return false;
      if (section) {
        return studentClassName === className.toLowerCase() && studentSection === section;
      }
      return studentClassName === className.toLowerCase();
    });
  }, [students, selectedClass]);

  const searchedStudents = React.useMemo(() => {
    if (!studentSearch.trim()) return filteredStudents;
    const query = studentSearch.trim().toLowerCase();
    return filteredStudents.filter((student) => (student.fullName ?? "").toLowerCase().includes(query));
  }, [filteredStudents, studentSearch]);

  const attendanceRows = React.useMemo<AttendanceRow[]>(() => {
    return searchedStudents.map((student) => {
      const present = attendanceEntries[student.id] ?? 0;
      const total = Math.max(1, attendanceTotal);
      const percent = Math.min(100, Math.max(0, Math.round((present / total) * 100)));
      const classLabel = `${student.className ?? ""} ${student.section ?? ""}`.trim() || selectedClassLabel;
      return {
        id: student.id,
        name: student.fullName ?? "Unnamed Student",
        admissionNo: student.admissionNo ?? "-",
        classLabel: classLabel || "-",
        present,
        percent,
      };
    });
  }, [attendanceEntries, attendanceTotal, searchedStudents, selectedClassLabel]);

  const totalPages = Math.max(1, Math.ceil(attendanceRows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = attendanceRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadAttendance = React.useCallback(async () => {
    if (!selectedClassId || !selectedTerm || !selectedYear) return;

    try {
      const params = new URLSearchParams({
        classId: selectedClassId,
        term: selectedTerm,
        academicYear: selectedYear,
      });
      const record = await apiRequest<AttendanceRecord>(`${API_ENDPOINTS.attendance}?${params.toString()}`);
      setAttendanceTotal(record.total ?? 0);
      setAttendanceDate(record.date ?? "");
      const entryMap: Record<string, number> = {};
      record.entries?.forEach((entry) => {
        entryMap[entry.studentId] = entry.present;
      });
      setAttendanceEntries(entryMap);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        setAttendanceEntries({});
      } else if (err instanceof ApiRequestError) {
        error(err.message);
      }
    }
  }, [selectedClassId, selectedTerm, selectedYear, error]);

  const loadVacationDate = React.useCallback(async () => {
    if (!selectedTerm || !selectedYear) return;
    try {
      const params = new URLSearchParams({
        term: selectedTerm,
        academicYear: selectedYear,
      });
      const record = await apiRequest<VacationDateRecord>(`${API_ENDPOINTS.vacationDates}?${params.toString()}`);
      setVacationDate(record.vacationDate ?? "");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    }
  }, [selectedTerm, selectedYear, error]);

  React.useEffect(() => {
    void loadAttendance();
    void loadVacationDate();
  }, [loadAttendance, loadVacationDate]);

  React.useEffect(() => {
    if (!selectedClassId) {
      setAttendanceEntries({});
      return;
    }

    setAttendanceEntries((current) => {
      const next = { ...current };
      filteredStudents.forEach((student) => {
        if (next[student.id] === undefined) {
          next[student.id] = 0;
        }
      });
      return next;
    });
  }, [filteredStudents, selectedClassId]);

  const handleAttendanceChange = (studentId: string, value: string) => {
    const parsed = parseNumber(value);
    const clamped = Math.max(0, Math.min(parsed, attendanceTotal));
    setAttendanceEntries((current) => ({ ...current, [studentId]: clamped }));
  };

  const saveAttendance = async () => {
    if (!selectedClassId) {
      error("Select a class first.");
      return;
    }
    if (!selectedTerm || !selectedYear) {
      error("Select term and academic year.");
      return;
    }
    if (attendanceTotal <= 0) {
      error("Total attendance must be greater than zero.");
      return;
    }

    const payload: AttendanceRecord = {
      classId: selectedClassId,
      classLabel: selectedClassLabel,
      term: selectedTerm,
      academicYear: selectedYear,
      total: attendanceTotal,
      date: attendanceDate || undefined,
      entries: filteredStudents.map((student) => ({
        studentId: student.id,
        present: Math.max(0, Math.min(attendanceEntries[student.id] ?? 0, attendanceTotal)),
      })),
      updatedAt: new Date().toISOString(),
    };

    setIsSavingAttendance(true);
    try {
      await apiRequest(API_ENDPOINTS.attendance, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      success("Attendance saved successfully.");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const saveVacationDate = async () => {
    if (!selectedTerm || !selectedYear) {
      error("Select term and academic year.");
      return;
    }
    if (!vacationDate) {
      error("Select a vacation date.");
      return;
    }

    const payload: VacationDateRecord = {
      term: selectedTerm,
      academicYear: selectedYear,
      vacationDate,
      updatedAt: new Date().toISOString(),
    };

    setIsSavingVacation(true);
    try {
      await apiRequest(API_ENDPOINTS.vacationDates, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      success("Vacation date saved.");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    } finally {
      setIsSavingVacation(false);
    }
  };

  return (
    <DashboardLayout loading={isLoading}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Attendance Tracking</h2>
            <p className="text-sm text-slate-500 mt-1">Select a class and record attendance totals for each student.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 px-3" onClick={() => void loadAttendance()}>
              <RefreshCw size={14} className="mr-2" /> Refresh
            </Button>
            <Button className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => void saveAttendance()} disabled={isSavingAttendance}>
              <Save size={14} className="mr-2" /> {isSavingAttendance ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Attendance Setup</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SearchableSelect
                label="Class"
                value={selectedClassId}
                onChange={setSelectedClassId}
                options={classes.map((item) => ({
                  value: item.id,
                  label: buildClassLabel(item) || "Class",
                }))}
                placeholder="Select class..."
                searchPlaceholder="Search class..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <SearchableSelect
                label="Term"
                value={selectedTerm}
                onChange={(value) => setSelectedTerm(normalizeTerm(value))}
                options={terms.map((term) => ({
                  value: normalizeTerm(term),
                  label: formatTerm(term),
                }))}
                placeholder="Select term..."
                searchPlaceholder="Search term..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <SearchableSelect
                label="Academic Year"
                value={selectedYear}
                onChange={setSelectedYear}
                options={academicSessions.map((session) => ({
                  value: session.session ?? session.id,
                  label: session.session ?? session.id,
                }))}
                placeholder="Select year..."
                searchPlaceholder="Search year..."
                enableSearch={true}
                enablePagination={true}
                pageSize={5}
              />
              <Input
                label="Total Attendance"
                type="number"
                min={1}
                value={attendanceTotal}
                onChange={(e) => setAttendanceTotal(parseNumber(e.target.value))}
              />
              <Input
                label="Attendance Date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
              <div className="flex items-end">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Calendar size={14} />
                    {selectedClassLabel || "Select class"}
                  </div>
                  <p className="mt-1">{attendanceRows.length} student(s) loaded</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Vacation Date</h3>
            <p className="text-xs text-slate-500 mt-1">Set the vacation date to show on terminal reports.</p>
            <div className="mt-4 space-y-3">
              <Input
                label="Vacation Date"
                type="date"
                value={vacationDate}
                onChange={(e) => setVacationDate(e.target.value)}
              />
              <Button
                className="h-10 w-full bg-slate-900 hover:bg-slate-800"
                onClick={() => void saveVacationDate()}
                disabled={isSavingVacation}
              >
                {isSavingVacation ? "Saving..." : "Save Vacation Date"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Student Attendance</h3>
              <p className="text-xs text-slate-500">Enter present days for each student.</p>
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Admission No</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">Percent</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{row.admissionNo}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{row.classLabel}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={attendanceTotal}
                        value={row.present}
                        onChange={(e) => handleAttendanceChange(row.id, e.target.value)}
                        className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-600">{row.percent}%</td>
                  </tr>
                ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      {selectedClassId ? "No students found for this class." : "Select a class to load students."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <Pagination
              totalItems={attendanceRows.length}
              currentPage={safeCurrentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
