"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Eye, UserPlus, X, MoreHorizontal } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Pagination } from "../../../../components/ui/Pagination";
import { Select } from "../../../../components/ui/Select";
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

const subjectCategories = [
  { value: "General", label: "General" },
  { value: "Science", label: "Science" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Languages", label: "Languages" },
  { value: "Humanities", label: "Humanities" },
  { value: "Technical", label: "Technical" },
  { value: "Creative Arts", label: "Creative Arts" },
  { value: "Physical Education", label: "Physical Education" },
];

export default function SubjectsPage() {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [rows, setRows] = React.useState<SubjectRow[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal states
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<SubjectRow | null>(null);

  // Form states
  const [formName, setFormName] = React.useState("");
  const [formCode, setFormCode] = React.useState("");
  const [formCategory, setFormCategory] = React.useState("General");
  const [formError, setFormError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

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

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const deleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await apiRequest(`${API_ENDPOINTS.subjects}/${id}`, { method: "DELETE" });
      setRows((current) => current.filter((row) => row.id !== id));
      success("Subject deleted.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Unable to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open modals
  const openAddModal = () => {
    setFormName("");
    setFormCode("");
    setFormCategory("General");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (subject: SubjectRow) => {
    setSelectedSubject(subject);
    setFormName(subject.name);
    setFormCode(subject.code === "-" ? "" : subject.code);
    setFormCategory(subject.category);
    setFormError("");
    setIsEditModalOpen(true);
  };

  const openViewModal = (subject: SubjectRow) => {
    setSelectedSubject(subject);
    setIsViewModalOpen(true);
  };

  // Handle add subject
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Subject name is required.");
      return;
    }
    if (!formCode.trim()) {
      setFormError("Subject code is required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const newSubject = await apiRequest<SubjectApi>(API_ENDPOINTS.subjects, {
        method: "POST",
        body: JSON.stringify({
          name: formName.trim(),
          code: formCode.trim(),
          category: formCategory,
        }),
      });
      
      // Add to local state
      setRows(prev => [...prev, toSubjectRow(newSubject)]);
      setIsAddModalOpen(false);
      success("Subject added successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to add subject.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit subject
  const handleEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !selectedSubject) {
      setFormError("Subject name is required.");
      return;
    }
    if (!formCode.trim()) {
      setFormError("Subject code is required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      await apiRequest(`${API_ENDPOINTS.subjects}/${selectedSubject.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: formName.trim(),
          code: formCode.trim(),
          category: formCategory,
        }),
      });
      
      // Update local state
      setRows(prev => prev.map(row => 
        row.id === selectedSubject.id 
          ? {
              ...row,
              name: formName.trim(),
              code: formCode.trim() || "-",
              category: formCategory,
            }
          : row
      ));
      setIsEditModalOpen(false);
      success("Subject updated successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to update subject.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout loading={isLoading}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Subjects Directory</h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  paginatedRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.code}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative">
                          <button
                            className="rounded p-1 hover:bg-slate-100"
                            aria-label="Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === row.id ? null : row.id);
                            }}
                          >
                            <MoreHorizontal size={18} className="text-slate-400" />
                          </button>

                          {actionMenuOpen === row.id && (
                            <div
                              className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  openAddModal();
                                  setActionMenuOpen(null);
                                }}
                              >
                                <UserPlus size={14} className="mr-2" /> Add New
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  openViewModal(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Eye size={14} className="mr-2" /> View Details
                              </button>
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  openEditModal(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Pencil size={14} className="mr-2" /> Edit Subject
                              </button>
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  void deleteSubject(row.id);
                                  setActionMenuOpen(null);
                                }}
                                disabled={deletingId === row.id}
                              >
                                <Trash2 size={14} className="mr-2" /> {deletingId === row.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
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

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New Subject</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <Input
                label="Subject Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Mathematics, English"
                required
              />
              <Input
                label="Subject Code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g., MATH, ENG"
                required
              />
              <Select
                label="Category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                options={subjectCategories}
              />
              {formError && <p className="text-sm text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white">
                  {isSaving ? "Saving..." : "Add Subject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit Subject</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubject} className="space-y-4">
              <Input
                label="Subject Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Mathematics, English"
                required
              />
              <Input
                label="Subject Code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g., MATH, ENG"
                required
              />
              <Select
                label="Category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                options={subjectCategories}
              />
              {formError && <p className="text-sm text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subject Modal */}
      {isViewModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Subject Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Subject Name</span>
                <span className="text-sm font-medium text-slate-900">{selectedSubject.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Subject Code</span>
                <span className="text-sm font-medium text-slate-900">{selectedSubject.code}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Category</span>
                <span className="text-sm font-medium text-slate-900">{selectedSubject.category}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
