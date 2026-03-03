"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { loadStudentsDirectory } from "../../../../lib/students-storage";
import { StudentDirectoryRecord } from "../../../../types/school";
import { FileX2, X, Award, Search, GraduationCap, Users, UserCheck, Clock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Button } from "../../../../components/ui/Button";
import { BackButton } from "../../../../components/ui/BackButton";

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function StudentsDirectoryPage() {
  const { success } = useToast();
  const [students, setStudents] = React.useState<StudentDirectoryRecord[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentDirectoryRecord | null>(null);
  const [search, setSearch] = React.useState("");
  const [filterAssigned, setFilterAssigned] = React.useState<"all" | "assigned" | "unassigned">("all");

  React.useEffect(() => { setStudents(loadStudentsDirectory()); }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (s.className ?? "").toLowerCase().includes(search.toLowerCase());
    const isAssigned = Boolean(s.className && s.section);
    const matchFilter = filterAssigned === "all" || (filterAssigned === "assigned" ? isAssigned : !isAssigned);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const assignedCount = students.filter(s => s.className && s.section).length;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Students Directory</h2>
            <p className="text-slate-500 text-sm mt-1">View and manage all registered students.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: students.length, icon: <Users size={18} />, color: "bg-blue-50 text-blue-700" },
            { label: "Class Assigned", value: assignedCount, icon: <UserCheck size={18} />, color: "bg-emerald-50 text-emerald-700" },
            { label: "Unassigned", value: students.length - assignedCount, icon: <Clock size={18} />, color: "bg-amber-50 text-amber-700" },
            { label: "Showing", value: filtered.length, icon: <GraduationCap size={18} />, color: "bg-violet-50 text-violet-700" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 flex items-center gap-3`}>
              <span className="opacity-70 shrink-0">{stat.icon}</span>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name or class…"
              className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {(["all", "assigned", "unassigned"] as const).map(f => (
            <button key={f} onClick={() => { setFilterAssigned(f); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterAssigned === f ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f === "all" ? `All (${students.length})` : f === "assigned" ? `Assigned (${assignedCount})` : `Unassigned (${students.length - assignedCount})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-[11px] font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Admission Date</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Contact</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? paginatedRows.map((student, i) => (
                  <tr key={student.id} onClick={() => setSelectedStudent(student)}
                    className={`cursor-pointer border-t border-slate-100 text-sm text-slate-700 hover:bg-emerald-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {initials(student.fullName)}
                        </div>
                        <span className="font-semibold text-slate-800">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {student.className && student.section ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{student.className}{student.section}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{student.admissionDate}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{student.academicYear}</td>
                    <td className="px-4 py-3">{student.guardianName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{student.guardianPrimaryContact}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="h-52 px-4 py-8">
                      <div className="flex h-full flex-col items-center justify-center text-center gap-2">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-400"><FileX2 size={24} /></div>
                        <p className="text-sm font-semibold text-slate-700">
                          {search || filterAssigned !== "all" ? "No student records match your search" : "No student records yet"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {search || filterAssigned !== "all" ? "Try adjusting your filters" : "Add students from the Academics hub."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination totalItems={filtered.length} currentPage={safeCurrentPage} pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
              pageSizeOptions={[10, 20, 50]} />
          </div>
        </div>
      </motion.div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}>

              {/* Modal header with student avatar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-lg font-black shrink-0">
                    {initials(selectedStudent.fullName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedStudent.fullName}</h3>
                    <p className="text-emerald-200 text-xs mt-0.5">
                      {selectedStudent.className && selectedStudent.section
                        ? `${selectedStudent.className}${selectedStudent.section} · ${selectedStudent.academicYear}`
                        : `Unassigned · ${selectedStudent.academicYear}`}
                    </p>
                  </div>
                </div>
                <button type="button" className="rounded-full p-1.5 text-white/70 hover:bg-white/20 transition-colors" onClick={() => setSelectedStudent(null)}>
                  <X size={16} />
                </button>
              </div>

              {/* Student info grid */}
              <div className="px-6 py-5 space-y-5">
                {/* Profile */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Profile Information</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Full Name" value={selectedStudent.fullName} />
                    <Field label="Assigned Class" value={selectedStudent.className && selectedStudent.section ? `${selectedStudent.className}${selectedStudent.section}` : "Unassigned"} />
                    <Field label="Admission Date" value={selectedStudent.admissionDate} />
                    <Field label="Academic Year" value={selectedStudent.academicYear} />
                    <Field label="House Address" value={selectedStudent.houseAddress} className="sm:col-span-2" />
                  </div>
                </div>

                {/* Guardian */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Guardian Name" value={selectedStudent.guardianName} />
                    <Field label="Relationship" value={selectedStudent.guardianRelationship} />
                    <Field label="Primary Contact" value={selectedStudent.guardianPrimaryContact} />
                    <Field label="Secondary Contact" value={selectedStudent.guardianSecondaryContact || "—"} />
                  </div>
                </div>

                {/* Emergency */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Contact Name" value={selectedStudent.emergencyContactName} />
                    <Field label="Relationship" value={selectedStudent.emergencyContactRelationship} />
                    <Field label="Phone" value={selectedStudent.emergencyContactPhone} />
                  </div>
                </div>

                {/* Optional */}
                {(selectedStudent.previousAcademicHistory || selectedStudent.healthRecords) && (
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Additional Notes</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {selectedStudent.previousAcademicHistory && <Field label="Previous Academic History" value={selectedStudent.previousAcademicHistory} className="sm:col-span-2" />}
                      {selectedStudent.healthRecords && <Field label="Health Records" value={selectedStudent.healthRecords} className="sm:col-span-2" />}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={() => { success(`${selectedStudent.fullName} has been promoted to the next academic level.`); setSelectedStudent(null); }}>
                  <Award size={16} className="mr-2" /> Promote Student
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
