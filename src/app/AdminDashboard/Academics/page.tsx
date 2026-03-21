"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { DashboardCard } from "../../../components/DashboardCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Pagination } from "../../../components/ui/Pagination";
import { Select } from "../../../components/ui/Select";
import { SearchableSelect } from "../../../components/ui/SearchableSelect";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { CalendarDays, Download, FileSpreadsheet, Layers, Save, Search, Sparkles, Upload, UserRoundPlus, UsersRound, X } from "lucide-react";
import { SchoolClass } from "../../../types/school";
import { useToast } from "@/hooks/useToast";
import { ApiRequestError, apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import type { AttendanceRecord, VacationDateRecord } from "@/lib/attendance-types";

const normalize = (value: string) => value.trim().toLowerCase();
const ACADEMIC_YEAR_START_MONTH = 7; // August

const getCurrentAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= ACADEMIC_YEAR_START_MONTH ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
};

const buildAcademicYearOptions = (currentAcademicYear: string) => {
  const currentStartYear = Number(currentAcademicYear.split("/")[0]);
  return Array.from({ length: 5 }, (_, index) => {
    const year = currentStartYear - 2 + index;
    return `${year}/${year + 1}`;
  });
};

const getCurrentTerm = (date = new Date()): "first_term" | "second_term" | "third_term" => {
  const month = date.getMonth();
  if (month >= 8) {
    return "first_term";
  }
  if (month <= 3) {
    return "second_term";
  }
  return "third_term";
};

type CreationMode = "single" | "group";
type StudentStep = "profile" | "guardian";
type StudentRegistrationMode = "single" | "bulk";

const ASSESSMENT_MAX_CLASS_EXERCISE = 20;
const ASSESSMENT_MAX_HOMEWORK_PROJECT = 20;
const ASSESSMENT_MAX_EXAM_INPUT = 100;
const ASSESSMENT_EXAM_WEIGHT_MAX = 60;

const toBackendTerm = (term: "first_term" | "second_term" | "third_term") => term.toUpperCase();

type MultiSelectItem = { id: string; label: string };

