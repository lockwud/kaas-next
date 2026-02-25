"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { motion } from "framer-motion";
import { students, users } from "../../../../lib/school-data";
import { loadClasses, saveClasses } from "../../../../lib/classes-storage";
import { SchoolClass } from "../../../../types/school";
import { AlertTriangle, FileX2, MoreVertical, Pencil, Trash2, UserRoundPlus, X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { useToast } from "@/hooks/useToast";

type ClassRow = {
  id: string;
  className: string;
  section: string;
  classTeacher: string;
  source: string;
  students: number;
  createdAt: string;
  updatedAt: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const unique = (values: string[]) => Array.from(new Set(values));

export default function ClassesPage() {
  const { success } = useToast();
  const [allClasses, setAllClasses] = React.useState<SchoolClass[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [openActionRowId, setOpenActionRowId] = React.useState<string | null>(null);

  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);
  const [editClassName, setEditClassName] = React.useState("");
  const [editSection, setEditSection] = React.useState("");
  const [editTeacherId, setEditTeacherId] = React.useState("unassigned");
  const [assignedStudentIds, setAssignedStudentIds] = React.useState<string[]>([]);
  const [modalError, setModalError] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<ClassRow | null>(null);

  const classTeachers = React.useMemo(() => users.filter((user) => user.role === "class_teacher"), []);

  React.useEffect(() => {
    setAllClasses(loadClasses());
  }, []);

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

  const persist = (records: SchoolClass[]) => {
    setAllClasses(records);
    saveClasses(records);
  };

  const getBaseStudentIds = React.useCallback((className: string, section: string) => {
    return students
      .filter(
        (student) =>
          normalize(student.className) === normalize(className) &&
          normalize(student.section) === normalize(section),
      )
      .map((student) => student.id);
  }, []);

  const getTotalStudentIds = React.useCallback(
    (item: SchoolClass) => unique([...getBaseStudentIds(item.className, item.section), ...(item.assignedStudentIds ?? [])]),
    [getBaseStudentIds],
  );

  const rows: ClassRow[] = allClasses.map((item) => ({
    id: item.id,
    className: item.className,
    section: item.section,
    classTeacher: item.classTeacherName ?? "Unassigned",
    source:
      item.sourceSections && item.sourceSections.length > 0
        ? `Merged: ${item.sourceSections.map((sourceSection) => `${item.className}${sourceSection}`).join(", ")}`
        : "Direct",
    students: getTotalStudentIds(item).length,
    createdAt: new Date(item.createdAt).toLocaleDateString(),
    updatedAt: new Date(item.updatedAt).toLocaleDateString(),
  }));

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openDetailModal = (row: ClassRow) => {
    const target = allClasses.find((item) => item.id === row.id);
    if (!target) {
      return;
    }

    setSelectedClassId(target.id);
    setEditClassName(target.className);
    setEditSection(target.section);
    setEditTeacherId(target.classTeacherId ?? "unassigned");
    setAssignedStudentIds(target.assignedStudentIds ?? []);
    setModalError("");
    setOpenActionRowId(null);
  };

  const closeDetailModal = () => {
    setSelectedClassId(null);
    setModalError("");
  };

  const handleDelete = (row: ClassRow) => {
    setDeleteTarget(row);
    setOpenActionRowId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    const updated = allClasses.filter((item) => item.id !== deleteTarget.id);
    persist(updated);

    if (selectedClassId === deleteTarget.id) {
      closeDetailModal();
    }

    setDeleteTarget(null);
  };

  const selectedClass = React.useMemo(
    () => allClasses.find((item) => item.id === selectedClassId) ?? null,
    [allClasses, selectedClassId],
  );

  const studentOptions = React.useMemo(
    () =>
      students.map((student) => ({
        id: student.id,
        label: `${student.fullName} (${student.className}${student.section})`,
      })),
    [],
  );

  const toggleStudentAssignment = (studentId: string) => {
    setAssignedStudentIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  };

  const updateClassFromModal = () => {
    if (!selectedClass) {
      return;
    }

    const nextClassName = editClassName.trim();
    const nextSection = editSection.trim();

    if (!nextClassName || !nextSection) {
      setModalError("Class name and section are required.");
      return;
    }

    const duplicate = allClasses.some(
      (item) =>
        item.id !== selectedClass.id &&
        normalize(item.className) === normalize(nextClassName) &&
        normalize(item.section) === normalize(nextSection),
    );

    if (duplicate) {
      setModalError("Class and section already exist.");
      return;
    }

    const chosenTeacher = classTeachers.find((teacher) => teacher.id === editTeacherId);
    const now = new Date().toISOString();

    const updated = allClasses.map((item) =>
      item.id === selectedClass.id
        ? {
          ...item,
          className: nextClassName,
          section: nextSection,
          classTeacherId: chosenTeacher?.id,
          classTeacherName: chosenTeacher?.fullName,
          assignedStudentIds: unique(assignedStudentIds),
          updatedAt: now,
        }
        : item,
    );

    persist(updated);
    success(`Class "${nextClassName}" details updated successfully.`);
    closeDetailModal();
  };

  const modalBaseStudentCount = React.useMemo(
    () => getBaseStudentIds(editClassName, editSection).length,
    [editClassName, editSection, getBaseStudentIds],
  );

  const modalTotalStudentCount = React.useMemo(
    () => unique([...getBaseStudentIds(editClassName, editSection), ...assignedStudentIds]).length,
    [assignedStudentIds, editClassName, editSection, getBaseStudentIds],
  );

  return (
    <DashboardLayout>
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
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Updated Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70"
                      onClick={() => openDetailModal(row)}
                    >
                      <td className="px-4 py-3 font-medium">{row.className}</td>
                      <td className="px-4 py-3">{row.section}</td>
                      <td className="px-4 py-3">{row.classTeacher}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{row.source}</td>
                      <td className="px-4 py-3">{row.students}</td>
                      <td className="px-4 py-3">{row.createdAt}</td>
                      <td className="px-4 py-3">{row.updatedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block" data-action-root="true">
                          <button
                            type="button"
                            aria-label="Open class actions"
                            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionRowId((current) => (current === row.id ? null : row.id));
                            }}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {openActionRowId === row.id && (
                            <div
                              className="absolute right-0 z-20 mt-1 w-28 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                                onClick={() => openDetailModal(row)}
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                                onClick={() => handleDelete(row)}
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="h-[340px] px-4 py-8">
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400">
                          <FileX2 size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No data found</p>
                        <p className="mt-1 text-xs text-slate-400">There are no results to display at this time</p>
                      </div>
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

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Class Details</h3>
                <p className="text-xs text-slate-500">Update class information and assign more students.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                onClick={closeDetailModal}
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Class Name"
                  value={editClassName}
                  onChange={(event) => setEditClassName(event.target.value)}
                  placeholder="JHS 1"
                  required
                />
                <Input
                  label="Section"
                  value={editSection}
                  onChange={(event) => setEditSection(event.target.value)}
                  placeholder="A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Class Teacher"
                  value={editTeacherId}
                  onChange={(event) => setEditTeacherId(event.target.value)}
                  options={[
                    { value: "unassigned", label: "Unassigned" },
                    ...classTeachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
                  ]}
                />
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <p className="text-xs text-slate-500">Students</p>
                  <p className="mt-1 font-medium text-slate-900">{modalTotalStudentCount}</p>
                  <p className="text-xs text-slate-500">Auto-matched: {modalBaseStudentCount}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UserRoundPlus size={16} />
                  <p className="text-sm font-semibold">Assign More Students</p>
                </div>
                <p className="mb-3 text-xs text-slate-500">Select students to include in this class in addition to auto-matched records.</p>
                <div className="grid max-h-44 grid-cols-1 gap-2 overflow-auto rounded-lg border border-slate-100 p-2 sm:grid-cols-2">
                  {studentOptions.map((student) => {
                    const checked = assignedStudentIds.includes(student.id);
                    return (
                      <label key={student.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudentAssignment(student.id)}
                          className="h-3.5 w-3.5 accent-emerald-600"
                        />
                        <span>{student.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {modalError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{modalError}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" className="h-10 px-4" onClick={closeDetailModal}>
                  Close
                </Button>
                <Button type="button" className="h-10 px-4" onClick={updateClassFromModal}>
                  Update
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle size={20} />
            </div>
            <h4 className="text-center text-base font-semibold text-slate-900">Delete Class?</h4>
            <p className="mt-2 text-center text-sm text-slate-500">
              This will remove <span className="font-medium text-slate-700">{deleteTarget.className}{deleteTarget.section}</span> from the directory.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <Button type="button" variant="outline" className="h-10 px-4" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button type="button" className="h-10 bg-rose-600 px-4 text-white hover:bg-rose-700" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )
      }
    </DashboardLayout >
  );
}
