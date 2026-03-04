"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type StudentRow = {
  id: string;
  fullName: string;
  className: string;
  guardianName: string;
  guardianContact: string;
  admissionDate: string;
};

type StudentApi = {
  id: string;
  fullName?: string;
  name?: string;
  className?: string;
  section?: string;
  guardianName?: string;
  guardianPrimaryContact?: string;
  guardianPhone?: string;
  admissionDate?: string;
};

const mapStudent = (item: StudentApi): StudentRow => ({
  id: item.id,
  fullName: item.fullName ?? item.name ?? "Unnamed Student",
  className: item.className ? `${item.className}${item.section ?? ""}` : "Assign Later",
  guardianName: item.guardianName ?? "Not Assigned",
  guardianContact: item.guardianPrimaryContact ?? item.guardianPhone ?? "-",
  admissionDate: item.admissionDate ? new Date(item.admissionDate).toLocaleDateString() : "-",
});

export default function StudentsDirectoryPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [promotingId, setPromotingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await apiRequest<StudentApi[]>(API_ENDPOINTS.students);
      setRows(payload.map(mapStudent));
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to load students.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
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

  const promoteStudent = async (studentId: string) => {
    setPromotingId(studentId);
    try {
      await apiRequest(`${API_ENDPOINTS.students}/${studentId}/promote`, { method: "POST" });
      success("Student promoted.");
      await load();
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to promote student.");
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Students Directory</h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Admission Date</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Guardian Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  paginatedRows.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{student.fullName}</td>
                      <td className="px-4 py-3">{student.className}</td>
                      <td className="px-4 py-3">{student.admissionDate}</td>
                      <td className="px-4 py-3">{student.guardianName}</td>
                      <td className="px-4 py-3">{student.guardianContact}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          disabled={promotingId === student.id}
                          onClick={() => void promoteStudent(student.id)}
                        >
                          <Award size={13} className="mr-1" /> {promotingId === student.id ? "Promoting..." : "Promote"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No student records found.
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
