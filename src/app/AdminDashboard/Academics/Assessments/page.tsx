"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, FileDown, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Pagination } from "../../../../components/ui/Pagination";
import { Select } from "../../../../components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type AssessmentRow = {
  studentId: string;
  studentName: string;
  classExercise: number;
  homeworkProject: number;
  exam: number;
  total: number;
};

type AssessmentRecord = {
  id: string;
  classId?: string;
  className?: string;
  section?: string;
  subject?: string;
  academicYear?: string | null;
  term?: string;
  maxScore?: number;
  weights?: Record<string, number>;
  rows?: AssessmentRow[];
  assessmentDate?: string;
  savedAt?: string;
  createdAt?: string;
};

type ClassApi = {
  id: string;
  className?: string;
  name?: string;
  section?: string;
};

type SubjectApi = {
  id: string;
  name?: string;
  title?: string;
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

const formatTerm = (term?: string) => {
  if (!term) return "-";
  return term.replace("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const toClassLabel = (record: AssessmentRecord) => `${record.className ?? "Class"}${record.section ?? ""}`.trim();

const normalizeRecord = (item: AssessmentRecord): AssessmentRecord => ({
  ...item,
  className: item.className ?? "Class",
  section: item.section ?? "",
  subject: item.subject ?? "-",
  academicYear: item.academicYear ?? "-",
  term: item.term ?? "-",
  rows: item.rows ?? [],
});

const computeSummary = (rows: AssessmentRow[]) => {
  if (rows.length === 0) {
    return { average: 0, min: 0, max: 0 };
  }
  const totals = rows.map((row) => row.total ?? 0);
  const sum = totals.reduce((acc, value) => acc + value, 0);
  const average = Math.round(sum / totals.length);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  return { average, min, max };
};

export default function AssessmentsPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [records, setRecords] = React.useState<AssessmentRecord[]>([]);
  const [classes, setClasses] = React.useState<ClassApi[]>([]);
  const [subjects, setSubjects] = React.useState<SubjectApi[]>([]);
  const [academicSessions, setAcademicSessions] = React.useState<AcademicSession[]>([]);
  const [termOptions, setTermOptions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeAssessmentId, setActiveAssessmentId] = React.useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);

  const [classFilter, setClassFilter] = React.useState("all");
  const [subjectFilter, setSubjectFilter] = React.useState("all");
  const [termFilter, setTermFilter] = React.useState("all");
  const [yearFilter, setYearFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const [listPage, setListPage] = React.useState(1);
  const [listPageSize, setListPageSize] = React.useState(8);
  const [rowPage, setRowPage] = React.useState(1);
  const [rowPageSize, setRowPageSize] = React.useState(10);

  const [editing, setEditing] = React.useState<AssessmentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AssessmentRecord | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [assessmentsRes, classesRes, subjectsRes, academicMetaRes] = await Promise.allSettled([
        apiRequest<AssessmentRecord[]>(API_ENDPOINTS.assessments),
        apiRequest<ClassApi[]>(API_ENDPOINTS.classes),
        apiRequest<SubjectApi[]>(API_ENDPOINTS.subjects),
        apiRequest<AcademicMeta>(API_ENDPOINTS.academicMeta),
      ]);

      if (assessmentsRes.status !== "fulfilled") {
        throw assessmentsRes.reason;
      }

      const normalized = assessmentsRes.value.map(normalizeRecord);
      setRecords(normalized);
      setClasses(classesRes.status === "fulfilled" ? classesRes.value : []);
      setSubjects(subjectsRes.status === "fulfilled" ? subjectsRes.value : []);
      if (academicMetaRes.status === "fulfilled") {
        setAcademicSessions(academicMetaRes.value.sessions ?? []);
        setTermOptions(academicMetaRes.value.terms ?? []);
      } else {
        setAcademicSessions([]);
        setTermOptions([]);
      }
      if (!activeAssessmentId && normalized.length > 0) {
        setActiveAssessmentId(normalized[0].id);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load assessments.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh data when navigating back to this page
  const pathname = usePathname();
  
  React.useEffect(() => {
    void load();
  }, [pathname]);

  const classOptions = React.useMemo(() => {
    const options = new Set(
      classes.map((item) => `${item.className ?? item.name ?? "Class"}${item.section ?? ""}`.trim()),
    );
    if (options.size === 0) {
      records.forEach((record) => options.add(toClassLabel(record)));
    }
    return Array.from(options)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [classes, records]);

  const subjectOptions = React.useMemo(() => {
    const options = new Set(subjects.map((item) => item.name ?? item.title ?? ""));
    if (options.size === 0) {
      records.forEach((record) => options.add(record.subject ?? ""));
    }
    return Array.from(options)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [subjects, records]);

  const yearOptions = React.useMemo(() => {
    const options = new Set<string>();
    academicSessions.forEach((session) => {
      if (!session.session) return;
      const match = session.session.match(/\d{4}\/\d{4}/);
      options.add(match ? match[0] : session.session);
    });
    if (options.size === 0) {
      records.forEach((record) => options.add(record.academicYear ?? "-"));
    }
    return Array.from(options)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [academicSessions, records]);

  const normalizedTermOptions = React.useMemo(() => {
    if (termOptions.length > 0) return termOptions;
    return ["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"];
  }, [termOptions]);

  const filteredRecords = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const classLabel = toClassLabel(record).toLowerCase();
      const subject = (record.subject ?? "").toLowerCase();
      const year = record.academicYear ?? "";
      const term = record.term ?? "";

      if (classFilter !== "all" && classLabel !== classFilter.toLowerCase()) return false;
      if (subjectFilter !== "all" && subject !== subjectFilter.toLowerCase()) return false;
      if (termFilter !== "all" && term !== termFilter) return false;
      if (yearFilter !== "all" && year !== yearFilter) return false;
      if (query) {
        const haystack = `${classLabel} ${subject} ${year}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [records, classFilter, subjectFilter, termFilter, yearFilter, search]);

  const listTotalPages = Math.max(1, Math.ceil(filteredRecords.length / listPageSize));
  const safeListPage = Math.min(Math.max(1, listPage), listTotalPages);
  const paginatedRecords = filteredRecords.slice((safeListPage - 1) * listPageSize, safeListPage * listPageSize);

  const activeAssessment = records.find((record) => record.id === activeAssessmentId) ?? null;
  const activeRows = activeAssessment?.rows ?? [];
  const rowTotalPages = Math.max(1, Math.ceil(activeRows.length / rowPageSize));
  const safeRowPage = Math.min(Math.max(1, rowPage), rowTotalPages);
  const paginatedRows = activeRows.slice((safeRowPage - 1) * rowPageSize, safeRowPage * rowPageSize);
  const summary = computeSummary(activeRows);

  React.useEffect(() => {
    setListPage(1);
  }, [classFilter, subjectFilter, termFilter, yearFilter, search]);

  React.useEffect(() => {
    setRowPage(1);
  }, [activeAssessmentId]);

  React.useEffect(() => {
    if (filteredRecords.length === 0) {
      setActiveAssessmentId(null);
      return;
    }
    if (activeAssessmentId && filteredRecords.some((record) => record.id === activeAssessmentId)) {
      return;
    }
    setActiveAssessmentId(filteredRecords[0].id);
  }, [filteredRecords, activeAssessmentId]);

  const refreshDetail = async (record: AssessmentRecord) => {
    setIsDetailLoading(true);
    try {
      const detailed = normalizeRecord(
        await apiRequest<AssessmentRecord>(`${API_ENDPOINTS.assessments}/${record.id}`),
      );
      setRecords((current) => current.map((item) => (item.id === record.id ? detailed : item)));
      setActiveAssessmentId(record.id);
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to fetch assessment details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = normalizeRecord(
        await apiRequest<AssessmentRecord>(`${API_ENDPOINTS.assessments}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            className: editing.className,
            section: editing.section,
            subject: editing.subject,
            academicYear: editing.academicYear,
            term: editing.term,
          }),
        }),
      );
      setRecords((current) => current.map((item) => (item.id === editing.id ? updated : item)));
      setEditing(null);
      success("Assessment updated.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to update assessment.");
    }
  };

  const deleteAssessment = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiRequest(`${API_ENDPOINTS.assessments}/${deleteTarget.id}`, { method: "DELETE" });
      setRecords((current) => current.filter((item) => item.id !== deleteTarget.id));
      if (activeAssessmentId === deleteTarget.id) {
        setActiveAssessmentId(null);
      }
      setDeleteTarget(null);
      success("Assessment deleted.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to delete assessment.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout loading={isLoading}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Assessment Studio</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Assessments & Transcripts</h2>
              <p className="mt-1 text-sm text-slate-500">Manage assessments, view class transcripts, and edit records in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => void load()}>
                <RefreshCw size={13} className="mr-1" /> Refresh
              </Button>
              <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => router.push("/AdminDashboard/Academics") }>
                <FileDown size={13} className="mr-1" /> New Assessment
              </Button>
              <Button className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
                <FileDown size={13} className="mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {filteredRecords.length} records
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <Select
                label="Class"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                options={[{ value: "all", label: "All Classes" }, ...classOptions]}
              />
              <Select
                label="Subject"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                options={[{ value: "all", label: "All Subjects" }, ...subjectOptions]}
              />
              <Select
                label="Term"
                value={termFilter}
                onChange={(event) => setTermFilter(event.target.value)}
                options={[
                  { value: "all", label: "All Terms" },
                  ...normalizedTermOptions.map((term) => ({
                    value: term,
                    label: formatTerm(term),
                  })),
                ]}
              />
              <Select
                label="Academic Year"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                options={[{ value: "all", label: "All Years" }, ...yearOptions]}
              />
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search class or subject"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Assessments</span>
                <span>{filteredRecords.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {paginatedRecords.length === 0 && (
                  <p className="text-xs text-slate-400">No assessments available.</p>
                )}
                {paginatedRecords.map((record) => {
                  const classLabel = toClassLabel(record);
                  const isActive = record.id === activeAssessmentId;
                  const studentsCount = record.rows?.length ?? 0;
                  return (
                    <button
                      key={record.id}
                      onClick={() => setActiveAssessmentId(record.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${isActive
                        ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-800">{classLabel}</p>
                        <span className="text-[10px] text-slate-400">{studentsCount} students</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{record.subject}</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">{formatTerm(record.term)}</span>
                        <span>{record.academicYear}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <Pagination
                  totalItems={filteredRecords.length}
                  currentPage={safeListPage}
                  pageSize={listPageSize}
                  onPageChange={setListPage}
                  onPageSizeChange={(size) => {
                    setListPageSize(size);
                    setListPage(1);
                  }}
                  pageSizeOptions={[8, 16, 24]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {!activeAssessment && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Select an assessment to view the transcript.
              </div>
            )}

            {activeAssessment && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Assessment Transcript</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{toClassLabel(activeAssessment)}</h3>
                    <p className="text-sm text-slate-500">
                      {activeAssessment.subject} • {formatTerm(activeAssessment.term)} • {activeAssessment.academicYear}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => void refreshDetail(activeAssessment)}
                      disabled={isDetailLoading}
                    >
                      <Eye size={12} className="mr-1" /> {isDetailLoading ? "Loading..." : "Fetch Details"}
                    </Button>
                    <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setEditing(activeAssessment)}>
                      <Pencil size={12} className="mr-1" /> Edit
                    </Button>
                    <Button
                      className="h-8 px-3 text-xs bg-rose-600 hover:bg-rose-700"
                      onClick={() => setDeleteTarget(activeAssessment)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Students</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{activeRows.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Average</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{summary.average}%</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Range</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{summary.min}% - {summary.max}%</p>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Class Exercise</th>
                          <th className="px-4 py-3">Homework + Project</th>
                          <th className="px-4 py-3">Exam</th>
                          <th className="px-4 py-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                              {isDetailLoading ? "Fetching details..." : "No rows available yet."}
                            </td>
                          </tr>
                        )}
                        {paginatedRows.map((row) => (
                          <tr key={row.studentId} className="border-t border-slate-100 text-slate-700">
                            <td className="px-4 py-3 font-medium">{row.studentName}</td>
                            <td className="px-4 py-3">{row.classExercise}</td>
                            <td className="px-4 py-3">{row.homeworkProject}</td>
                            <td className="px-4 py-3">{row.exam}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
                    <Pagination
                      totalItems={activeRows.length}
                      currentPage={safeRowPage}
                      pageSize={rowPageSize}
                      onPageChange={setRowPage}
                      onPageSizeChange={(size) => {
                        setRowPageSize(size);
                        setRowPage(1);
                      }}
                      pageSizeOptions={[10, 20, 50]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Assessment</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Class"
                value={editing.className ?? ""}
                onChange={(event) => setEditing((current) => (current ? { ...current, className: event.target.value } : current))}
              />
              <Input
                label="Section"
                value={editing.section ?? ""}
                onChange={(event) => setEditing((current) => (current ? { ...current, section: event.target.value } : current))}
              />
              <Input
                label="Subject"
                value={editing.subject ?? ""}
                onChange={(event) => setEditing((current) => (current ? { ...current, subject: event.target.value } : current))}
              />
              <Input
                label="Academic Year"
                value={editing.academicYear ?? ""}
                onChange={(event) => setEditing((current) => (current ? { ...current, academicYear: event.target.value } : current))}
              />
              <Select
                label="Term"
                value={editing.term ?? ""}
                onChange={(event) => setEditing((current) => (current ? { ...current, term: event.target.value } : current))}
                options={[
                  { value: "FIRST_TERM", label: "First Term" },
                  { value: "SECOND_TERM", label: "Second Term" },
                  { value: "THIRD_TERM", label: "Third Term" },
                ]}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => void saveEdit()}>
                Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-rose-200 bg-white shadow-2xl"
          >
            <div className="border-b border-rose-100 bg-rose-50 px-6 py-4">
              <h3 className="text-base font-bold text-rose-900">Delete Assessment</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-700">Are you sure you want to delete this assessment?</p>
              <p className="mt-2 text-xs text-slate-500">This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => void deleteAssessment()} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
