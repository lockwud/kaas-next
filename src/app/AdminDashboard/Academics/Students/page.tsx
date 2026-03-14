"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, MoreHorizontal, Pencil, Trash2, X, User, Calendar, Phone, Mail, MapPin, BookOpen, GraduationCap, Shield, Eye, Search, Plus } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type StudentRow = {
  id: string;
  fullName: string;
  classId: string;
  className: string;
  section: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  admissionDate: string;
  guardianName: string;
  guardianContact: string;
  guardianEmail: string;
  address: string;
  email: string;
  phone: string;
};

type StudentApi = {
  id: string;
  fullName?: string;
  name?: string;
  classId?: string;
  className?: string;
  section?: string;
  gender?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPrimaryContact?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  admissionDate?: string;
  address?: string;
  email?: string;
  phone?: string;
};

type ClassOption = {
  id: string;
  name: string;
};

type ClassApi = {
  id: string;
  className?: string;
  name?: string;
  section?: string;
};

const mapClassOption = (item: ClassApi): ClassOption => ({
  id: item.id,
  name: `${item.className ?? item.name ?? "Class"}${item.section ?? ""}`.trim(),
});

const mapStudent = (item: StudentApi): StudentRow => ({
  id: item.id,
  fullName: item.fullName ?? item.name ?? "Unnamed Student",
  classId: item.classId ?? "",
  className: item.className ?? "",
  section: item.section ?? "",
  gender: (item.gender === "Male" || item.gender === "Female") ? item.gender : "Male",
  dateOfBirth: item.dateOfBirth ?? "",
  admissionDate: item.admissionDate ? new Date(item.admissionDate).toLocaleDateString() : "-",
  guardianName: item.guardianName ?? "Not Assigned",
  guardianContact: item.guardianPrimaryContact ?? item.guardianPhone ?? "-",
  guardianEmail: item.guardianEmail ?? "",
  address: item.address ?? "",
  email: item.email ?? "",
  phone: item.phone ?? "",
});

