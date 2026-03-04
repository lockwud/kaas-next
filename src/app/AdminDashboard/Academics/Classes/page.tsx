"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, FileX2, MoreVertical, Pencil, Trash2,
  Search, School, Users, UserCheck, Layers, X,
} from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapClass = (item: ClassApi): ClassRow => ({
  id: item.id,
  className: item.className ?? item.name ?? "Unnamed Class",
  section: item.section ?? "-",
  classTeacher: item.classTeacherName ?? item.classTeacher?.fullName ?? "Unassigned",
  students: item.studentsCount ?? 0,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<ClassRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [openActionRowId, setOpenActionRowId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ClassRow | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close action menu on outside click
  React.useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-action-root='true']")) {
        setOpenActionRowId(null);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const deleteClass = async (id: string) => {
    setRemovingId(id);
    try {
      await apiRequest(`${API_ENDPOINTS.classes}/${id}`, { method: "DELETE" });
      setRows((current) => current.filter((row) => row.id !== id));
      setDeleteTarget(null);
      success("Class deleted.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to delete class.");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.className.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q) ||
        r.classTeacher.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const totalStudentsCount = rows.reduce((acc, r) => acc + r.students, 0);
  const assignedTeachersCount = Array.from(
    new Set(rows.filter((r) => r.classTeacher !== "Unassigned").map((r) => r.classTeacher)),
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Classes Directory</h2>
            <p className="text-slate-500 text-sm mt-1">
              Manage all school classes, sections, and assigned teachers.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Classes", value: rows.length, icon: <School size={18} />, color: "bg-blue-50 text-blue-700" },
            { label: "Total Students", value: totalStudentsCount, icon: <Users size={18} />, color: "bg-emerald-50 text-emerald-700" },
            { label: "Teachers Assigned", value: assignedTeachersCount, icon: <UserCheck size={18} />, color: "bg-violet-50 text-violet-700" },
            { label: "Sections", value: Array.from(new Set(rows.map((r) => r.section))).length, icon: <Layers size={18} />, color: "bg-amber-50 text-amber-700" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 flex items-center gap-3 shadow-sm`}>
              <span className="opacity-70 shrink-0">{stat.icon}</span>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by class name, section, or teacher…"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <p className="text-xs font-semibold text-slate-400 whitespace-nowrap hidden sm:block">
            Showing {filtered.length} records
          </p>
        </div>

        {/* Table */}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                      Loading classes…
                    </td>
                  </tr>
                ) : (
                  <>
                    {paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.className}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                            {row.section}
                          </span>
                        </td>
                        <td className="px-4 py-3">{row.classTeacher}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">{row.students}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block" data-action-root="true">
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                              onClick={() =>
                                setOpenActionRowId(row.id === openActionRowId ? null : row.id)
                              }
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openActionRowId === row.id && (
                              <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                <button
                                  onClick={() => { setDeleteTarget(row); setOpenActionRowId(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="h-52 px-4 py-8">
                          <div className="flex flex-col items-center justify-center text-center gap-3">
                            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                              <FileX2 size={28} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-700">No classes found</p>
                              <p className="text-sm text-slate-400 mt-1">
                                Try adjusting your search criteria.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/30">
              <Pagination
                totalItems={filtered.length}
                currentPage={safeCurrentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                pageSizeOptions={[10, 20, 50]}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-center text-lg font-bold text-slate-900">Delete Class?</h4>
              <p className="mt-2 text-center text-sm text-slate-500 leading-relaxed">
                You are about to remove{" "}
                <span className="font-bold text-slate-700">
                  {deleteTarget.className} {deleteTarget.section}
                </span>
                . This action cannot be reversed.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setDeleteTarget(null)}
                  disabled={!!removingId}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-11 bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => void deleteClass(deleteTarget.id)}
                  disabled={!!removingId}
                >
                  {removingId === deleteTarget.id ? "Deleting…" : "Yes, Delete"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
