"use client";

import React from "react";
import { Pencil, Printer, Plus, X, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssessmentRow = {
  id: string;
  className: string;
  section: string;
  subject: string;
  academicYear: string;
  term: string;
  printed: boolean;
};

type AssessmentApi = {
  id: string;
  className?: string;
  section?: string;
  subject?: string;
  academicYear?: string;
  term?: string;
  printedAt?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapAssessment = (item: AssessmentApi): AssessmentRow => ({
  id: item.id,
  className: item.className ?? "-",
  section: item.section ?? "",
  subject: item.subject ?? "-",
  academicYear: item.academicYear ?? "-",
  term: item.term ?? "-",
  printed: Boolean(item.printedAt),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<AssessmentRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<AssessmentRow | null>(null);
  const [classFilter, setClassFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState("");

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await apiRequest<AssessmentApi[]>(API_ENDPOINTS.assessments);
      setRows(payload.map(mapAssessment));
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = React.useMemo(
    () =>
      rows.filter((row) => {
        const classKey = `${row.className}${row.section}`;
        if (classFilter && classKey !== classFilter) return false;
        if (subjectFilter && row.subject !== subjectFilter) return false;
        if (yearFilter && row.academicYear !== yearFilter) return false;
        return true;
      }),
    [rows, classFilter, subjectFilter, yearFilter],
  );

  const classOptions = React.useMemo(
    () =>
      Array.from(new Set(rows.map((r) => `${r.className}${r.section}`))).map((v) => ({
        value: v,
        label: v,
      })),
    [rows],
  );

  const subjectOptions = React.useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.subject))).map((v) => ({ value: v, label: v })),
    [rows],
  );

  const yearOptions = React.useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.academicYear))).map((v) => ({ value: v, label: v })),
    [rows],
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = await apiRequest<AssessmentApi>(
        `${API_ENDPOINTS.assessments}/${editing.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            className: editing.className,
            section: editing.section,
            subject: editing.subject,
            academicYear: editing.academicYear,
            term: editing.term,
          }),
        },
      );
      setRows((current) =>
        current.map((item) => (item.id === editing.id ? mapAssessment(updated) : item)),
      );
      setEditing(null);
      success("Assessment updated.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to update assessment.");
    }
  };

  const togglePrinted = async (row: AssessmentRow) => {
    try {
      const updated = await apiRequest<AssessmentApi>(
        `${API_ENDPOINTS.assessments}/${row.id}/mark-printed`,
        {
          method: "POST",
          body: JSON.stringify({ printed: !row.printed }),
        },
      );
      setRows((current) =>
        current.map((item) => (item.id === row.id ? mapAssessment(updated) : item)),
      );
      success(!row.printed ? "Marked as printed." : "Marked as not printed.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to update print status.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage assessments by class, subject, and academic year.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Select
              label="Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={classOptions}
            />
            <Select
              label="Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              options={subjectOptions}
            />
            <Select
              label="Academic Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              options={yearOptions}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Printed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      Loading assessments…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No assessments found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {`${record.className} ${record.section}`.trim() || "-"}
                      </td>
                      <td className="px-4 py-3">{record.subject}</td>
                      <td className="px-4 py-3">{record.academicYear}</td>
                      <td className="px-4 py-3">{record.term}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${record.printed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                            }`}
                        >
                          {record.printed ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => setEditing(record)}
                          >
                            <Pencil size={13} className="mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => void togglePrinted(record)}
                          >
                            <Printer size={13} className="mr-1" />
                            {record.printed ? "Unprint" : "Mark Printed"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Assessment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update the details for this assessment record.
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Class"
                    value={editing.className}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, className: event.target.value } : current,
                      )
                    }
                  />
                  <Input
                    label="Section"
                    value={editing.section}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, section: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Subject"
                    value={editing.subject}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, subject: event.target.value } : current,
                      )
                    }
                  />
                  <Input
                    label="Academic Year"
                    value={editing.academicYear}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, academicYear: event.target.value } : current,
                      )
                    }
                  />
                </div>
                <Input
                  label="Term"
                  value={editing.term}
                  onChange={(event) =>
                    setEditing((current) =>
                      current ? { ...current, term: event.target.value } : current,
                    )
                  }
                />
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => void saveEdit()}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