const MultiSelectList = ({
  label,
  items,
  selectedIds,
  onChange
}: {
  label: string;
  items: MultiSelectItem[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
}) => {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {paged.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs transition ${checked ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-700 hover:border-emerald-300"
                }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.id)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
                  }`}
                aria-hidden="true"
              >
                {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="flex-1">{item.label}</span>
            </label>
          );
        })}
        {paged.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-500">
            No matches found.
          </div>
        )}
      </div>

      {filtered.length > pageSize && (
        <Pagination
          totalItems={filtered.length}
          currentPage={safePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={() => undefined}
          pageSizeOptions={[pageSize]}
        />
      )}
    </div>
  );
};

interface AssessmentStudentOption {
  id: string;
  fullName: string;
  className: string;
  section: string;
  classId?: string;
}

interface AssessmentClassOption {
  id: string;
  className: string;
  section: string;
  label: string;
}

interface AssessmentEntryRow {
  studentId: string;
  studentName: string;
  classExercise: number;
  homeworkProject: number;
  exam: number;
}

interface AssessmentStoredRecord {
  id: string;
  classId: string;
  className?: string;
  section?: string;
  subject: string;
  term: "first_term" | "second_term" | "third_term";
  academicYear: string;
  printedAt?: string;
  rows: Array<AssessmentEntryRow & { total: number }>;
  savedAt: string;
}

interface ClassApi {
  id: string;
  className?: string;
  name?: string;
  section?: string;
  schoolId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentApi {
  id: string;
  fullName?: string;
  name?: string;
  classId?: string;
  className?: string;
  section?: string;
}

interface SubjectApi {
  id: string;
  name?: string;
  title?: string;
}

interface UserApi {
  id: string;
  fullName: string;
  role: string;
}

interface DirectoryLoadOptions {
  classes?: boolean;
  students?: boolean;
  users?: boolean;
  subjects?: boolean;
}

const mapClassApi = (item: ClassApi): SchoolClass => {
  const now = new Date().toISOString();
  return {
    id: item.id,
    schoolId: item.schoolId ?? "school",
    className: item.className ?? item.name ?? "Unnamed Class",
    section: item.section ?? "",
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? now,
  };
};

const toAssessmentClassKey = (className: string, section: string) => `${normalize(className)}|${normalize(section)}`;

const toAssessmentClassLabel = (className: string, section: string) => `${className} ${section}`.trim();
const normalizeTermKey = (term: string) => term.trim().toLowerCase().replace(/\s+/g, "_");

const toWeightedExamScore = (rawExam: number) => {
  const clamped = Math.max(0, Math.min(ASSESSMENT_MAX_EXAM_INPUT, rawExam));
  return Math.floor((clamped * ASSESSMENT_EXAM_WEIGHT_MAX) / ASSESSMENT_MAX_EXAM_INPUT);
};

const toAssessmentTotal = (entry: AssessmentEntryRow) =>
  Math.max(0, Math.min(ASSESSMENT_MAX_CLASS_EXERCISE, entry.classExercise)) +
  Math.max(0, Math.min(ASSESSMENT_MAX_HOMEWORK_PROJECT, entry.homeworkProject)) +
  toWeightedExamScore(entry.exam);

export default function AcademicsDashboard() {
  const { success, info, error } = useToast();
  const router = useRouter();
  const errorRef = React.useRef(error);

  const [isClassModalOpen, setIsClassModalOpen] = React.useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = React.useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = React.useState(false);
  const [isUniversalModalOpen, setIsUniversalModalOpen] = React.useState(false);
  const [activeModalTitle, setActiveModalTitle] = React.useState("");

  const [creationMode, setCreationMode] = React.useState<CreationMode>("single");
  const [className, setClassName] = React.useState("");
  const [section, setSection] = React.useState("");
  const [groupClassName, setGroupClassName] = React.useState("");
  const [groupSourceSections, setGroupSourceSections] = React.useState<string[]>([]);
  const [groupTargetSection, setGroupTargetSection] = React.useState("");
  const [teacherAssignmentMode, setTeacherAssignmentMode] = React.useState<"now" | "later">("later");
  const [teacherId, setTeacherId] = React.useState("");
  const [assignedClassStudentIds, setAssignedClassStudentIds] = React.useState<string[]>([]);
  const [subjectName, setSubjectName] = React.useState("");
  const [subjectCode, setSubjectCode] = React.useState("");
  const [subjectCategory, setSubjectCategory] = React.useState<"Core" | "Elective">("Core");
  const [subjectStatus, setSubjectStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [subjectAssignmentMode, setSubjectAssignmentMode] = React.useState<"all" | "specific">("all");
  const [subjectClassIds, setSubjectClassIds] = React.useState<string[]>([]);
  const [subjectTeacherAssignmentMode, setSubjectTeacherAssignmentMode] = React.useState<"later" | "now">("later");
  const [subjectTeacherIds, setSubjectTeacherIds] = React.useState<string[]>([]);
  const [subjectDescription, setSubjectDescription] = React.useState("");
  const [subjectErrorMessage, setSubjectErrorMessage] = React.useState("");
  const [attendanceClassId, setAttendanceClassId] = React.useState("");
  const [attendanceTerm, setAttendanceTerm] = React.useState<"first_term" | "second_term" | "third_term">("first_term");
  const [attendanceYear, setAttendanceYear] = React.useState(getCurrentAcademicYear());
  const [attendanceTotal, setAttendanceTotal] = React.useState(90);
  const [attendanceDate, setAttendanceDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [attendanceEntries, setAttendanceEntries] = React.useState<Record<string, number | undefined>>({});
  const [attendanceEntryInputs, setAttendanceEntryInputs] = React.useState<Record<string, string>>({});
  const [attendanceSearch, setAttendanceSearch] = React.useState("");
  const [isSavingAttendance, setIsSavingAttendance] = React.useState(false);
  const [vacationDate, setVacationDate] = React.useState("");
  const [isSavingVacationDate, setIsSavingVacationDate] = React.useState(false);
  const [reopeningDate, setReopeningDate] = React.useState("");
  const [isSavingReopeningDate, setIsSavingReopeningDate] = React.useState(false);

  const [studentStep, setStudentStep] = React.useState<StudentStep>("profile");
  const [studentRegistrationMode, setStudentRegistrationMode] = React.useState<StudentRegistrationMode>("single");
  const [studentName, setStudentName] = React.useState("");
  const [bulkStudentNames, setBulkStudentNames] = React.useState("");
  const [studentClassAssignmentMode, setStudentClassAssignmentMode] = React.useState<"now" | "later">("later");
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [admissionDate, setAdmissionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const currentAcademicYear = React.useMemo(() => getCurrentAcademicYear(), []);
  const academicYearOptions = React.useMemo(() => buildAcademicYearOptions(currentAcademicYear), [currentAcademicYear]);
  const [academicYearMode, setAcademicYearMode] = React.useState<"configured" | "custom">("configured");
  const [configuredAcademicYear, setConfiguredAcademicYear] = React.useState(currentAcademicYear);
  const [customAcademicYear, setCustomAcademicYear] = React.useState("");
  const [guardianName, setGuardianName] = React.useState("");
  const [guardianRelationship, setGuardianRelationship] = React.useState("");
  const [guardianContact, setGuardianContact] = React.useState("");
  const [guardianOptionalContact, setGuardianOptionalContact] = React.useState("");
  const [houseAddress, setHouseAddress] = React.useState("");
  const [emergencyContactName, setEmergencyContactName] = React.useState("");
  const [emergencyRelationship, setEmergencyRelationship] = React.useState("");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");
  const [previousAcademicHistory, setPreviousAcademicHistory] = React.useState("");
  const [healthRecords, setHealthRecords] = React.useState("");

  const [errorMessage, setErrorMessage] = React.useState("");
  const [studentErrorMessage, setStudentErrorMessage] = React.useState("");

  const [classDirectory, setClassDirectory] = React.useState<SchoolClass[]>([]);
  const [managedStudents, setManagedStudents] = React.useState<AssessmentStudentOption[]>([]);
  const [managedUsers, setManagedUsers] = React.useState<UserApi[]>([]);
  const [managedSubjects, setManagedSubjects] = React.useState<SubjectApi[]>([]);

  React.useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const cards = [
    { title: "Assessments", path: "/AdminDashboard/Academics/Assessments" },
    { title: "Terminal Reports", path: "/AdminDashboard/Academics/Reports" },
    { title: "Classes", path: "/AdminDashboard/Academics/Classes" },
    { title: "Students", path: "/AdminDashboard/Academics/Students" },
    { title: "Sections", path: "/AdminDashboard/Academics/Sections" },
    { title: "Subjects", path: "/AdminDashboard/Academics/Subjects" },
    { title: "Time Table", path: "/AdminDashboard/Academics/TimeTable" },
    { title: "Attendance", path: "/AdminDashboard/Academics/Attendance" },
    { title: "Student Leaves", path: "/AdminDashboard/Academics/Leaves" },
    { title: "Study Materials", path: "/AdminDashboard/Academics/Materials" },
    { title: "Home Work", path: "/AdminDashboard/Academics/Homework" },
    { title: "Notice Board", path: "/AdminDashboard/Academics/NoticeBoard" },
    { title: "Events", path: "/AdminDashboard/Academics/Events" },
    { title: "Live Classes (Go Pro)", path: "/AdminDashboard/Academics/LiveClasses" },
  ];

  const classTeachers = React.useMemo(
    () => managedUsers.filter((user) => user.role.toLowerCase() === "class_teacher"),
    [managedUsers],
  );
  const subjectTeachers = React.useMemo(
    () =>
      managedUsers.filter((user) => {
        const role = user.role.toLowerCase();
        return role === "subject_teacher" || role === "class_teacher";
      }),
    [managedUsers],
  );

  const classSectionMap = React.useMemo(() => {
    const map = new Map<string, Set<string>>();

    managedStudents.forEach((student) => {
      const key = student.className.trim();
      const sections = map.get(key) ?? new Set<string>();
      sections.add(student.section.trim());
      map.set(key, sections);
    });

    return map;
  }, [managedStudents]);

  const groupClassOptions = React.useMemo(
    () => Array.from(classSectionMap.keys()).map((name) => ({ value: name, label: name })),
    [classSectionMap],
  );

  const availableGroupSections = React.useMemo(() => {
    if (!groupClassName) {
      return [];
    }

    return Array.from(classSectionMap.get(groupClassName) ?? []).sort();
  }, [classSectionMap, groupClassName]);

  const classOptions = React.useMemo(
    () =>
      classDirectory.map((item) => ({
        value: item.id,
        label: `${item.className}${item.section}`,
      })),
    [classDirectory],
  );

  const selectedAttendanceClass = React.useMemo(
    () => classDirectory.find((item) => item.id === attendanceClassId) ?? null,
    [classDirectory, attendanceClassId],
  );

  const attendanceStudents = React.useMemo(() => {
    if (!selectedAttendanceClass) return [];
    const targetClassName = normalize(selectedAttendanceClass.className);
    const targetSection = normalize(selectedAttendanceClass.section);
    const targetLabel = normalize(`${selectedAttendanceClass.className}${selectedAttendanceClass.section}`);
    const targetSpacedLabel = normalize(`${selectedAttendanceClass.className} ${selectedAttendanceClass.section}`);

    return managedStudents.filter((student) => {
      if (student.classId && student.classId === selectedAttendanceClass.id) {
        return true;
      }
      const studentClass = normalize(student.className);
      const studentSection = normalize(student.section);
      const studentLabel = normalize(`${student.className}${student.section}`);
      const studentSpacedLabel = normalize(`${student.className} ${student.section}`);
      if (studentLabel && (studentLabel === targetLabel || studentLabel === targetSpacedLabel)) {
        return true;
      }
      if (studentSpacedLabel && (studentSpacedLabel === targetLabel || studentSpacedLabel === targetSpacedLabel)) {
        return true;
      }
      if (!targetClassName) return false;
      if (targetSection) {
        if (studentClass !== targetClassName) return false;
        return !studentSection || studentSection === targetSection;
      }
      return studentClass === targetClassName;
    });
  }, [managedStudents, selectedAttendanceClass]);

  const filteredAttendanceStudents = React.useMemo(() => {
    if (!attendanceSearch.trim()) return attendanceStudents;
    const query = attendanceSearch.trim().toLowerCase();
    return attendanceStudents.filter((student) =>
      student.fullName.toLowerCase().includes(query),
    );
  }, [attendanceStudents, attendanceSearch]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const loadDirectoryData = React.useCallback(async (options?: DirectoryLoadOptions) => {
    const {
      classes: shouldLoadClasses = false,
      students: shouldLoadStudents = false,
      users: shouldLoadUsers = false,
      subjects: shouldLoadSubjects = false,
    } = options ?? {};

    if (!shouldLoadClasses && !shouldLoadStudents && !shouldLoadUsers && !shouldLoadSubjects) {
      return;
    }

    try {
      const [classes, studentsPayload, usersPayload, subjectsPayload] = await Promise.all([
        shouldLoadClasses ? apiRequest<ClassApi[]>(API_ENDPOINTS.classes) : Promise.resolve(null),
        shouldLoadStudents ? apiRequest<StudentApi[]>(API_ENDPOINTS.students) : Promise.resolve(null),
        shouldLoadUsers ? apiRequest<UserApi[]>(API_ENDPOINTS.usersManagement) : Promise.resolve(null),
        shouldLoadSubjects ? apiRequest<SubjectApi[]>(API_ENDPOINTS.subjects) : Promise.resolve(null),
      ]);

      if (classes) {
        setClassDirectory(classes.map(mapClassApi));
      }

      if (studentsPayload) {
        const classLookup = new Map(
          (classes ?? []).map((item) => [
            item.id,
            {
              className: item.className ?? item.name ?? "",
              section: item.section ?? "",
            },
          ]),
        );
        const classLookupByLabel = new Map(
          (classes ?? []).map((item) => {
            const className = item.className ?? item.name ?? "";
            const section = item.section ?? "";
            const label = `${className} ${section}`.trim();
            return [normalize(label), { className, section }];
          }),
        );
        // Create a lookup by className only for fallback when section is empty
        const classLookupByNameOnly = new Map<string, { className: string; section: string }>();
        (classes ?? []).forEach((item) => {
          const className = (item.className ?? item.name ?? "").toLowerCase().trim();
          if (className && !classLookupByNameOnly.has(className)) {
            classLookupByNameOnly.set(className, {
              className: item.className ?? item.name ?? "",
              section: item.section ?? "",
            });
          }
        });
        setManagedStudents(
          studentsPayload.map((student) => {
            const fallbackName = student.className ?? "";
            const fallbackSection = student.section ?? "";
            if (student.classId && classLookup.has(student.classId)) {
              const lookup = classLookup.get(student.classId);
              return {
                id: student.id,
                fullName: student.fullName ?? student.name ?? "Unnamed Student",
                className: lookup?.className ?? fallbackName,
                section: lookup?.section ?? fallbackSection,
                classId: student.classId,
              };
            }
            const labelKey = normalize(`${fallbackName} ${fallbackSection}`.trim() || fallbackName);
            const lookupByLabel = labelKey ? classLookupByLabel.get(labelKey) : undefined;
            if (lookupByLabel) {
              return {
                id: student.id,
                fullName: student.fullName ?? student.name ?? "Unnamed Student",
                className: lookupByLabel.className || fallbackName,
                section: lookupByLabel.section || fallbackSection,
                classId: student.classId,
              };
            }
            // Fallback: try to find section from any class with the same className
            const normalizedClassName = fallbackName.toLowerCase().trim();
            const lookupByName = classLookupByNameOnly.get(normalizedClassName);
            if (lookupByName) {
              return {
                id: student.id,
                fullName: student.fullName ?? student.name ?? "Unnamed Student",
                className: lookupByName.className || fallbackName,
                section: lookupByName.section || fallbackSection,
                classId: student.classId,
              };
            }
            return {
              id: student.id,
              fullName: student.fullName ?? student.name ?? "Unnamed Student",
              className: fallbackName,
              section: fallbackSection,
              classId: student.classId,
            };
          }),
        );
      }

      if (usersPayload) {
        setManagedUsers(usersPayload);
      }

      if (subjectsPayload) {
        setManagedSubjects(subjectsPayload);
      } else if (shouldLoadSubjects) {
        setManagedSubjects([]);
      }
    } catch (err) {
      errorRef.current(err instanceof Error ? err.message : "Unable to load academics records.");
    }
  }, []);

  const closeClassModal = () => {
    setIsClassModalOpen(false);
    setCreationMode("single");
    setClassName("");
    setSection("");
    setGroupClassName("");
    setGroupSourceSections([]);
    setGroupTargetSection("");
    setTeacherAssignmentMode("later");
    setTeacherId("");
    setAssignedClassStudentIds([]);
    setErrorMessage("");
  };

  const openClassModal = () => {
    void loadDirectoryData({ classes: true, students: true, users: true });
    setIsClassModalOpen(true);
    setErrorMessage("");
  };

  const closeStudentModal = () => {
    setIsStudentModalOpen(false);
    setStudentStep("profile");
    setStudentRegistrationMode("single");
    setStudentName("");
    setBulkStudentNames("");
    setStudentClassAssignmentMode("later");
    setSelectedClassId("");
    setAdmissionDate(new Date().toISOString().slice(0, 10));
    setAcademicYearMode("configured");
    setConfiguredAcademicYear(currentAcademicYear);
    setCustomAcademicYear("");
    setGuardianName("");
    setGuardianRelationship("");
    setGuardianContact("");
    setGuardianOptionalContact("");
    setHouseAddress("");
    setEmergencyContactName("");
    setEmergencyRelationship("");
    setEmergencyPhone("");
    setPreviousAcademicHistory("");
    setHealthRecords("");
    setStudentErrorMessage("");
  };

  const openStudentModal = () => {
    void loadDirectoryData({ classes: true });
    setIsStudentModalOpen(true);
    setStudentErrorMessage("");
  };

  const closeSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setSubjectName("");
    setSubjectCode("");
    setSubjectCategory("Core");
    setSubjectStatus("ACTIVE");
    setSubjectAssignmentMode("all");
    setSubjectClassIds([]);
    setSubjectTeacherAssignmentMode("later");
    setSubjectTeacherIds([]);
    setSubjectDescription("");
    setSubjectErrorMessage("");
  };

  const openSubjectModal = () => {
    void loadDirectoryData({ classes: true, users: true });
    setIsSubjectModalOpen(true);
    setSubjectErrorMessage("");
  };

  const toggleClassStudentAssignment = (studentId: string) => {
    setAssignedClassStudentIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  };

  const toggleSourceSection = (sectionName: string) => {
    setGroupSourceSections((current) =>
      current.includes(sectionName)
        ? current.filter((s) => s !== sectionName)
        : [...current, sectionName],
    );
  };

  // Generic modal state (shared for simplicity in quick-add)
  const [genericTitle, setGenericTitle] = React.useState("");
  const [genericDescription, setGenericDescription] = React.useState("");
  const [genericDate, setGenericDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [genericClass, setGenericClass] = React.useState("");
  const [genericSubject, setGenericSubject] = React.useState("");
  const [genericStudentName, setGenericStudentName] = React.useState("");
  const [genericCategory, setGenericCategory] = React.useState("");
  const [genericCapacity, setGenericCapacity] = React.useState("");
  const [genericStatus, setGenericStatus] = React.useState("Active");
  const [genericCode, setGenericCode] = React.useState("");
  const [genericDay, setGenericDay] = React.useState("Monday");
  const [genericPeriod, setGenericPeriod] = React.useState("");
  const [genericTeacher, setGenericTeacher] = React.useState("");
  const [genericDuration, setGenericDuration] = React.useState("");
  const [genericReason, setGenericReason] = React.useState("");
  const [genericLocation, setGenericLocation] = React.useState("");
  const [genericStartTime, setGenericStartTime] = React.useState("");
  const [assessmentClassOptions, setAssessmentClassOptions] = React.useState<AssessmentClassOption[]>([]);
  const [assessmentStudents, setAssessmentStudents] = React.useState<AssessmentStudentOption[]>([]);
  const [assessmentEntries, setAssessmentEntries] = React.useState<AssessmentEntryRow[]>([]);
  const [assessmentSearch, setAssessmentSearch] = React.useState("");
  const [assessmentPage, setAssessmentPage] = React.useState(1);
  const [assessmentPageSize, setAssessmentPageSize] = React.useState(20);

  const handleAdd = (cardTitle: string) => {
    if (cardTitle === "Terminal Reports") {
      return;
    }
    if (cardTitle === "Classes") {
      openClassModal();
      return;
    }

    if (cardTitle === "Students") {
      openStudentModal();
      return;
    }

    if (cardTitle === "Subjects") {
      openSubjectModal();
      return;
    }

    // Open universal modal for other categories
    void loadDirectoryData({ classes: true, students: true, subjects: true });
    setActiveModalTitle(cardTitle);
    setGenericTitle("");
    setGenericDescription("");
    setGenericDate(new Date().toISOString().slice(0, 10));
    setGenericClass("");
    setGenericSubject("");
    setGenericStudentName("");
    setGenericCategory("");
    setGenericCapacity("");
    setGenericStatus("Active");
    setGenericCode("");
    setGenericDay("Monday");
    setGenericPeriod("");
    setGenericTeacher("");
    setGenericDuration("");
    setGenericReason("");
    setGenericLocation("");
    setGenericStartTime("");
    if (cardTitle === "Attendance") {
      setAttendanceClassId("");
      setAttendanceTerm("first_term");
      setAttendanceYear(currentAcademicYear);
      setAttendanceTotal(90);
      setAttendanceDate(new Date().toISOString().slice(0, 10));
      setAttendanceEntries({});
      setAttendanceSearch("");
      setVacationDate("");
      setReopeningDate("");
    }
    setAssessmentSearch("");
    setAssessmentEntries([]);
    setAssessmentPage(1);
    setAssessmentPageSize(20);
    setIsUniversalModalOpen(true);
  };

  React.useEffect(() => {
    const studentMap = new Map<string, AssessmentStudentOption>();
    managedStudents.forEach((student) => {
      if (!studentMap.has(student.id)) {
        studentMap.set(student.id, student);
      }
    });

    const mergedStudents = Array.from(studentMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
    setAssessmentStudents(mergedStudents);

    const classMap = new Map<string, AssessmentClassOption>();
    const classesByName = new Map<string, AssessmentClassOption[]>();

    classDirectory.forEach((classRow) => {
      const key = toAssessmentClassKey(classRow.className, classRow.section);
      const option = {
        id: classRow.id,
        className: classRow.className,
        section: classRow.section,
        label: toAssessmentClassLabel(classRow.className, classRow.section),
      };
      classMap.set(key, option);
      const nameKey = normalize(classRow.className);
      const existing = classesByName.get(nameKey) ?? [];
      existing.push(option);
      classesByName.set(nameKey, existing);
    });

    mergedStudents.forEach((student) => {
      const key = toAssessmentClassKey(student.className, student.section);
      if (!classMap.has(key)) {
        const option = {
          id: `class_${key}`,
          className: student.className,
          section: student.section,
          label: toAssessmentClassLabel(student.className, student.section),
        };
        classMap.set(key, option);
        const nameKey = normalize(student.className);
        const existing = classesByName.get(nameKey) ?? [];
        existing.push(option);
        classesByName.set(nameKey, existing);
      }
    });

    const filteredOptions: AssessmentClassOption[] = [];
    classesByName.forEach((options) => {
      const hasSection = options.some((opt) => opt.section.trim() !== "");
      options.forEach((opt) => {
        if (hasSection && opt.section.trim() === "") return;
        filteredOptions.push(opt);
      });
    });

    const sortedClassOptions = filteredOptions.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );

    setAssessmentClassOptions(sortedClassOptions);
  }, [classDirectory, managedStudents]);

  const createClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let finalClassName = "";
    let finalSection = "";
    let sourceSections: string[] | undefined;

    if (creationMode === "single") {
      finalClassName = className.trim();
      finalSection = section.trim();

      if (!finalClassName || !finalSection) {
        setErrorMessage("Class name and section are required.");
        return;
      }
    } else {
      finalClassName = groupClassName.trim();
      finalSection = groupTargetSection.trim();
      sourceSections = groupSourceSections;

      if (!finalClassName || !finalSection) {
        setErrorMessage("Base class and new section are required.");
        return;
      }

      if (groupSourceSections.length < 2) {
        setErrorMessage("Select at least two source sections to merge.");
        return;
      }

      if (groupSourceSections.some((sectionName) => normalize(sectionName) === normalize(finalSection))) {
        setErrorMessage("New section must be different from selected source sections.");
        return;
      }
    }

    const hasDuplicate = classDirectory.some(
      (item) =>
        normalize(item.className) === normalize(finalClassName) &&
        normalize(item.section) === normalize(finalSection),
    );
    if (hasDuplicate) {
      setErrorMessage("Class and section already exist.");
      return;
    }

    if (teacherAssignmentMode === "now" && !teacherId) {
      setErrorMessage("Select a class teacher or choose assign later.");
      return;
    }

    const assignedTeacher = classTeachers.find((teacher) => teacher.id === teacherId);
    try {
      await apiRequest<ClassApi>(API_ENDPOINTS.classes, {
        method: "POST",
        body: JSON.stringify({
          className: finalClassName,
          section: finalSection,
          classTeacherId: teacherAssignmentMode === "now" ? assignedTeacher?.id : undefined,
          assignedStudentIds: assignedClassStudentIds,
          sourceSections,
        }),
      });
      await loadDirectoryData({ classes: true, students: true });
      success(`Class "${finalClassName}" has been created successfully.`);
      closeClassModal();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        setErrorMessage("Class already exists.");
        return;
      }
      if (err instanceof ApiRequestError && err.status === 403) {
        setErrorMessage("Forbidden: server denied class creation for this account.");
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "Unable to create class.");
    }
  };

  const createStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAcademicYear =
      academicYearMode === "configured" ? configuredAcademicYear : customAcademicYear.trim();

    const isBulkMode = studentRegistrationMode === "bulk";
    const parsedBulkNames = bulkStudentNames
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);
    const trimmedName = studentName.trim();

    if (!isBulkMode && !trimmedName) {
      setStudentErrorMessage("Student name is required.");
      return;
    }

    if (isBulkMode && parsedBulkNames.length === 0) {
      setStudentErrorMessage("Add at least one student name for bulk registration.");
      return;
    }

    if (!admissionDate || !selectedAcademicYear) {
      setStudentErrorMessage("Admission date and academic year are required.");
      return;
    }

    if (!isBulkMode && (!guardianName.trim() || !guardianRelationship.trim() || !guardianContact.trim())) {
      setStudentErrorMessage("Guardian name, relationship, and contact are required.");
      return;
    }

    if (!isBulkMode && !houseAddress.trim()) {
      setStudentErrorMessage("House address is required.");
      return;
    }

    if (!isBulkMode && (!emergencyContactName.trim() || !emergencyRelationship.trim() || !emergencyPhone.trim())) {
      setStudentErrorMessage("Emergency contact details are required.");
      return;
    }

    if (studentClassAssignmentMode === "now" && !selectedClassId) {
      setStudentErrorMessage("Select a class or choose assign later.");
      return;
    }

    const selectedClass = classDirectory.find((item) => item.id === selectedClassId);

    const namesToCreate = isBulkMode ? parsedBulkNames : [trimmedName];
    try {
      if (isBulkMode) {
        // Use bulk endpoint - requires fullName, className, section, classId, admissionNo, rollNumber, and guardianPhone
        const selectedClassData = classDirectory.find((c) => c.id === selectedClassId);
        const studentsPayload = namesToCreate.map((fullName, index) => ({
          fullName,
          className: studentClassAssignmentMode === "now" ? (selectedClassData?.className ?? selectedClass?.className) : undefined,
          section: studentClassAssignmentMode === "now" ? (selectedClassData?.section ?? selectedClass?.section ?? "") : undefined,
          classId: studentClassAssignmentMode === "now" ? selectedClassId : undefined,
          admissionNo: `ADM/${Date.now()}${index}`,
          rollNumber: `R${Date.now().toString().slice(-4)}${index}`,
          guardianPhone: "0000000000",
        }));

        const response = await apiRequest<{ success: boolean; created: number; failed: number; errors: Array<{ row: number; error: string }> }>(
          `${API_ENDPOINTS.students}/bulk`,
          {
            method: "POST",
            body: JSON.stringify({ students: studentsPayload }),
          },
        );

        if (response.failed > 0) {
          const errorSummary = response.errors.map((e: { row: number; error: string }) => `Row ${e.row}: ${e.error}`).join("; ");
          setStudentErrorMessage(`Upload completed with errors: ${errorSummary}`);
          return;
        }

        await loadDirectoryData({ classes: true, students: true });
        success(`${response.created} students have been registered successfully.`);
      } else {
        // Single student creation - uses original endpoint with full details
        const selectedClassData = classDirectory.find((c) => c.id === selectedClassId);
        await apiRequest<StudentApi>(API_ENDPOINTS.students, {
          method: "POST",
          body: JSON.stringify({
            fullName: trimmedName,
            className: studentClassAssignmentMode === "now" ? (selectedClassData?.className ?? selectedClass?.className) : undefined,
            section: studentClassAssignmentMode === "now" ? (selectedClassData?.section ?? selectedClass?.section ?? "") : undefined,
            classId: studentClassAssignmentMode === "now" ? selectedClassId : undefined,
            admissionNo: `ADM/${Date.now()}`,
            rollNumber: `R${Date.now().toString().slice(-4)}`,
            admissionDate,
            academicYear: selectedAcademicYear,
            guardianName: guardianName.trim() || "Not Provided",
            guardianRelationship: guardianRelationship.trim() || "Guardian",
            guardianPhone: guardianContact.trim() || "Not Provided",
            guardianSecondaryContact: guardianOptionalContact,
            houseAddress: houseAddress.trim() || "Not Provided",
            emergencyContactName: emergencyContactName.trim() || "Not Provided",
            emergencyContactRelationship: emergencyRelationship.trim() || "Guardian",
            emergencyContactPhone: emergencyPhone.trim() || "Not Provided",
            previousAcademicHistory,
            healthRecords,
          }),
        });

        await loadDirectoryData({ classes: true, students: true });
        success(`Student "${trimmedName}" has been registered successfully.`);
      }
      closeStudentModal();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        setStudentErrorMessage("Student already exists.");
        return;
      }
      if (err instanceof ApiRequestError && err.status === 403) {
        setStudentErrorMessage("Forbidden: server denied student registration for this account.");
        return;
      }
      setStudentErrorMessage(err instanceof Error ? err.message : "Unable to register student.");
      return;
    }
  };

  const createSubject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subjectName.trim() || !subjectCode.trim()) {
      setSubjectErrorMessage("Subject name and code are required.");
      return;
    }

    if (subjectAssignmentMode === "specific" && subjectClassIds.length === 0) {
      setSubjectErrorMessage("Select a class scope or switch to all classes.");
      return;
    }

    if (subjectTeacherAssignmentMode === "now" && subjectTeacherIds.length === 0) {
      setSubjectErrorMessage("Select a subject teacher or assign later.");
      return;
    }

    try {
      const resolvedClassIds = subjectAssignmentMode === "specific" ? subjectClassIds : [];
      const resolvedTeacherIds = subjectTeacherAssignmentMode === "now" ? subjectTeacherIds : [];
      await apiRequest<SubjectApi>(API_ENDPOINTS.subjects, {
        method: "POST",
        body: JSON.stringify({
          name: subjectName.trim(),
          code: subjectCode.trim(),
          category: subjectCategory,
          status: subjectStatus,
          classIds: resolvedClassIds.length ? resolvedClassIds : undefined,
          classId: resolvedClassIds.length === 1 ? resolvedClassIds[0] : undefined,
          teacherIds: resolvedTeacherIds.length ? resolvedTeacherIds : undefined,
          teacherId: resolvedTeacherIds.length === 1 ? resolvedTeacherIds[0] : undefined,
          description: subjectDescription.trim() || undefined,
        }),
      });
      await loadDirectoryData({ subjects: true });
      success(`Subject "${subjectName.trim()}" has been created successfully.`);
      closeSubjectModal();
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        setSubjectErrorMessage("Subject code already exists.");
        return;
      }
      if (err instanceof ApiRequestError && err.status === 403) {
        setSubjectErrorMessage("Forbidden: server denied subject creation for this account.");
        return;
      }
      setSubjectErrorMessage(err instanceof Error ? err.message : "Unable to create subject.");
    }
  };

  const loadAttendanceForModal = React.useCallback(async () => {
    if (!isUniversalModalOpen || activeModalTitle !== "Attendance") return;
    if (!attendanceClassId || !attendanceYear) return;

    try {
      const params = new URLSearchParams({
        classId: attendanceClassId,
        term: attendanceTerm,
        academicYear: attendanceYear,
      });
      const record = await apiRequest<AttendanceRecord>(`${API_ENDPOINTS.attendance}?${params.toString()}`);
      setAttendanceTotal(record.total ?? 0);
      setAttendanceDate(record.date ?? new Date().toISOString().slice(0, 10));
      const entryMap: Record<string, number | undefined> = {};
      const inputMap: Record<string, string> = {};
      record.entries?.forEach((entry) => {
        entryMap[entry.studentId] = entry.present;
        inputMap[entry.studentId] = String(entry.present);
      });
      setAttendanceEntries(entryMap);
      setAttendanceEntryInputs(inputMap);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        setAttendanceEntries({});
        setAttendanceEntryInputs({});
      } else if (err instanceof ApiRequestError) {
        errorRef.current(err.message);
      }
    }
  }, [isUniversalModalOpen, activeModalTitle, attendanceClassId, attendanceTerm, attendanceYear]);

  const loadVacationDateForModal = React.useCallback(async () => {
    if (!isUniversalModalOpen || activeModalTitle !== "Attendance") return;
    if (!attendanceYear) return;

    try {
      const params = new URLSearchParams({
        term: attendanceTerm,
        academicYear: attendanceYear,
      });
      const record = await apiRequest<VacationDateRecord>(`${API_ENDPOINTS.vacationDates}?${params.toString()}`);
      setVacationDate(record.vacationDate ?? "");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        errorRef.current(err.message);
      }
    }
  }, [isUniversalModalOpen, activeModalTitle, attendanceTerm, attendanceYear]);

  const loadReopeningDateForModal = React.useCallback(async () => {
    if (!isUniversalModalOpen || activeModalTitle !== "Attendance") return;
    if (!attendanceYear) return;

    try {
      const params = new URLSearchParams({
        term: attendanceTerm,
        academicYear: attendanceYear,
      });
      const record = await apiRequest<{ reopeningDate?: string }>(`${API_ENDPOINTS.reopeningDates}?${params.toString()}`);
      setReopeningDate(record.reopeningDate ?? "");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        errorRef.current(err.message);
      }
    }
  }, [isUniversalModalOpen, activeModalTitle, attendanceTerm, attendanceYear]);

  React.useEffect(() => {
    void loadAttendanceForModal();
    void loadVacationDateForModal();
    void loadReopeningDateForModal();
  }, [loadAttendanceForModal, loadVacationDateForModal, loadReopeningDateForModal]);

  React.useEffect(() => {
    if (!isUniversalModalOpen) return;
    if (activeModalTitle === "Attendance" || activeModalTitle === "Assessments") {
      void loadDirectoryData({ classes: true, students: true, subjects: true });
    }
  }, [isUniversalModalOpen, activeModalTitle, loadDirectoryData]);

  React.useEffect(() => {
    if (!isUniversalModalOpen || activeModalTitle !== "Attendance") return;
    if (!attendanceClassId) {
      setAttendanceEntries({});
      setAttendanceEntryInputs({});
      return;
    }
    setAttendanceEntries((current) => {
      const next = { ...current };
      attendanceStudents.forEach((student) => {
        if (next[student.id] === undefined) {
          next[student.id] = 0;
        }
      });
      return next;
    });
    setAttendanceEntryInputs((current) => {
      const next = { ...current };
      attendanceStudents.forEach((student) => {
        if (next[student.id] === undefined) {
          const existing = attendanceEntries[student.id];
          next[student.id] = existing === undefined ? "" : String(existing);
        }
      });
      return next;
    });
  }, [attendanceStudents, attendanceClassId, isUniversalModalOpen, activeModalTitle]);

  const handleAttendanceEntryChange = (studentId: string, value: string) => {
    setAttendanceEntryInputs((current) => ({ ...current, [studentId]: value }));
  };

  const handleAttendanceEntryBlur = (studentId: string) => {
    const raw = attendanceEntryInputs[studentId] ?? "";
    if (raw.trim() === "") {
      setAttendanceEntries((current) => ({ ...current, [studentId]: undefined }));
      setAttendanceEntryInputs((current) => ({ ...current, [studentId]: "" }));
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      setAttendanceEntries((current) => ({ ...current, [studentId]: undefined }));
      setAttendanceEntryInputs((current) => ({ ...current, [studentId]: "" }));
      return;
    }
    const clamped = Math.max(0, Math.min(parsed, attendanceTotal));
    setAttendanceEntries((current) => ({ ...current, [studentId]: clamped }));
    setAttendanceEntryInputs((current) => ({ ...current, [studentId]: String(clamped) }));
  };

  const saveAttendance = async () => {
    if (!attendanceClassId) {
      error("Select a class first.");
      return;
    }
    if (!attendanceYear) {
      error("Select academic year.");
      return;
    }
    if (attendanceTotal <= 0) {
      error("Total attendance must be greater than zero.");
      return;
    }

    const payload: AttendanceRecord = {
      classId: attendanceClassId,
      classLabel: `${selectedAttendanceClass?.className ?? ""}${selectedAttendanceClass?.section ?? ""}`.trim(),
      term: attendanceTerm,
      academicYear: attendanceYear,
      total: attendanceTotal,
      date: attendanceDate || undefined,
      entries: attendanceStudents.map((student) => ({
        studentId: student.id,
        present: Math.max(0, Math.min(attendanceEntries[student.id] ?? 0, attendanceTotal)),
      })),
      updatedAt: new Date().toISOString(),
    };

    setIsSavingAttendance(true);
    try {
      await apiRequest(API_ENDPOINTS.attendance, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      success("Attendance saved successfully.");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const saveVacationDate = async () => {
    if (!attendanceYear) {
      error("Select academic year.");
      return;
    }
    if (!vacationDate) {
      error("Select a vacation date.");
      return;
    }

    const payload: VacationDateRecord = {
      term: attendanceTerm,
      academicYear: attendanceYear,
      vacationDate,
      updatedAt: new Date().toISOString(),
    };

    setIsSavingVacationDate(true);
    try {
      await apiRequest(API_ENDPOINTS.vacationDates, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      success("Vacation date saved.");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    } finally {
      setIsSavingVacationDate(false);
    }
  };

  const saveReopeningDate = async () => {
    if (!attendanceYear) {
      error("Select academic year.");
      return;
    }
    if (!reopeningDate) {
      error("Select a reopening date.");
      return;
    }

    const payload = {
      term: attendanceTerm,
      academicYear: attendanceYear,
      reopeningDate,
      updatedAt: new Date().toISOString(),
    };

    setIsSavingReopeningDate(true);
    try {
      await apiRequest(API_ENDPOINTS.reopeningDates, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      success("Reopening date saved.");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status !== 404) {
        error(err.message);
      }
    } finally {
      setIsSavingReopeningDate(false);
    }
  };

  const isAssessmentModal = activeModalTitle === "Assessments";

  const selectedAssessmentClass = React.useMemo(
    () => assessmentClassOptions.find((option) => option.id === genericClass) ?? null,
    [assessmentClassOptions, genericClass],
  );

  const classStudentsForAssessment = React.useMemo(() => {
    if (!selectedAssessmentClass) {
      return [];
    }

    const targetClassName = normalize(selectedAssessmentClass.className);
    const targetSection = selectedAssessmentClass.section ? normalize(selectedAssessmentClass.section) : "";

    return assessmentStudents
      .filter(
        (student) => {
          const studentClassName = normalize(student.className);
          const studentSection = student.section ? normalize(student.section) : "";
          
          // Match class name first
          if (studentClassName !== targetClassName) return false;
          
          // If target has no section, match students with no/empty section
          if (!targetSection) {
            return !studentSection;
          }
          
          // If target has section, only match students with exact same section
          return studentSection === targetSection;
        },
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [assessmentStudents, selectedAssessmentClass]);

  const filteredAssessmentEntries = React.useMemo(() => {
    const query = normalize(assessmentSearch);
    if (!query) {
      return assessmentEntries;
    }

    return assessmentEntries.filter((entry) => normalize(entry.studentName).includes(query));
  }, [assessmentEntries, assessmentSearch]);

  const assessmentSubjectOptions = React.useMemo(() => {
    const subjects = Array.from(
      new Set([
        ...managedSubjects.map((subject) => subject.name ?? subject.title ?? ""),
        genericSubject.trim(),
      ].filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return subjects.map((subject) => ({ value: subject, label: subject }));
  }, [genericSubject, managedSubjects]);

  const totalAssessmentPages = Math.max(1, Math.ceil(filteredAssessmentEntries.length / assessmentPageSize));
  const safeAssessmentPage = Math.min(Math.max(1, assessmentPage), totalAssessmentPages);
  const paginatedAssessmentEntries = React.useMemo(
    () =>
      filteredAssessmentEntries.slice(
        (safeAssessmentPage - 1) * assessmentPageSize,
        safeAssessmentPage * assessmentPageSize,
      ),
    [filteredAssessmentEntries, safeAssessmentPage, assessmentPageSize],
  );

  React.useEffect(() => {
    if (assessmentPage > totalAssessmentPages) {
      setAssessmentPage(totalAssessmentPages);
    }
  }, [assessmentPage, totalAssessmentPages]);

  React.useEffect(() => {
    setAssessmentPage(1);
  }, [assessmentSearch, genericClass, assessmentPageSize]);

  React.useEffect(() => {
    if (!isUniversalModalOpen || !isAssessmentModal) {
      return;
    }

    if (!selectedAssessmentClass) {
      setAssessmentEntries([]);
      return;
    }

    setAssessmentEntries((current) => {
      const existingByStudentId = new Map(current.map((entry) => [entry.studentId, entry]));

      return classStudentsForAssessment.map((student) => {
        const existing = existingByStudentId.get(student.id);
        if (existing) {
          return existing;
        }

        return {
          studentId: student.id,
          studentName: student.fullName,
          classExercise: 0,
          homeworkProject: 0,
          exam: 0,
        };
      });
    });
  }, [isUniversalModalOpen, isAssessmentModal, selectedAssessmentClass, classStudentsForAssessment]);

  const updateAssessmentEntry = (
    studentId: string,
    field: "classExercise" | "homeworkProject" | "exam",
    rawValue: string,
  ) => {
    if (rawValue.trim() === "") {
      setAssessmentEntries((current) =>
        current.map((entry) =>
          entry.studentId === studentId
            ? {
              ...entry,
              [field]: 0,
            }
            : entry,
        ),
      );
      return;
    }

    const parsed = Number(rawValue);
    const max =
      field === "classExercise"
        ? ASSESSMENT_MAX_CLASS_EXERCISE
        : field === "homeworkProject"
          ? ASSESSMENT_MAX_HOMEWORK_PROJECT
          : ASSESSMENT_MAX_EXAM_INPUT;

    if (!Number.isFinite(parsed)) {
      return;
    }

    if (parsed < 0 || parsed > max) {
      info(`Invalid score. ${field === "exam" ? "Exam" : field === "homeworkProject" ? "Homework + Project" : "Class Exercise"} must be between 0 and ${max}.`);
      return;
    }

    setAssessmentEntries((current) =>
      current.map((entry) =>
        entry.studentId === studentId
          ? {
            ...entry,
            [field]: parsed,
          }
          : entry,
      ),
    );
  };

  const exportAssessmentCsv = () => {
    if (assessmentEntries.length === 0) {
      success("No assessment rows to export.");
      return;
    }

    const rows = [
      ["Student Name", "Class Exercise (/20)", "Homework + Project (/20)", "Exam (/100)", "Total (/100)"],
      ...assessmentEntries.map((entry) => [
        entry.studentName,
        String(entry.classExercise),
        String(entry.homeworkProject),
        String(entry.exam),
        String(toAssessmentTotal(entry)),
      ]),
    ];

    const csv = rows.map((line) => line.map((cell) => `"${cell.replace(/"/g, "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assessment-${selectedAssessmentClass?.label ?? "class"}-${genericSubject || "subject"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Academics</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-[calc(100vh-11rem)] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <DashboardCard
              title={card.title}
              compact
              onView={() => (card.path ? router.push(card.path) : console.log(`View ${card.title}`))}
              viewCompact={card.title === "Terminal Reports"}
              onAdd={card.title === "Terminal Reports" ? undefined : () => handleAdd(card.title)}
            />
          </motion.div>
        ))}
      </motion.div>

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Create Class</h3>
                <p className="text-xs text-slate-500">Add a class directly or build one by grouping student sections.</p>
              </div>
              <button
                type="button"
                onClick={closeClassModal}
                aria-label="Close modal"
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createClass} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setCreationMode("single")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${creationMode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Sparkles size={14} />
                  Create Directly
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("group")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${creationMode === "group" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Layers size={14} />
                  Group Sections
                </button>
              </div>

              {creationMode === "single" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Class Name" value={className} onChange={(event) => setClassName(event.target.value)} placeholder="JHS 1" required />
                  <Input label="Section" value={section} onChange={(event) => setSection(event.target.value)} placeholder="C" required />
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                      label="Base Class Name"
                      value={groupClassName}
                      onChange={(event) => {
                        setGroupClassName(event.target.value);
                        setGroupSourceSections([]);
                      }}
                      options={groupClassOptions}
                    />
                    <Input label="New Section" value={groupTargetSection} onChange={(event) => setGroupTargetSection(event.target.value)} placeholder="C" required />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Source Sections to Combine</p>
                    <p className="mt-1 text-xs text-slate-500">Select at least two sections from the same class name.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableGroupSections.length > 0 ? (
                        availableGroupSections.map((option) => {
                          const active = groupSourceSections.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleSourceSection(option)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                                }`}
                            >
                              {groupClassName}
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500">Choose a base class to load available sections.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UsersRound size={16} />
                  <p className="text-sm font-semibold">Student Enrollment</p>
                </div>
                <p className="mb-3 text-xs text-slate-500">Select students to enroll in this new class.</p>
                <div className="grid max-h-32 grid-cols-1 gap-2 overflow-auto rounded-lg border border-slate-100 p-2 sm:grid-cols-2">
                  {managedStudents.map((student) => {
                    const checked = assignedClassStudentIds.includes(student.id);
                    return (
                      <label key={student.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClassStudentAssignment(student.id)}
                          className="h-3.5 w-3.5 accent-emerald-600 rounded"
                        />
                        <span className="truncate">{student.fullName}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {assignedClassStudentIds.length} Students Selected
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UserRoundPlus size={16} />
                  <p className="text-sm font-semibold">Class Teacher Assignment</p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTeacherAssignmentMode("later")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${teacherAssignmentMode === "later" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    Assign Later
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherAssignmentMode("now")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${teacherAssignmentMode === "now" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    Assign Now
                  </button>
                </div>

                {teacherAssignmentMode === "now" && (
                  <div className="mt-3">
                    <Select
                      label="Class Teacher"
                      value={teacherId}
                      onChange={(event) => setTeacherId(event.target.value)}
                      options={classTeachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName }))}
                      required
                    />
                  </div>
                )}
              </div>

              {errorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{errorMessage}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" className="h-10 px-4" onClick={closeClassModal}>
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-4">
                  Save Class
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Create Subject</h3>
                <p className="text-xs text-slate-500">Add a subject with scope, category, teacher assignment, and status.</p>
              </div>
              <button
                type="button"
                onClick={closeSubjectModal}
                aria-label="Close modal"
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createSubject} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSubjectCategory("Core")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${subjectCategory === "Core" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Sparkles size={14} />
                  Core Subject
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectCategory("Elective")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${subjectCategory === "Elective" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Layers size={14} />
                  Elective Subject
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Subject Name"
                  value={subjectName}
                  onChange={(event) => setSubjectName(event.target.value)}
                  placeholder="Mathematics"
                  required
                />
                <Input
                  label="Subject Code"
                  value={subjectCode}
                  onChange={(event) => setSubjectCode(event.target.value)}
                  placeholder="MTH-101"
                  required
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UsersRound size={16} />
                  <p className="text-sm font-semibold">Class Scope</p>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setSubjectAssignmentMode("all")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${subjectAssignmentMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    All Classes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectAssignmentMode("specific")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${subjectAssignmentMode === "specific" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    Specific Classes
                  </button>
                </div>

                {subjectAssignmentMode === "specific" && (
                  <div className="mt-3">
                    <MultiSelectList
                      label="Classes"
                      items={classOptions.map((option) => ({ id: option.value, label: option.label }))}
                      selectedIds={subjectClassIds}
                      onChange={setSubjectClassIds}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UserRoundPlus size={16} />
                  <p className="text-sm font-semibold">Subject Teacher Assignment</p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setSubjectTeacherAssignmentMode("later")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${subjectTeacherAssignmentMode === "later" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    Assign Later
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectTeacherAssignmentMode("now")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${subjectTeacherAssignmentMode === "now" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                  >
                    Assign Now
                  </button>
                </div>

                {subjectTeacherAssignmentMode === "now" && (
                  <div className="mt-3">
                    <MultiSelectList
                      label="Subject Teachers"
                      items={subjectTeachers.map((teacher) => ({ id: teacher.id, label: teacher.fullName }))}
                      selectedIds={subjectTeacherIds}
                      onChange={setSubjectTeacherIds}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Status"
                  value={subjectStatus}
                  onChange={(event) => setSubjectStatus(event.target.value as "ACTIVE" | "INACTIVE")}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                />
                <Input
                  label="Description (Optional)"
                  value={subjectDescription}
                  onChange={(event) => setSubjectDescription(event.target.value)}
                  placeholder="Core numeracy and problem-solving skills."
                />
              </div>

              {subjectErrorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{subjectErrorMessage}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" className="h-10 px-4" onClick={closeSubjectModal}>
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-4">
                  Save Subject
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {
        isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Register Student</h3>
                  <p className="text-xs text-slate-500">Capture profile, guardian, emergency, and optional history/health details.</p>
                </div>
                <button
                  type="button"
                  onClick={closeStudentModal}
                  aria-label="Close modal"
                  className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={createStudent} className="space-y-5 px-6 py-5">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">Registration Mode</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setStudentRegistrationMode("single")}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${studentRegistrationMode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                    >
                      Single Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentRegistrationMode("bulk")}
                      className={`rounded-md px-3 py-2 text-xs font-medium ${studentRegistrationMode === "bulk" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                    >
                      Bulk Upload
                    </button>
                  </div>
                  {studentRegistrationMode === "bulk" && (
                    <p className="mt-2 text-xs text-slate-500">
                      Guardian, emergency, and history/health details are optional in bulk mode.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setStudentStep("profile")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${studentStep === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <UsersRound size={14} />
                    Profile & Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentStep("guardian")}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${studentStep === "guardian" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <UserRoundPlus size={14} />
                    Guardian & Health
                  </button>
                </div>

                {studentStep === "profile" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {studentRegistrationMode === "single" ? (
                      <Input
                        label="Student Name"
                        value={studentName}
                        onChange={(event) => setStudentName(event.target.value)}
                        placeholder="Student full name"
                        required
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Student Names (one per line or comma-separated)</label>
                        <textarea
                          className="w-full min-h-28 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                          value={bulkStudentNames}
                          onChange={(event) => setBulkStudentNames(event.target.value)}
                          placeholder={`Ada Obi\nKhalid Musa\nBinta Ali`}
                        />
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-800">Academic Year</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setAcademicYearMode("configured")}
                          className={`rounded-md px-3 py-2 text-xs font-medium ${academicYearMode === "configured" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                        >
                          Use Configured
                        </button>
                        <button
                          type="button"
                          onClick={() => setAcademicYearMode("custom")}
                          className={`rounded-md px-3 py-2 text-xs font-medium ${academicYearMode === "custom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                        >
                          Provide Manually
                        </button>
                      </div>

                      {academicYearMode === "configured" ? (
                        <div className="mt-3">
                          <Select
                            label="Academic Year (Configured)"
                            value={configuredAcademicYear}
                            onChange={(event) => setConfiguredAcademicYear(event.target.value)}
                            options={academicYearOptions.map((year) => ({ value: year, label: year }))}
                          />
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Input
                            label="Academic Year (Manual)"
                            value={customAcademicYear}
                            onChange={(event) => setCustomAcademicYear(event.target.value)}
                            placeholder={currentAcademicYear}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">Admission Date</p>
                        <button
                          type="button"
                          onClick={() => setAdmissionDate(new Date().toISOString().slice(0, 10))}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Today
                        </button>
                      </div>
                      <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-600">
                        <CalendarDays size={15} className="text-slate-400" />
                        <input
                          type="date"
                          title="Admission Date"
                          value={admissionDate}
                          onChange={(event) => setAdmissionDate(event.target.value)}
                          className="w-full bg-transparent text-sm text-slate-700 outline-none"
                          required
                        />
                      </label>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 md:col-span-2">
                      <p className="text-sm font-semibold text-slate-800">Class Assignment</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setStudentClassAssignmentMode("later")}
                          className={`rounded-md px-3 py-2 text-xs font-medium ${studentClassAssignmentMode === "later" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                        >
                          Assign Later
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentClassAssignmentMode("now")}
                          className={`rounded-md px-3 py-2 text-xs font-medium ${studentClassAssignmentMode === "now" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                        >
                          Assign Now
                        </button>
                      </div>

                      {studentClassAssignmentMode === "now" && (
                        <div className="mt-3">
                          <Select
                            label="Select Class"
                            value={selectedClassId}
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            options={classOptions}
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="Guardian Name" value={guardianName} onChange={(event) => setGuardianName(event.target.value)} placeholder="Guardian full name" required={studentRegistrationMode === "single"} />
                    <Input label="Relationship" value={guardianRelationship} onChange={(event) => setGuardianRelationship(event.target.value)} placeholder="Mother, Father, Aunt..." required={studentRegistrationMode === "single"} />
                    <Input label="Guardian Contact" value={guardianContact} onChange={(event) => setGuardianContact(event.target.value)} placeholder="Primary phone" required={studentRegistrationMode === "single"} />
                    <Input label="Optional Contact" value={guardianOptionalContact} onChange={(event) => setGuardianOptionalContact(event.target.value)} placeholder="Secondary phone (optional)" />
                    <Input label="Emergency Contact Name" value={emergencyContactName} onChange={(event) => setEmergencyContactName(event.target.value)} placeholder="Who to call if guardian unavailable" required={studentRegistrationMode === "single"} />
                    <Input label="Emergency Relationship" value={emergencyRelationship} onChange={(event) => setEmergencyRelationship(event.target.value)} placeholder="Uncle, Sister..." required={studentRegistrationMode === "single"} />
                    <Input label="Emergency Contact" value={emergencyPhone} onChange={(event) => setEmergencyPhone(event.target.value)} placeholder="Emergency phone" required={studentRegistrationMode === "single"} />

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">House Address</label>
                      <textarea
                        className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        value={houseAddress}
                        onChange={(event) => setHouseAddress(event.target.value)}
                        placeholder="Digital or physical home address"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Previous Academic History (Optional)</label>
                      <textarea
                        className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        value={previousAcademicHistory}
                        onChange={(event) => setPreviousAcademicHistory(event.target.value)}
                        placeholder="Previous school or academic notes"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Health Records (Optional)</label>
                      <textarea
                        className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        value={healthRecords}
                        onChange={(event) => setHealthRecords(event.target.value)}
                        placeholder="Allergies, conditions, special care notes"
                      />
                    </div>
                  </div>
                )}

                {studentErrorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{studentErrorMessage}</p>}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" className="h-10 px-4" onClick={closeStudentModal}>
                    Cancel
                  </Button>
                  <Button type="submit" className="h-10 px-4">
                    Save Student
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      {isUniversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl max-h-[98vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#0F172A] px-6 py-3">
              <div>
                <h3 className="text-base font-semibold text-white">{isAssessmentModal ? "Assessment Entry" : `Add ${activeModalTitle}`}</h3>
                <p className="text-[11px] text-slate-200">
                  {isAssessmentModal ? "Enter class assessment scores." : `Quickly add a new ${activeModalTitle.toLowerCase()} record.`}
                </p>
              </div>
              <button
                type="button"
                title="Close"
                onClick={() => setIsUniversalModalOpen(false)}
                className="rounded-full p-1 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isAssessmentModal) {
                  if (!genericClass) {
                    success("Select class first.");
                    return;
                  }
                  if (!genericSubject.trim()) {
                    success("Enter subject first.");
                    return;
                  }
                  if (assessmentEntries.length === 0) {
                    success("No students available in this class.");
                    return;
                  }

                  const payload = {
                    classId: genericClass,
                    className: selectedAssessmentClass?.className ?? "",
                    ...(selectedAssessmentClass?.section ? { section: selectedAssessmentClass.section } : {}),
                    subject: genericSubject.trim(),
                    term: toBackendTerm(getCurrentTerm()),
                    academicYear: currentAcademicYear,
                    maxScore: ASSESSMENT_MAX_EXAM_INPUT,
                    weights: {
                      classExercise: ASSESSMENT_MAX_CLASS_EXERCISE,
                      homeworkProject: ASSESSMENT_MAX_HOMEWORK_PROJECT,
                      exam: ASSESSMENT_EXAM_WEIGHT_MAX,
                    },
                    rows: assessmentEntries.map((entry) => ({
                      studentId: entry.studentId,
                      studentName: entry.studentName,
                      classExercise: entry.classExercise,
                      homeworkProject: entry.homeworkProject,
                      exam: entry.exam,
                      total: toAssessmentTotal(entry),
                    })),
                    assessmentDate: new Date().toISOString(),
                    savedAt: new Date().toISOString(),
                  };

                  try {
                    console.log("Saving assessment payload:", payload);
                    const result = await apiRequest(API_ENDPOINTS.assessments, {
                      method: "POST",
                      body: JSON.stringify(payload),
                    });
                    console.log("Assessment saved successfully:", result);
                    success("Assessment entry saved successfully.");
                    setIsUniversalModalOpen(false);
                    return;
                  } catch (err) {
                    console.error("Failed to save assessment:", err);
                    const message = err instanceof Error ? err.message : "Unable to save assessment.";
                    error(message);  // Show error message instead of success
                    return;
                  }
                }

                if (activeModalTitle === "Attendance") {
                  await saveAttendance();
                  setIsUniversalModalOpen(false);
                  return;
                }

                console.log(`Creating ${activeModalTitle}:`, {
                  genericTitle,
                  genericDescription,
                  genericDate,
                  genericClass,
                  genericSubject,
                  genericStudentName,
                  genericCategory,
                  genericCapacity,
                  genericStatus,
                  genericCode,
                  genericDay,
                  genericPeriod,
                  genericTeacher,
                  genericDuration,
                  genericReason,
                  genericLocation,
                  genericStartTime,
                });
                success(`${activeModalTitle} record has been saved successfully.`);
                setIsUniversalModalOpen(false);
              }}
              className="space-y-4 px-6 py-5 max-h-[90vh] overflow-y-auto"
            >
              {isAssessmentModal && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-slate-700">
                    <p className="font-semibold text-slate-900">Grading System Information</p>
                    <p>Class Exercise: 20 marks, Homework + Project: 20 marks, Exam entered over 100 and converted to 60%. Total = 100.</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <SearchableSelect
                      label="Class"
                      value={genericClass}
                      onChange={setGenericClass}
                      options={assessmentClassOptions.map((option) => ({ value: option.id, label: option.label }))}
                      placeholder="Select class..."
                      searchPlaceholder="Search class..."
                      enableSearch={true}
                      enablePagination={true}
                      pageSize={5}
                      required
                    />
                    <SearchableSelect
                      label="Subject"
                      value={genericSubject}
                      onChange={setGenericSubject}
                      options={assessmentSubjectOptions}
                      placeholder="Select subject..."
                      searchPlaceholder="Search subject..."
                      enableSearch={true}
                      enablePagination={true}
                      pageSize={5}
                      required
                    />
                    <Input
                      label="Search Student"
                      value={assessmentSearch}
                      onChange={(event) => setAssessmentSearch(event.target.value)}
                      placeholder="Search by name"
                      icon={<Search />}
                      className="rounded-full border-slate-300 bg-slate-50/80"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={exportAssessmentCsv}>
                      <FileSpreadsheet size={14} className="mr-1" /> Export
                    </Button>
                    <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => success("Import from Excel will be connected next.")}>
                      <Upload size={14} className="mr-1" /> Import
                    </Button>
                    <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => success("Template download will be connected next.")}>
                      <Download size={14} className="mr-1" /> Template
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] border-collapse text-left">
                        <thead>
                          <tr className="bg-[#0F172A] text-[10px] font-semibold uppercase tracking-wide text-white">
                            <th className="px-3 py-2">Student Name</th>
                            <th className="px-3 py-2">Class Exercise</th>
                            <th className="px-3 py-2">Homework + Project</th>
                            <th className="px-3 py-2">Exam (/100)</th>
                            <th className="px-3 py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAssessmentEntries.length > 0 ? (
                            paginatedAssessmentEntries.map((entry) => (
                              <tr key={entry.studentId} className="border-t border-slate-100 text-xs text-slate-700">
                                <td className="px-3 py-2 font-medium">{entry.studentName}</td>
                                <td className="px-3 py-2">
                                  <CompactScoreInput
                                    value={entry.classExercise}
                                    max={ASSESSMENT_MAX_CLASS_EXERCISE}
                                    onChange={(value) => updateAssessmentEntry(entry.studentId, "classExercise", value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <CompactScoreInput
                                    value={entry.homeworkProject}
                                    max={ASSESSMENT_MAX_HOMEWORK_PROJECT}
                                    onChange={(value) => updateAssessmentEntry(entry.studentId, "homeworkProject", value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <CompactScoreInput
                                    value={entry.exam}
                                    max={ASSESSMENT_MAX_EXAM_INPUT}
                                    onChange={(value) => updateAssessmentEntry(entry.studentId, "exam", value)}
                                  />
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    = {toWeightedExamScore(entry.exam)} /60
                                  </p>
                                </td>
                                <td className="px-3 py-2 font-semibold text-[#1D4ED8]">{toAssessmentTotal(entry)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                                {selectedAssessmentClass ? "No students found." : "Select class to load students."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                      <Pagination
                        totalItems={filteredAssessmentEntries.length}
                        currentPage={safeAssessmentPage}
                        pageSize={assessmentPageSize}
                        onPageChange={setAssessmentPage}
                        onPageSizeChange={(size) => {
                          setAssessmentPageSize(size);
                          setAssessmentPage(1);
                        }}
                        pageSizeOptions={[20, 50, 100]}
                      />
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-3 py-3">
                      <Button type="button" variant="outline" className="h-9 px-4 text-xs" onClick={() => setIsUniversalModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="h-9 bg-[#1D4ED8] px-4 text-xs hover:bg-[#1E40AF]">
                        Save Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!isAssessmentModal && activeModalTitle === "Attendance" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      label="Class"
                      value={attendanceClassId}
                      onChange={(e) => setAttendanceClassId(e.target.value)}
                      options={classOptions}
                      required
                    />
                    <Select
                      label="Term"
                      value={attendanceTerm}
                      onChange={(e) => setAttendanceTerm(normalizeTermKey(e.target.value) as typeof attendanceTerm)}
                      options={[
                        { value: "first_term", label: "First Term" },
                        { value: "second_term", label: "Second Term" },
                        { value: "third_term", label: "Third Term" },
                      ]}
                      required
                    />
                    <Select
                      label="Academic Year"
                      value={attendanceYear}
                      onChange={(e) => setAttendanceYear(e.target.value)}
                      options={academicYearOptions.map((year) => ({ value: year, label: year }))}
                      required
                    />
                    <Input
                      label="Total Attendance"
                      type="number"
                      min={1}
                      value={attendanceTotal}
                      onChange={(e) => setAttendanceTotal(Number.parseInt(e.target.value, 10) || 0)}
                      required
                    />
                    <Input
                      label="Attendance Date"
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                    <div className="flex items-end">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                        <div className="font-semibold text-slate-900">
                          {selectedAttendanceClass ? `${selectedAttendanceClass.className}${selectedAttendanceClass.section}` : "Select class"}
                        </div>
                        <p className="mt-1">{attendanceStudents.length} student(s) loaded</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700">Student Attendance</h4>
                        <p className="text-[11px] text-slate-500">Enter present days for each student.</p>
                      </div>
                      <div className="relative w-full md:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={attendanceSearch}
                          onChange={(e) => setAttendanceSearch(e.target.value)}
                          placeholder="Search student..."
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                    <div className="max-h-[360px] overflow-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-900 text-[10px] font-semibold uppercase tracking-wide text-white">
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Class</th>
                            <th className="px-3 py-2">Present</th>
                            <th className="px-3 py-2">Out Of</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttendanceStudents.map((student) => (
                            <tr key={student.id} className="border-t border-slate-100 text-xs text-slate-700 hover:bg-slate-50/70">
                              <td className="px-3 py-2 font-medium">{student.fullName}</td>
                              <td className="px-3 py-2 text-slate-500">{`${student.className} ${student.section}`.trim()}</td>
                              <td className="px-3 py-2">
                                  <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={attendanceEntryInputs[student.id] ?? ""}
                                  onChange={(e) => handleAttendanceEntryChange(student.id, e.target.value)}
                                  onBlur={() => handleAttendanceEntryBlur(student.id)}
                                  className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                  />
                              </td>
                              <td className="px-3 py-2 text-[11px] text-slate-500">{attendanceTotal}</td>
                            </tr>
                          ))}
                          {filteredAttendanceStudents.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-500">
                                {attendanceClassId ? "No students found for this class." : "Select a class to load students."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-slate-700">Term Dates</h4>
                      <p className="mt-1 text-[11px] text-slate-500">Set vacation and reopening dates for terminal reports.</p>
                      <div className="mt-3 space-y-3">
                        <Input
                          label="Vacation Date"
                          type="date"
                          value={vacationDate}
                          onChange={(e) => setVacationDate(e.target.value)}
                        />
                        <Input
                          label="Reopening Date"
                          type="date"
                          value={reopeningDate}
                          onChange={(e) => setReopeningDate(e.target.value)}
                        />
                        <Button
                          type="button"
                          className="h-9 w-full bg-slate-900 text-xs hover:bg-slate-800"
                          onClick={() => void saveVacationDate()}
                          disabled={isSavingVacationDate}
                        >
                          {isSavingVacationDate ? "Saving..." : "Save Vacation Date"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-full text-xs"
                          onClick={() => void saveReopeningDate()}
                          disabled={isSavingReopeningDate}
                        >
                          {isSavingReopeningDate ? "Saving..." : "Save Reopening Date"}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-900">
                      <p className="font-semibold">Tip</p>
                      <p className="mt-1">
                        Enter a single integer per student (e.g. 60) and set the total attendance (e.g. 90). The report will display 60/90.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsUniversalModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSavingAttendance}>
                      {isSavingAttendance ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </div>
              )}

              {!isAssessmentModal && activeModalTitle !== "Attendance" && (
                <>
              {/* Common Fields: Student Name (for individual records) */}
              {(activeModalTitle === "Attendance" || activeModalTitle === "Student Leaves") && (
                <Input
                  label="Student Name"
                  value={genericStudentName}
                  onChange={(e) => setGenericStudentName(e.target.value)}
                  placeholder="Full name of student"
                  required
                />
              )}

              {/* Title / Name Field */}
              {activeModalTitle !== "Attendance" && activeModalTitle !== "Student Leaves" && activeModalTitle !== "Time Table" && (
                <Input
                  label={activeModalTitle === "Sections" ? "Section Name" : activeModalTitle === "Subjects" ? "Subject Name" : "Title / Name"}
                  value={genericTitle}
                  onChange={(e) => setGenericTitle(e.target.value)}
                  placeholder={`Enter ${activeModalTitle.toLowerCase()} name`}
                  required
                />
              )}

              {/* Class Selection */}
              {activeModalTitle !== "Sections" && activeModalTitle !== "Subjects" && activeModalTitle !== "Notice Board" && activeModalTitle !== "Events" && (
                <Select
                  label="Class"
                  value={genericClass}
                  onChange={(e) => setGenericClass(e.target.value)}
                  options={classOptions}
                  required
                />
              )}

              {/* Subject Field */}
              {(activeModalTitle === "Assessments" || activeModalTitle === "Home Work" || activeModalTitle === "Study Materials" || activeModalTitle === "Time Table") && (
                <Input
                  label="Subject"
                  value={genericSubject}
                  onChange={(e) => setGenericSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                />
              )}

              {/* Sections / Subjects Specific */}
              {(activeModalTitle === "Sections" || activeModalTitle === "Subjects") && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={activeModalTitle === "Subjects" ? "Subject Code" : "Capacity"}
                    value={activeModalTitle === "Subjects" ? genericCode : genericCapacity}
                    onChange={(e) => activeModalTitle === "Subjects" ? setGenericCode(e.target.value) : setGenericCapacity(e.target.value)}
                    placeholder={activeModalTitle === "Subjects" ? "MAT-101" : "e.g. 40"}
                    required
                  />
                  <Input
                    label="Category"
                    value={genericCategory}
                    onChange={(e) => setGenericCategory(e.target.value)}
                    placeholder="e.g. Core, Elective, Primary"
                    required
                  />
                </div>
              )}

              {/* Reports Specific */}
              {/* Time Table Specific */}
              {activeModalTitle === "Time Table" && (
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Day"
                    value={genericDay}
                    onChange={(e) => setGenericDay(e.target.value)}
                    options={[
                      { value: "Monday", label: "Monday" },
                      { value: "Tuesday", label: "Tuesday" },
                      { value: "Wednesday", label: "Wednesday" },
                      { value: "Thursday", label: "Thursday" },
                      { value: "Friday", label: "Friday" },
                    ]}
                  />
                  <Input label="Period" value={genericPeriod} onChange={(e) => setGenericPeriod(e.target.value)} placeholder="e.g. 1st Period" required />
                </div>
              )}

              {/* Attendance / Leaves / Homework / Live Classes Status */}
              {(activeModalTitle === "Attendance" || activeModalTitle === "Student Leaves" || activeModalTitle === "Home Work" || activeModalTitle === "Live Classes (Go Pro)" || activeModalTitle === "Sections") && (
                <Select
                  label="Status"
                  value={genericStatus}
                  onChange={(e) => setGenericStatus(e.target.value)}
                  options={
                    activeModalTitle === "Attendance"
                      ? [{ value: "Present", label: "Present" }, { value: "Absent", label: "Absent" }, { value: "Late", label: "Late" }]
                      : activeModalTitle === "Student Leaves"
                        ? [{ value: "Pending", label: "Pending" }, { value: "Approved", label: "Approved" }, { value: "Rejected", label: "Rejected" }]
                        : activeModalTitle === "Home Work"
                          ? [{ value: "Open", label: "Open" }, { value: "Closed", label: "Closed" }]
                          : activeModalTitle === "Sections"
                            ? [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]
                            : [{ value: "Upcoming", label: "Upcoming" }, { value: "Ongoing", label: "Ongoing" }]
                  }
                />
              )}

              {/* Leaves Specific */}
              {activeModalTitle === "Student Leaves" && (
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Duration" value={genericDuration} onChange={(e) => setGenericDuration(e.target.value)} placeholder="e.g. 3 days" required />
                  <textarea
                    className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={genericReason}
                    onChange={(e) => setGenericReason(e.target.value)}
                    placeholder="Reason for leave..."
                    required
                  />
                </div>
              )}

              {/* Events Specific */}
              {activeModalTitle === "Events" && (
                <Input label="Location" value={genericLocation} onChange={(e) => setGenericLocation(e.target.value)} placeholder="e.g. School Hall" required />
              )}

              {/* Live Classes / Time Table Specific Teacher */}
              {(activeModalTitle === "Live Classes (Go Pro)" || activeModalTitle === "Time Table") && (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Teacher" value={genericTeacher} onChange={(e) => setGenericTeacher(e.target.value)} placeholder="Enter teacher name" required />
                  {activeModalTitle === "Live Classes (Go Pro)" && (
                    <Input label="Start Time" value={genericStartTime} onChange={(e) => setGenericStartTime(e.target.value)} placeholder="e.g. 10:00 AM" required />
                  )}
                </div>
              )}

              {/* Date Field */}
              {activeModalTitle !== "Sections" && activeModalTitle !== "Subjects" && activeModalTitle !== "Time Table" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{activeModalTitle === "Home Work" ? "Deadline" : "Date"}</label>
                  <input
                    type="date"
                    title="Date"
                    value={genericDate}
                    onChange={(e) => setGenericDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              )}

              {/* Description / Content (for NoticeBoard, Events, Materials, Homework) */}
              {(activeModalTitle === "Notice Board" || activeModalTitle === "Events" || activeModalTitle === "Study Materials" || activeModalTitle === "Home Work") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description / Content</label>
                  <textarea
                    className="w-full min-h-24 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    value={genericDescription}
                    onChange={(e) => setGenericDescription(e.target.value)}
                    placeholder="Enter details..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsUniversalModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save {activeModalTitle}
                </Button>
              </div>
                </>
              )}
            </form>
          </motion.div>
        </div>
      )
      }
    </DashboardLayout >
  );
}

function CompactScoreInput({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-[120px] items-center overflow-hidden rounded border border-slate-200 bg-white">
      <input
        type="number"
        min={0}
        max={max}
        step="0.1"
        value={value === 0 ? "" : value}
        placeholder="0"
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        className="h-8 w-full border-0 px-2 text-xs text-slate-800 focus:outline-none"
      />
      <span className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-[10px] text-slate-500">/{max}</span>
    </div>
  );
}
