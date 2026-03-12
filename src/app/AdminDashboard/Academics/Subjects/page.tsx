"use client";

import React from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type SubjectRow = {
  id: string;
  name: string;
  code: string;
  category: string;
};

type SubjectApi = {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  category?: string;
};

const toSubjectRow = (item: SubjectApi): SubjectRow => ({
  id: item.id,
  name: item.name ?? item.title ?? "Unnamed Subject",
  code: item.code ?? "-",
  category: item.category ?? "General",
});

export default function SubjectsPage() {
  const { error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [rows, setRows] = React.useState<SubjectRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const payload = await apiRequest<SubjectApi[]>(API_ENDPOINTS.subjects);
      setRows(payload.map(toSubjectRow));
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load subjects.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void loadSubjects();
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

  return (
    <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Subjects Directory</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  paginatedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.code}</td>
                      <td className="px-4 py-3">{row.category}</td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">
                      No subject records found.
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
