"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type AssessmentRow = {
  id: string;
  className: string;
  section: string;
  subject: string;
  academicYear: string;
  term: string;
};

type AssessmentApi = {
  id: string;
  className?: string;
  section?: string;
  subject?: string;
  academicYear?: string;
  term?: string;
};

const formatTerm = (term?: string) => {
  if (!term) return "-";
  return term.replace("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const mapAssessment = (item: AssessmentApi): AssessmentRow => ({
  id: item.id,
  className: item.className ?? "-",
  section: item.section ?? "",
  subject: item.subject ?? "-",
  academicYear: item.academicYear ?? "-",
  term: item.term ?? "-",
});

export default function AssessmentsPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<AssessmentRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<AssessmentRow | null>(null);
  const [classFilter, setClassFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState("");

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

  const filtered = React.useMemo(
    () =>
      rows.filter((row) => {
        if (classFilter && `${row.className}${row.section}` !== classFilter) return false;
        if (subjectFilter && row.subject !== subjectFilter) return false;
        if (yearFilter && row.academicYear !== yearFilter) return false;
        return true;
      }),
    [rows, classFilter, subjectFilter, yearFilter],
  );

  const classOptions = Array.from(new Set(rows.map((row) => `${row.className}${row.section}`))).map((value) => ({ value, label: value }));
  const subjectOptions = Array.from(new Set(rows.map((row) => row.subject))).map((value) => ({ value, label: value }));
  const yearOptions = Array.from(new Set(rows.map((row) => row.academicYear))).map((value) => ({ value, label: value }));

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = await apiRequest<AssessmentApi>(`${API_ENDPOINTS.assessments}/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          className: editing.className,
          section: editing.section,
          subject: editing.subject,
          academicYear: editing.academicYear,
          term: editing.term,
        }),
      });
      setRows((current) => current.map((item) => (item.id === editing.id ? mapAssessment(updated) : item)));
      setEditing(null);
      success("Assessment updated.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to update assessment.");
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Assessments</h2>
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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  filtered.map((record) => (
                    <tr key={record.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-4 py-3 font-medium">{`${record.className}${record.section}`.trim()}</td>
                      <td className="px-4 py-3">{record.subject}</td>
                      <td className="px-4 py-3">{record.academicYear}</td>
                      <td className="px-4 py-3">{formatTerm(record.term)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => setEditing(record)}>
                            <Pencil size={13} className="mr-1" /> Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No assessments found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Assessment</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Class" value={editing.className} onChange={(event) => setEditing((current) => (current ? { ...current, className: event.target.value } : current))} />
              <Input label="Section" value={editing.section} onChange={(event) => setEditing((current) => (current ? { ...current, section: event.target.value } : current))} />
              <Input label="Subject" value={editing.subject} onChange={(event) => setEditing((current) => (current ? { ...current, subject: event.target.value } : current))} />
              <Input label="Academic Year" value={editing.academicYear} onChange={(event) => setEditing((current) => (current ? { ...current, academicYear: event.target.value } : current))} />
              <Select
                label="Term"
                value={editing.term}
                onChange={(event) => setEditing((current) => (current ? { ...current, term: event.target.value } : current))}
                options={[
                  { value: "FIRST_TERM", label: "First Term" },
                  { value: "SECOND_TERM", label: "Second Term" },
                  { value: "THIRD_TERM", label: "Third Term" }
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
    </DashboardLayout>
  );
}
