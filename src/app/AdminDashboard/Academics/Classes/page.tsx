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

type ClassRow = {
  id: string;
  className: string;
  section: string;
  classTeacher: string;
  classTeacherId?: string;
  students: number;
};

type ClassApi = {
  id: string;
  className?: string;
  name?: string;
  section?: string;
  classTeacher?: { id?: string; fullName?: string };
  classTeacherId?: string;
  studentsCount?: number;
};

type StudentApi = {
  id: string;
  classId?: string;
  className?: string;
  section?: string;
};

type StaffApi = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
};

export default function ClassesPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<ClassRow[]>([]);
  const [staffList, setStaffList] = React.useState<StaffApi[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal states
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassRow | null>(null);

  // Form states
  const [formClassName, setFormClassName] = React.useState("");
  const [formSection, setFormSection] = React.useState("");
  const [formTeacherId, setFormTeacherId] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      // Fetch from API only
      const classesPayload = await apiRequest<ClassApi[]>(API_ENDPOINTS.classes);
      const studentsPayload = await apiRequest<StudentApi[]>(API_ENDPOINTS.students).catch(() => []);
      const staffPayload = await apiRequest<StaffApi[]>(API_ENDPOINTS.usersManagement).catch(() => []);

      // Filter for class teachers
      const classTeachers = staffPayload.filter(
        (staff) => staff.role?.toLowerCase() === "class_teacher"
      );
      setStaffList(classTeachers);

      // Build student count map based on className and section
      const studentCountMap = new Map<string, number>();
      studentsPayload.forEach((student) => {
        const key = `${student.className ?? ""}|${student.section ?? ""}`;
        if (student.className) {
          studentCountMap.set(key, (studentCountMap.get(key) ?? 0) + 1);
        }
      });

      const mappedClasses = classesPayload.map((item) => {
        const className = item.className ?? item.name ?? "";
        const section = item.section ?? "";
        const sectionKey = `${className}|${section}`;
        const calculatedCount = studentCountMap.get(sectionKey) ?? 0;
        return {
          id: item.id,
          className: className,
          section: section || "-",
          classTeacher: item.classTeacher?.fullName ?? "Unassigned",
          classTeacherId: item.classTeacher?.id ?? item.classTeacherId,
          students: calculatedCount,
        };
      });

      setRows(mappedClasses);

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

  // Open modals
  const openAddModal = () => {
    setFormClassName("");
    setFormSection("");
    setFormTeacherId("");
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (cls: ClassRow) => {
    setSelectedClass(cls);
    setFormClassName(cls.className);
    setFormSection(cls.section === "-" ? "" : cls.section);
    setFormTeacherId(cls.classTeacherId || "");
    setFormError("");
    setIsEditModalOpen(true);
  };

  const openViewModal = (cls: ClassRow) => {
    setSelectedClass(cls);
    setIsViewModalOpen(true);
  };

  const openAssignTeacherModal = (cls: ClassRow) => {
    setSelectedClass(cls);
    setFormTeacherId(cls.classTeacherId || "");
    setFormError("");
    setIsAssignTeacherModalOpen(true);
  };

  // Handle add class
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim()) {
      setFormError("Class name is required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const payload: Record<string, unknown> = {
        className: formClassName.trim(),
        section: formSection.trim() || undefined,
      };
      if (formTeacherId) {
        payload.classTeacherId = formTeacherId;
      }
      
      const newClass = await apiRequest<ClassApi>(API_ENDPOINTS.classes, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      // Add to local state with default values
      const newRow: ClassRow = {
        id: newClass.id,
        className: newClass.className || formClassName.trim(),
        section: formSection.trim() || "-",
        classTeacher: staffList.find(s => s.id === formTeacherId)?.fullName || "Unassigned",
        classTeacherId: formTeacherId || undefined,
        students: 0,
      };
      success("Class added successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to add class.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit class
  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim() || !selectedClass) {
      setFormError("Class name is required.");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const payload: Record<string, unknown> = {
        className: formClassName.trim(),
        section: formSection.trim() || undefined,
      };
      if (formTeacherId) {
        payload.classTeacherId = formTeacherId;
      }
      
      await apiRequest(`${API_ENDPOINTS.classes}/${selectedClass.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      
      // Update local state
      setRows(prev => prev.map(row => 
        row.id === selectedClass.id 
          ? {
              ...row,
              className: formClassName.trim(),
              section: formSection.trim() || "-",
              classTeacher: staffList.find(s => s.id === formTeacherId)?.fullName || "Unassigned",
              classTeacherId: formTeacherId || undefined,
            }
          : row
      ));
      setIsEditModalOpen(false);
      success("Class updated successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to update class.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle assign teacher
  const handleAssignTeacher = async () => {
    if (!selectedClass) return;
    setIsSaving(true);
    setFormError("");
    try {
      await apiRequest(`${API_ENDPOINTS.classes}/${selectedClass.id}`, {
        method: "PATCH",
        body: JSON.stringify({ classTeacherId: formTeacherId || null }),
      });
      
      // Update local state
      setRows(prev => prev.map(row => 
        row.id === selectedClass.id 
          ? {
              ...row,
              classTeacher: staffList.find(s => s.id === formTeacherId)?.fullName || "Unassigned",
              classTeacherId: formTeacherId || undefined,
            }
          : row
      ));
      setIsAssignTeacherModalOpen(false);
      success("Teacher assigned successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to assign teacher.");
    } finally {
      setIsSaving(false);
    }
  };

  const teacherOptions = [
    { value: "", label: "-- Select Teacher --" },
    ...staffList.map(teacher => ({ 
      value: teacher.id, 
      label: teacher.fullName || teacher.email || "Unknown" 
    }))
  ];

  return (
    <DashboardLayout loading={isLoading}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                                  openAssignTeacherModal(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <UserPlus size={14} className="mr-2" /> Assign Teacher
                              </button>
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  openEditModal(row);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Pencil size={14} className="mr-2" /> Edit Class
                              </button>
                              <button
                                className="flex w-full items-center px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  void deleteClass(row.id);
                                  setActionMenuOpen(null);
                                }}
                                disabled={removingId === row.id}
                              >
                                <Trash2 size={14} className="mr-2" /> {removingId === row.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
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

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New Class</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <Input
                label="Class Name"
                value={formClassName}
                onChange={(e) => setFormClassName(e.target.value)}
                placeholder="e.g., JSS 1, Primary 4"
                required
              />
              <Input
                label="Section (Optional)"
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                placeholder="e.g., A, B, C"
              />
              <Select
                label="Class Teacher (Optional)"
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                options={teacherOptions}
              />
              {formError && <p className="text-sm text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white">
                  {isSaving ? "Saving..." : "Add Class"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit Class</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditClass} className="space-y-4">
              <Input
                label="Class Name"
                value={formClassName}
                onChange={(e) => setFormClassName(e.target.value)}
                placeholder="e.g., JSS 1, Primary 4"
                required
              />
              <Input
                label="Section (Optional)"
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                placeholder="e.g., A, B, C"
              />
              <Select
                label="Class Teacher (Optional)"
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                options={teacherOptions}
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

      {/* View Class Modal */}
      {isViewModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Class Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Class Name</span>
                <span className="text-sm font-medium text-slate-900">{selectedClass.className}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Section</span>
                <span className="text-sm font-medium text-slate-900">{selectedClass.section}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Class Teacher</span>
                <span className="text-sm font-medium text-slate-900">{selectedClass.classTeacher}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Number of Students</span>
                <span className="text-sm font-medium text-slate-900">{selectedClass.students}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {isAssignTeacherModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Assign Class Teacher</h3>
              <button onClick={() => setIsAssignTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-600">
                <span className="font-medium">{selectedClass.className}</span> 
                {selectedClass.section !== "-" && <span> - {selectedClass.section}</span>}
              </p>
            </div>
            <div className="space-y-4">
              <Select
                label="Select Class Teacher"
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                options={teacherOptions}
              />
              {formError && <p className="text-sm text-rose-600">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignTeacherModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignTeacher} disabled={isSaving} className="bg-slate-900 text-white">
                  {isSaving ? "Saving..." : "Assign Teacher"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
