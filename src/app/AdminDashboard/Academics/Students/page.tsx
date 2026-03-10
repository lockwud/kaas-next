"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, MoreHorizontal, Pencil, Trash2, X, User, Calendar, Phone, Mail, MapPin, BookOpen, GraduationCap, Shield, Eye, Search } from "lucide-react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Pagination } from "../../../../components/ui/Pagination";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { getRoleKey } from "@/lib/auth-session";

type StudentRow = {
  id: string;
  fullName: string;
  classId: string;
  className: string;
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

// Default mock data for initial load
const DEFAULT_STUDENTS: StudentRow[] = [
  { id: "1", fullName: "Kwame Asante", classId: "1", className: "Form 1-A", gender: "Male", dateOfBirth: "2010-05-15", admissionDate: "2023-09-01", guardianName: "John Asante", guardianContact: "+233 24 111 1111", guardianEmail: "john.asante@email.com", address: "Accra, Ghana", email: "kwame.asante@student.edu", phone: "+233 55 123 4567" },
  { id: "2", fullName: "Abena Mensah", classId: "2", className: "Form 1-B", gender: "Female", dateOfBirth: "2010-08-22", admissionDate: "2023-09-01", guardianName: "Mary Mensah", guardianContact: "+233 24 222 2222", guardianEmail: "mary.mensah@email.com", address: "Tema, Ghana", email: "abena.mensah@student.edu", phone: "+233 55 234 5678" },
  { id: "3", fullName: "Kofi Osei", classId: "", className: "Assign Later", gender: "Male", dateOfBirth: "2010-03-10", admissionDate: "2024-01-15", guardianName: "David Osei", guardianContact: "+233 24 333 3333", guardianEmail: "david.osei@email.com", address: "Kumasi, Ghana", email: "kofi.osei@student.edu", phone: "+233 55 345 6789" },
  { id: "4", fullName: "Ama Owusu", classId: "1", className: "Form 1-A", gender: "Female", dateOfBirth: "2010-11-30", admissionDate: "2023-09-01", guardianName: "Grace Owusu", guardianContact: "+233 24 444 4444", guardianEmail: "grace.owusu@email.com", address: "Takoradi, Ghana", email: "ama.owusu@student.edu", phone: "+233 55 456 7890" },
  { id: "5", fullName: "Yaw Nkrumah", classId: "3", className: "Form 2-A", gender: "Male", dateOfBirth: "2009-07-18", admissionDate: "2022-09-01", guardianName: "Paul Nkrumah", guardianContact: "+233 24 555 5555", guardianEmail: "paul.nkrumah@email.com", address: "Cape Coast, Ghana", email: "yaw.nkrumah@student.edu", phone: "+233 55 567 8901" },
  { id: "6", fullName: "Fatima Ali", classId: "", className: "Assign Later", gender: "Female", dateOfBirth: "2010-02-14", admissionDate: "2024-02-20", guardianName: "Mohammed Ali", guardianContact: "+233 24 666 6666", guardianEmail: "mohammed.ali@email.com", address: "Tamale, Ghana", email: "fatima.ali@student.edu", phone: "+233 55 678 9012" },
];

const DEFAULT_CLASSES: ClassOption[] = [
  { id: "1", name: "Form 1-A" },
  { id: "2", name: "Form 1-B" },
  { id: "3", name: "Form 2-A" },
  { id: "4", name: "Form 2-B" },
  { id: "5", name: "Form 3-A" },
];

const mapStudent = (item: StudentApi): StudentRow => ({
  id: item.id,
  fullName: item.fullName ?? item.name ?? "Unnamed Student",
  classId: item.classId ?? "",
  className: item.className ? `${item.className}${item.section ?? ""}` : "Assign Later",
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
  const [classes, setClasses] = React.useState<ClassOption[]>(DEFAULT_CLASSES);
  const [isLoading, setIsLoading] = React.useState(true);
  const [promotingId, setPromotingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentRole] = React.useState(() => getRoleKey());
  const isClassTeacher = currentRole === "class_teacher";
  
  // Filters
  const [genderFilter, setGenderFilter] = React.useState<string>("");
  const [classFilter, setClassFilter] = React.useState<string>("");
  const [hasClassFilter, setHasClassFilter] = React.useState<string>(
    () => (getRoleKey() === "class_teacher" ? "assigned" : "all"),
  ); // "all", "assigned", "unassigned"
  
  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRow | null>(null);
  
  // Assign class form
  const [assignClassId, setAssignClassId] = React.useState("");

  // Load students from localStorage or API
  const load = async () => {
    setIsLoading(true);
    try {
      // First try to load from localStorage
      const stored = localStorage.getItem("kaas_students");
      if (stored) {
        const parsed = JSON.parse(stored);
        setRows(parsed);
      } else {
        // If no localStorage, try API
        const payload = await apiRequest<StudentApi[]>(API_ENDPOINTS.students);
        const mapped = payload.map(mapStudent);
        setRows(mapped);
        localStorage.setItem("kaas_students", JSON.stringify(mapped));
      }
      
      // Load classes
      const storedClasses = localStorage.getItem("kaas_classes");
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      }
    } catch (err) {
      // If API fails, use default mock data
      setRows(DEFAULT_STUDENTS);
      localStorage.setItem("kaas_students", JSON.stringify(DEFAULT_STUDENTS));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter students
  const filteredRows = React.useMemo(() => {
    return rows.filter(student => {
      // Gender filter
      if (genderFilter && student.gender !== genderFilter) return false;
      
      // Class filter
      if (classFilter && student.classId !== classFilter) return false;
      
      // Has class filter
      if (hasClassFilter === "assigned" && !student.classId) return false;
      if (hasClassFilter === "unassigned" && student.classId) return false;
      
      return true;
    });
  }, [rows, genderFilter, classFilter, hasClassFilter]);

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

  const deleteStudent = async (studentId: string) => {
    setActionMenuOpen(null);
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    try {
      const updatedRows = rows.filter(s => s.id !== studentId);
      setRows(updatedRows);
      localStorage.setItem("kaas_students", JSON.stringify(updatedRows));
      success("Student deleted successfully.");
    } catch (err) {
      error("Unable to delete student.");
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

  const handleAssignClass = () => {
    if (!selectedStudent || !assignClassId) return;
    
    const selectedClass = classes.find(c => c.id === assignClassId);
    const updatedRows = rows.map(s => 
      s.id === selectedStudent.id 
        ? { ...s, classId: assignClassId, className: selectedClass?.name || "Unknown" }
        : s
    );
    setRows(updatedRows);
    localStorage.setItem("kaas_students", JSON.stringify(updatedRows));
    setIsAssignClassModalOpen(false);
    success(`Student assigned to ${selectedClass?.name}`);
  };

  const handleUpdateStudent = (updatedStudent: StudentRow) => {
    const updatedRows = rows.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setRows(updatedRows);
    localStorage.setItem("kaas_students", JSON.stringify(updatedRows));
    setIsEditModalOpen(false);
    setSelectedStudent(updatedStudent);
    setIsDetailModalOpen(true);
    success("Student updated successfully.");
  };

  const handleBulkAssignClass = (classId: string) => {
    const unassignedStudents = filteredRows.filter(s => !s.classId);
    if (unassignedStudents.length === 0) {
      error("No unassigned students to assign.");
      return;
    }
    
    const selectedClass = classes.find(c => c.id === classId);
    const updatedRows = rows.map(s => {
      if (unassignedStudents.find(us => us.id === s.id)) {
        return { ...s, classId, className: selectedClass?.name || "Unknown" };
      }
      return s;
    });
    setRows(updatedRows);
    localStorage.setItem("kaas_students", JSON.stringify(updatedRows));
    success(`${unassignedStudents.length} students assigned to ${selectedClass?.name}`);
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
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Students Directory</h2>
          
          {/* Bulk Assign Button */}
          {filteredRows.some(s => !s.classId) && (
            <div className="flex items-center gap-2">
              <Select
                className="w-40"
                value=""
                onChange={(e) => {
                  if (e.target.value) handleBulkAssignClass(e.target.value);
                }}
                options={[
                  { value: "", label: "Bulk Assign..." },
                  ...classes.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Filter by:</span>
          </div>
          
          <Select
            className="w-32"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            options={[
              { value: "", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" }
            ]}
          />
          
          <Select
            className="w-36"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              { value: "", label: "All Classes" },
              ...classes.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
          
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {!isClassTeacher && (
              <button
                onClick={() => setHasClassFilter("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${hasClassFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                All
              </button>
            )}
            <button
              onClick={() => setHasClassFilter("assigned")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${hasClassFilter === "assigned" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Assigned
            </button>
            <button
              onClick={() => setHasClassFilter("unassigned")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${hasClassFilter === "unassigned" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Unassigned
            </button>
          </div>
          
          {(genderFilter || classFilter || hasClassFilter !== (isClassTeacher ? "assigned" : "all")) && (
            <button
              onClick={() => {
                setGenderFilter("");
                setClassFilter("");
                setHasClassFilter(isClassTeacher ? "assigned" : "all");
              }}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Gender</th>
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
                                onClick={() => deleteStudent(student.id)}
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
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
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
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
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
            <Button type="submit" isLoading={isSaving} className="bg-emerald-600">Save Changes</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