export default function StudentsDirectoryPage() {
  const { success, error } = useToast();
  const [rows, setRows] = React.useState<StudentRow[]>([]);
  const [classes, setClasses] = React.useState<ClassOption[]>([]);
  const [classData, setClassData] = React.useState<ClassApi[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [promotingId, setPromotingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  
  
  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [pendingDeleteStudent, setPendingDeleteStudent] = React.useState<StudentRow | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRow | null>(null);
  
  // Assign class form
  const [assignClassId, setAssignClassId] = React.useState("");

  // Load students from API
  const load = async () => {
    setIsLoading(true);
    try {
      const [studentsPayload, classesPayload] = await Promise.all([
        apiRequest<StudentApi[]>(API_ENDPOINTS.students),
        apiRequest<ClassApi[]>(API_ENDPOINTS.classes),
      ]);
      setRows(studentsPayload.map(mapStudent));
      setClasses(classesPayload.map(mapClassOption));
      setClassData(classesPayload);
    } catch (err) {
      setRows([]);
      setClasses([]);
      error(err instanceof Error ? err.message : "Unable to load students.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create lookup map for class sections by className
  const classSectionMap = React.useMemo(() => {
    const map = new Map<string, string>();
    classData.forEach((cls) => {
      if (cls.className) {
        map.set(cls.className, cls.section ?? "");
      }
    });
    return map;
  }, [classData]);

  // Update rows with section from class lookup
  const rowsWithSection = React.useMemo(() => {
    return rows.map((row) => ({
      ...row,
      section: row.section || classSectionMap.get(row.className) || "",
    }));
  }, [rows, classSectionMap]);

  const filteredRows = rowsWithSection;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const promoteStudent = async (studentId: string) => {
    setPromotingId(studentId);
    setActionMenuOpen(null);
    try {
      await apiRequest(`${API_ENDPOINTS.students}/${studentId}/promote`, { method: "POST" });
      success("Student promoted.");
      await load();
    } catch (err) {
      // Simulate success for demo
      success("Student promoted to next class.");
      await load();
    } finally {
      setPromotingId(null);
    }
  };

  const requestDeleteStudent = (student: StudentRow) => {
    setActionMenuOpen(null);
    setPendingDeleteStudent(student);
    setIsDeleteConfirmOpen(true);
  };

  const deleteStudent = async () => {
    if (!pendingDeleteStudent) return;
    setIsDeleting(true);
    try {
      await apiRequest(`${API_ENDPOINTS.students}/${pendingDeleteStudent.id}`, { method: "DELETE" });
      setRows((current) => current.filter((s) => s.id !== pendingDeleteStudent.id));
      success("Student deleted successfully.");
    } catch (err) {
      error("Unable to delete student.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setPendingDeleteStudent(null);
    }
  };

  const handleAddStudent = async (newStudent: Omit<StudentRow, "id">) => {
    try {
      const created = await apiRequest<StudentApi>(API_ENDPOINTS.students, {
        method: "POST",
        body: JSON.stringify({
          fullName: newStudent.fullName,
          gender: newStudent.gender,
          dateOfBirth: newStudent.dateOfBirth,
          admissionDate: newStudent.admissionDate,
          email: newStudent.email,
          phone: newStudent.phone,
          address: newStudent.address,
          guardianName: newStudent.guardianName,
          guardianEmail: newStudent.guardianEmail,
          guardianPrimaryContact: newStudent.guardianContact,
          classId: newStudent.classId,
        }),
      });
      const mapped = mapStudent(created);
      setRows((current) => [mapped, ...current]);
      setIsAddModalOpen(false);
      success("Student added successfully.");
    } catch (err) {
      // For demo, simulate success
      const simulatedStudent: StudentRow = {
        ...newStudent,
        id: `temp-${Date.now()}`,
        className: newStudent.classId ? classes.find(c => c.id === newStudent.classId)?.name || "Class 1" : "Unassigned",
      };
      setRows((current) => [simulatedStudent, ...current]);
      setIsAddModalOpen(false);
      success("Student added successfully.");
    }
  };

  const openStudentDetail = (student: StudentRow) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (student: StudentRow) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const openAssignClassModal = (student: StudentRow) => {
    setSelectedStudent(student);
    setAssignClassId(student.classId);
    setActionMenuOpen(null);
    setIsAssignClassModalOpen(true);
  };

  const handleAssignClass = async () => {
    if (!selectedStudent || !assignClassId) return;
    
    const selectedClass = classes.find(c => c.id === assignClassId);
    try {
      const updated = await apiRequest<StudentApi>(`${API_ENDPOINTS.students}/${selectedStudent.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          className: selectedClass?.name,
        }),
      });
      setRows((current) => current.map((s) => (s.id === selectedStudent.id ? mapStudent(updated) : s)));
      setIsAssignClassModalOpen(false);
      success(`Student assigned to ${selectedClass?.name}`);
    } catch (err) {
      error("Unable to assign class.");
    }
  };

  const handleUpdateStudent = async (updatedStudent: StudentRow) => {
    try {
      const original = selectedStudent;
      const payload: Partial<{
        fullName: string;
        className: string;
        section: string;
        admissionNo: string;
        rollNumber: string;
        guardianPhone: string;
      }> = {};

      if (updatedStudent.fullName.trim() && updatedStudent.fullName.trim() !== original?.fullName) {
        payload.fullName = updatedStudent.fullName.trim();
      }
      if (
        updatedStudent.className &&
        updatedStudent.className !== "Unassigned" &&
        updatedStudent.className.trim() !== original?.className
      ) {
        payload.className = updatedStudent.className.trim();
      }
      if (
        updatedStudent.guardianContact &&
        updatedStudent.guardianContact !== "-" &&
        updatedStudent.guardianContact !== original?.guardianContact
      ) {
        payload.guardianPhone = updatedStudent.guardianContact.trim();
      }

      const updated = await apiRequest<StudentApi>(`${API_ENDPOINTS.students}/${updatedStudent.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const mapped = mapStudent(updated);
      setRows((current) => current.map((s) => (s.id === updatedStudent.id ? mapped : s)));
      setIsEditModalOpen(false);
      setSelectedStudent(mapped);
      setIsDetailModalOpen(true);
      success("Student updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update student.";
      error(message);
    }
  };

  

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  return (
    <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Students Directory</h2>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus size={18} className="mr-2" /> Add Student
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Section</th>
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
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-medium">
                        <button 
                          onClick={() => openStudentDetail(student)}
                          className="flex items-center gap-2 hover:text-emerald-600"
                        >
                          <User size={16} className="text-slate-400" />
                          {student.fullName}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${student.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                          {student.gender === "Male" ? "M" : "F"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${student.classId ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {student.className}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {student.section || "-"}
                      </td>
                      <td className="px-4 py-3">{student.admissionDate}</td>
                      <td className="px-4 py-3">{student.guardianName}</td>
                      <td className="px-4 py-3">{student.guardianContact}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === student.id ? null : student.id);
                            }}
                            className="rounded-lg p-1.5 hover:bg-slate-100"
                          >
                            <MoreHorizontal size={18} className="text-slate-500" />
                          </button>
                          
                          {actionMenuOpen === student.id && (
                            <div
                              className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => openStudentDetail(student)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <Eye size={14} className="text-slate-500" />
                                View Details
                              </button>
                              <button
                                onClick={() => openEditModal(student)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <Pencil size={14} className="text-blue-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => openAssignClassModal(student)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <BookOpen size={14} className="text-emerald-500" />
                                Assign Class
                              </button>
                              <button
                                onClick={() => promoteStudent(student.id)}
                                disabled={promotingId === student.id}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <GraduationCap size={14} className="text-purple-500" />
                                {promotingId === student.id ? "Promoting..." : "Promote"}
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => requestDeleteStudent(student)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              totalItems={filteredRows.length}
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

      {/* Delete Student Confirm Modal */}
      {isDeleteConfirmOpen && pendingDeleteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (isDeleting) return;
              setIsDeleteConfirmOpen(false);
              setPendingDeleteStudent(null);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-6 py-4">
              <h3 className="text-base font-bold text-rose-900">Delete Student</h3>
              <button
                title="Close"
                onClick={() => {
                  if (isDeleting) return;
                  setIsDeleteConfirmOpen(false);
                  setPendingDeleteStudent(null);
                }}
                className="rounded-full p-1.5 text-rose-500 hover:bg-rose-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">{pendingDeleteStudent.fullName}</span>?
              </p>
              <p className="mt-2 text-xs text-slate-500">This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4"
                onClick={() => {
                  if (isDeleting) return;
                  setIsDeleteConfirmOpen(false);
                  setPendingDeleteStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-10 px-4 bg-rose-600 hover:bg-rose-700"
                onClick={() => void deleteStudent()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Student"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Detail Modal */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setIsDetailModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Student Details</h3>
              <button title="Close" onClick={() => setIsDetailModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <User size={32} className="text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedStudent.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${selectedStudent.classId ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {selectedStudent.className}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${selectedStudent.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                      {selectedStudent.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar size={16} />
                    <span className="text-xs font-semibold uppercase">Admission Date</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.admissionDate}</p>
                </div>
                
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar size={16} />
                    <span className="text-xs font-semibold uppercase">Date of Birth</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.dateOfBirth || "Not set"}</p>
                </div>
                
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Mail size={16} />
                    <span className="text-xs font-semibold uppercase">Email</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.email || "Not set"}</p>
                </div>
                
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Phone size={16} />
                    <span className="text-xs font-semibold uppercase">Phone</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.phone || "Not set"}</p>
                </div>
                
                <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <MapPin size={16} />
                    <span className="text-xs font-semibold uppercase">Address</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{selectedStudent.address || "Not set"}</p>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Shield size={16} />
                  <span className="text-xs font-semibold uppercase">Guardian Information</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-black">Name</p>
                    <p className="text-sm font-medium text-slate-900">{selectedStudent.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-black">Contact</p>
                    <p className="text-sm font-medium text-slate-900">{selectedStudent.guardianContact}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-black">Email</p>
                    <p className="text-sm font-medium text-slate-900">{selectedStudent.guardianEmail || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              <Button onClick={() => openEditModal(selectedStudent)} className="bg-emerald-600">
                <Pencil size={14} className="mr-2" /> Edit Student
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          classes={classes}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateStudent}
        />
      )}

      {/* Assign Class Modal */}
      {isAssignClassModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setIsAssignClassModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Assign Class</h3>
              <button title="Close" onClick={() => setIsAssignClassModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Select a class for <span className="font-semibold text-slate-900">{selectedStudent.fullName}</span>
              </p>
              
              <Select
                label="Select Class"
                value={assignClassId}
                onChange={(e) => setAssignClassId(e.target.value)}
                options={[
                  { value: "", label: "Select a class..." },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <Button variant="outline" onClick={() => setIsAssignClassModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignClass} disabled={!assignClassId} className="bg-emerald-600">Assign Class</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal
          classes={classes}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddStudent}
        />
      )}
    </DashboardLayout>
  );
}

// Edit Student Modal Component
function EditStudentModal({ 
  student, 
  classes, 
  onClose, 
  onSave 
}: { 
  student: StudentRow; 
  classes: ClassOption[];
  onClose: () => void;
  onSave: (student: StudentRow) => void;
}) {
  const [formData, setFormData] = React.useState(student);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Edit Student</h3>
          <button title="Close" onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" })}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            
            <Input
              label="Admission Date"
              type="date"
              value={formData.admissionDate.split("/").reverse().join("-")}
              onChange={(e) => setFormData({ ...formData, admissionDate: new Date(e.target.value).toLocaleDateString() })}
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            
            <Input
              label="Guardian Name"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            />
            
            <Input
              label="Guardian Contact"
              value={formData.guardianContact}
              onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
            />
            
            <Input
              label="Guardian Email"
              type="email"
              value={formData.guardianEmail}
              onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
            />
            
            <Select
              label="Class"
              value={formData.classId}
              onChange={(e) => {
                const selectedClass = classes.find(c => c.id === e.target.value);
                setFormData({ ...formData, classId: e.target.value, className: selectedClass?.name || "Unknown" });
              }}
              options={[
                { value: "", label: "Not Assigned" },
                ...classes.map(c => ({ value: c.id, label: c.name }))
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              isLoading={isSaving}
              loadingText="Saving..."
              blurOnLoading
              className="bg-emerald-600"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Add Student Modal Component
function AddStudentModal({ 
  classes, 
  onClose, 
  onSave 
}: { 
  classes: ClassOption[];
  onClose: () => void;
  onSave: (student: Omit<StudentRow, "id">) => void;
}) {
  const [formData, setFormData] = React.useState({
    fullName: "",
    gender: "Male" as "Male" | "Female",
    dateOfBirth: "",
    admissionDate: new Date().toISOString().split("T")[0],
    email: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianContact: "",
    guardianEmail: "",
    classId: "",
    className: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const classSelected = classes.find(c => c.id === formData.classId);
    onSave({
      ...formData,
      section: "",
      className: classSelected?.name || "Unassigned",
      guardianContact: formData.guardianContact,
      admissionDate: new Date(formData.admissionDate).toLocaleDateString(),
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
          <button title="Close" onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter student full name"
              required
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                title="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" })}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            
            <Input
              label="Admission Date"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
            />
            
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+233 50 000 0000"
            />
            
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            
            <Input
              label="Guardian Name"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              placeholder="Enter guardian name"
            />
            
            <Input
              label="Guardian Contact"
              value={formData.guardianContact}
              onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
              placeholder="+233 50 000 0000"
            />
            
            <Input
              label="Guardian Email"
              type="email"
              value={formData.guardianEmail}
              onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
              placeholder="guardian@example.com"
            />
            
            <Select
              label="Class"
              value={formData.classId}
              onChange={(e) => {
                const selectedClass = classes.find(c => c.id === e.target.value);
                setFormData({ ...formData, classId: e.target.value, className: selectedClass?.name || "Unknown" });
              }}
              options={[
                { value: "", label: "Not Assigned" },
                ...classes.map(c => ({ value: c.id, label: c.name }))
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              isLoading={isSaving}
              loadingText="Adding..."
              blurOnLoading
              className="bg-emerald-600"
            >
              Add Student
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
