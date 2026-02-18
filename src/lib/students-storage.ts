import { SCHOOL_ID, students as seededStudents } from "./school-data";
import { StudentDirectoryRecord } from "../types/school";

export const STUDENTS_STORAGE_KEY = "kaas_students_directory";

const createStudentId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const nowISO = () => new Date().toISOString();

const buildSeedStudents = (): StudentDirectoryRecord[] =>
  seededStudents.map((student) => ({
    id: student.id,
    schoolId: SCHOOL_ID,
    fullName: student.fullName,
    className: student.className,
    section: student.section,
    classAssignmentMode: "now",
    admissionDate: nowISO().slice(0, 10),
    academicYear: "2025/2026",
    guardianName: "Not Provided",
    guardianRelationship: "Guardian",
    guardianPrimaryContact: student.guardianPhone,
    guardianSecondaryContact: "",
    houseAddress: "Not Provided",
    emergencyContactName: "Not Provided",
    emergencyContactRelationship: "Guardian",
    emergencyContactPhone: student.guardianPhone,
    previousAcademicHistory: "",
    healthRecords: "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }));

export const loadStudentsDirectory = (): StudentDirectoryRecord[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StudentDirectoryRecord[];
    }
  } catch {
    // Ignore invalid storage payload and reseed.
  }

  const seeded = buildSeedStudents();
  window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const saveStudentsDirectory = (records: StudentDirectoryRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(records));
};

interface CreateStudentOptions {
  fullName: string;
  classAssignmentMode: "now" | "later";
  className?: string;
  section?: string;
  admissionDate: string;
  academicYear: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPrimaryContact: string;
  guardianSecondaryContact?: string;
  houseAddress: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  previousAcademicHistory?: string;
  healthRecords?: string;
}

export const createStudentDirectoryRecord = (payload: CreateStudentOptions): StudentDirectoryRecord => {
  const now = nowISO();

  return {
    id: createStudentId(),
    schoolId: SCHOOL_ID,
    fullName: payload.fullName.trim(),
    className: payload.classAssignmentMode === "now" ? payload.className?.trim() : undefined,
    section: payload.classAssignmentMode === "now" ? payload.section?.trim() : undefined,
    classAssignmentMode: payload.classAssignmentMode,
    admissionDate: payload.admissionDate,
    academicYear: payload.academicYear.trim(),
    guardianName: payload.guardianName.trim(),
    guardianRelationship: payload.guardianRelationship.trim(),
    guardianPrimaryContact: payload.guardianPrimaryContact.trim(),
    guardianSecondaryContact: payload.guardianSecondaryContact?.trim(),
    houseAddress: payload.houseAddress.trim(),
    emergencyContactName: payload.emergencyContactName.trim(),
    emergencyContactRelationship: payload.emergencyContactRelationship.trim(),
    emergencyContactPhone: payload.emergencyContactPhone.trim(),
    previousAcademicHistory: payload.previousAcademicHistory?.trim(),
    healthRecords: payload.healthRecords?.trim(),
    createdAt: now,
    updatedAt: now,
  };
};
