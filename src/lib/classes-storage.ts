import { SCHOOL_ID, students } from "./school-data";
import { SchoolClass } from "../types/school";

export const CLASSES_STORAGE_KEY = "kaas_classes";

const normalize = (value: string) => value.trim().toLowerCase();

const createClassId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `class_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const getSeedClasses = (): SchoolClass[] => {
  const seen = new Set<string>();

  return students
    .map((student) => {
      const key = `${normalize(student.className)}|${normalize(student.section)}`;
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);
      const now = new Date().toISOString();

      return {
        id: createClassId(),
        schoolId: SCHOOL_ID,
        className: student.className,
        section: student.section,
        createdAt: now,
        updatedAt: now,
      };
    })
    .filter((entry): entry is SchoolClass => entry !== null);
};

export const loadClasses = (): SchoolClass[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CLASSES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SchoolClass[];
    }
  } catch {
    // Ignore malformed values and reseed.
  }

  const seeded = getSeedClasses();
  window.localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const saveClasses = (records: SchoolClass[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(records));
};

interface CreateClassOptions {
  classTeacherId?: string;
  classTeacherName?: string;
  sourceSections?: string[];
  assignedStudentIds?: string[];
}

export const createClassRecord = (
  className: string,
  section: string,
  options?: CreateClassOptions,
): SchoolClass => {
  const now = new Date().toISOString();
  return {
    id: createClassId(),
    schoolId: SCHOOL_ID,
    className: className.trim(),
    section: section.trim(),
    classTeacherId: options?.classTeacherId,
    classTeacherName: options?.classTeacherName,
    sourceSections: options?.sourceSections,
    assignedStudentIds: options?.assignedStudentIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
};

export const hasDuplicateClass = (
  records: SchoolClass[],
  className: string,
  section: string,
  exceptId?: string,
) =>
  records.some((item) => {
    if (exceptId && item.id === exceptId) {
      return false;
    }

    return normalize(item.className) === normalize(className) && normalize(item.section) === normalize(section);
  });
