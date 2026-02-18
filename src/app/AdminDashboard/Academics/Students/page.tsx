"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { motion } from "framer-motion";
import { loadStudentsDirectory } from "../../../../lib/students-storage";
import { StudentDirectoryRecord } from "../../../../types/school";
import { FileX2, X } from "lucide-react";

export default function StudentsDirectoryPage() {
  const [students, setStudents] = React.useState<StudentDirectoryRecord[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentDirectoryRecord | null>(null);

  React.useEffect(() => {
    setStudents(loadStudentsDirectory());
  }, []);

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = students.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Guardian Contact</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((student) => (
                    <tr
                      key={student.id}
                      className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-4 py-3 font-medium">{student.fullName}</td>
                      <td className="px-4 py-3">{student.className && student.section ? `${student.className}${student.section}` : "Assign Later"}</td>
                      <td className="px-4 py-3">{student.admissionDate}</td>
                      <td className="px-4 py-3">{student.academicYear}</td>
                      <td className="px-4 py-3">{student.guardianName}</td>
                      <td className="px-4 py-3">{student.guardianPrimaryContact}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-[340px] px-4 py-8">
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400">
                          <FileX2 size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No student records yet</p>
                        <p className="mt-1 text-xs text-slate-400">Add students from Academics workflow using Add New.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <Pagination
              totalItems={students.length}
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

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Student Details</h3>
                <p className="text-xs text-slate-500">Complete profile and guardian information.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 px-6 py-5 text-sm sm:grid-cols-2">
              <Field label="Student Name" value={selectedStudent.fullName} />
              <Field label="Assigned Class" value={selectedStudent.className && selectedStudent.section ? `${selectedStudent.className}${selectedStudent.section}` : "Assign Later"} />
              <Field label="Admission Date" value={selectedStudent.admissionDate} />
              <Field label="Academic Year" value={selectedStudent.academicYear} />
              <Field label="Guardian Name" value={selectedStudent.guardianName} />
              <Field label="Guardian Relationship" value={selectedStudent.guardianRelationship} />
              <Field label="Guardian Contact" value={selectedStudent.guardianPrimaryContact} />
              <Field label="Optional Contact" value={selectedStudent.guardianSecondaryContact || "-"} />
              <Field label="Emergency Contact" value={selectedStudent.emergencyContactName} />
              <Field label="Emergency Relationship" value={selectedStudent.emergencyContactRelationship} />
              <Field label="Emergency Phone" value={selectedStudent.emergencyContactPhone} />
              <Field label="Address" value={selectedStudent.houseAddress} className="sm:col-span-2" />
              <Field label="Previous Academic History" value={selectedStudent.previousAcademicHistory || "-"} className="sm:col-span-2" />
              <Field label="Health Records" value={selectedStudent.healthRecords || "-"} className="sm:col-span-2" />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
