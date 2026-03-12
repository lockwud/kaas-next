"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type ClassRow = {
  id: string;
  className: string;
  section: string;
  classTeacher: string;
  students: number;
};

type ClassApi = {
  id: string;
  className?: string;
  name?: string;
  section?: string;
  classTeacherName?: string;
  classTeacher?: { fullName?: string };
  studentsCount?: number;
};

const mapClass = (item: ClassApi): ClassRow => ({
  id: item.id,
  className: item.className ?? item.name ?? "Unnamed Class",
  section: item.section ?? "-",
  classTeacher: item.classTeacherName ?? item.classTeacher?.fullName ?? "Unassigned",
  students: item.studentsCount ?? 0,
});

export default function ClassesPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<ClassRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await apiRequest<ClassApi[]>(API_ENDPOINTS.classes);
      setRows(payload.map(mapClass));
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load classes.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
    // Load once on mount to avoid repeated toast loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const deleteClass = async (id: string) => {
    setRemovingId(id);
    try {
      await apiRequest(`${API_ENDPOINTS.classes}/${id}`, { method: "DELETE" });
      setRows((current) => current.filter((row) => row.id !== id));
      success("Class deleted.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to delete class.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Classes Directory</h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Class Name</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Class Teacher</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  paginatedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{row.className}</td>
                      <td className="px-4 py-3">{row.section}</td>
                      <td className="px-4 py-3">{row.classTeacher}</td>
                      <td className="px-4 py-3">{row.students}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50"
                          onClick={() => void deleteClass(row.id)}
                          disabled={removingId === row.id}
                        >
                          <Trash2 size={13} className="mr-1" /> {removingId === row.id ? "Deleting..." : "Delete"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No class records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              totalItems={rows.length}
              currentPage={safeCurrentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
