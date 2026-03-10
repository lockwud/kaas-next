export const SUBJECTS_STORAGE_KEY = "kaas_subjects";

export type StoredSubject = {
  id: string;
  name: string;
  code?: string;
  category?: string;
  status?: string;
  classId?: string;
  teacherId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type CreateSubjectInput = {
  name: string;
  code?: string;
  category?: string;
  status?: string;
  classId?: string;
  teacherId?: string;
  description?: string;
};

const createSubjectId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `subject_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const loadSubjects = (): StoredSubject[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredSubject[];
    }
  } catch {
    // Ignore malformed values and fallback to empty.
  }

  return [];
};

export const saveSubjects = (records: StoredSubject[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(records));
};

export const createSubjectRecord = (input: CreateSubjectInput): StoredSubject => {
  const now = new Date().toISOString();
  return {
    id: createSubjectId(),
    name: input.name.trim(),
    code: input.code?.trim(),
    category: input.category,
    status: input.status,
    classId: input.classId,
    teacherId: input.teacherId,
    description: input.description?.trim(),
    createdAt: now,
    updatedAt: now,
  };
};
