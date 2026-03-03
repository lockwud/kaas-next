"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Pagination } from "../../../../components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { students, users } from "../../../../lib/school-data";
import { loadClasses, saveClasses } from "../../../../lib/classes-storage";
import { SchoolClass } from "../../../../types/school";
import {
  AlertTriangle, FileX2, MoreVertical, Pencil, Trash2,
  UserRoundPlus, X, Search, School, Users, UserCheck,
  Layers, Plus
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { BackButton } from "../../../../components/ui/BackButton";

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
  const [search, setSearch] = React.useState("");

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

  const rows: ClassRow[] = allClasses
    .map((item) => ({
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
    }))
    .filter(r =>
      r.className.toLowerCase().includes(search.toLowerCase()) ||
      r.section.toLowerCase().includes(search.toLowerCase()) ||
      r.classTeacher.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const totalStudentsCount = rows.reduce((acc, r) => acc + r.students, 0);
  const assignedTeachersCount = Array.from(new Set(rows.filter(r => r.classTeacher !== "Unassigned").map(r => r.classTeacher))).length;

  const openDetailModal = (row: ClassRow) => {
    const target = allClasses.find((item) => item.id === row.id);
    if (!target) return;
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
    if (!deleteTarget) return;
    const updated = allClasses.filter((item) => item.id !== deleteTarget.id);
    persist(updated);
    if (selectedClassId === deleteTarget.id) closeDetailModal();
    setDeleteTarget(null);
  };

  const selectedClass = React.useMemo(
    () => allClasses.find((item) => item.id === selectedClassId) ?? null,
    [allClasses, selectedClassId],
  );

  const studentOptions = React.useMemo(
    () => students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.className}${s.section})` })),
    [],
  );

  const toggleStudentAssignment = (studentId: string) => {
    setAssignedStudentIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  };

  const updateClassFromModal = () => {
    if (!selectedClass) return;
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <BackButton href="/AdminDashboard/Academics" label="Back to Academics" />

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Classes Directory</h2>
            <p className="text-slate-500 text-sm mt-1">Manage all school classes, sections, and assigned teachers.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Classes", value: rows.length, icon: <School size={18} />, color: "bg-blue-50 text-blue-700" },
            { label: "Total Students", value: totalStudentsCount, icon: <Users size={18} />, color: "bg-emerald-50 text-emerald-700" },
            { label: "Teachers Assigned", value: assignedTeachersCount, icon: <UserCheck size={18} />, color: "bg-violet-50 text-violet-700" },
            { label: "Sections", value: Array.from(new Set(rows.map(r => r.section))).length, icon: <Layers size={18} />, color: "bg-amber-50 text-amber-700" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 flex items-center gap-3 shadow-xs`}>
              <span className="opacity-70 shrink-0">{stat.icon}</span>
              <div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search/Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by class name, section, or teacher…"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
          <p className="text-xs font-semibold text-slate-400 whitespace-nowrap hidden sm:block">Showing {rows.length} records</p>
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
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 hover:bg-emerald-50/50 transition-colors"
                      onClick={() => openDetailModal(row)}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.className}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">{row.section}</span>
                      </td>
                      <td className="px-4 py-3">{row.classTeacher}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium italic">{row.source}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{row.students}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block" data-action-root="true">
                          <button
                            type="button"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500"
                            onClick={(e) => { e.stopPropagation(); setOpenActionRowId(row.id === openActionRowId ? null : row.id); }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openActionRowId === row.id && (
                            <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-100">
                              <button onClick={() => openDetailModal(row)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-medium">
                                <Pencil size={12} /> Edit Class
                              </button>
                              <button onClick={() => handleDelete(row)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="h-64 px-4 py-8">
                      <div className="flex flex-col items-center justify-center text-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                          <FileX2 size={32} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No classes found</p>
                          <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/30">
              <Pagination
                totalItems={rows.length}
                currentPage={safeCurrentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
                pageSizeOptions={[10, 20, 50]}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Edit Class Details</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Manage enrollment and teacher assignment.</p>
                </div>
                <button onClick={closeDetailModal} className="rounded-full p-2 text-slate-400 hover:bg-white hover:shadow-sm transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 px-6 py-6 font-medium">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Class Name" value={editClassName} onChange={e => setEditClassName(e.target.value)} required />
                  <Input label="Section" value={editSection} onChange={e => setEditSection(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    label="Class Teacher"
                    value={editTeacherId}
                    onChange={e => setEditTeacherId(e.target.value)}
                    options={[
                      { value: "unassigned", label: "Unassigned" },
                      ...classTeachers.map((t) => ({ value: t.id, label: t.fullName })),
                    ]}
                  />
                  <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Student Insights</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-600" />
                        <span className="text-2xl font-black text-emerald-900">{modalTotalStudentCount}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-bold bg-white px-2 py-0.5 rounded-full shadow-xs border border-emerald-100">
                        Auto-matched: {modalBaseStudentCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/20 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900">
                      <UserRoundPlus size={18} className="text-emerald-500" />
                      <p className="text-sm font-black">Assign Additional Students</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">Manual Overrides</span>
                  </div>
                  <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar sm:grid-cols-2">
                    {studentOptions.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 group">
                        <input
                          type="checkbox"
                          checked={assignedStudentIds.includes(s.id)}
                          onChange={() => toggleStudentAssignment(s.id)}
                          className="h-4 w-4 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 transition-all"
                        />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-900 transition-colors">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {modalError && <p className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-bold text-rose-600 animate-shake">{modalError}</p>}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                  <Button variant="outline" className="h-11 rounded-xl px-6 font-bold" onClick={closeDetailModal}>Cancel</Button>
                  <Button className="h-11 rounded-xl px-8 font-black bg-slate-900 text-white hover:bg-slate-800" onClick={updateClassFromModal}>Update Details</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-center text-lg font-black text-slate-900">Delete Class?</h4>
              <p className="mt-2 text-center text-sm text-slate-500 font-medium leading-relaxed">
                You are about to remove <span className="font-black text-slate-700 underline decoration-rose-300">{deleteTarget.className}{deleteTarget.section}</span>. This action cannot be reversed.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                <Button className="flex-1 h-12 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100" onClick={confirmDelete}>Yes, Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
