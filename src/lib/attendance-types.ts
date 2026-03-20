export type AttendanceEntry = {
  studentId: string;
  present: number;
};

export type AttendanceRecord = {
  classId: string;
  classLabel?: string;
  term: string;
  academicYear: string;
  total: number;
  date?: string;
  entries: AttendanceEntry[];
  updatedAt?: string;
};

export type VacationDateRecord = {
  term: string;
  academicYear: string;
  vacationDate: string;
  updatedAt?: string;
};

export type ReopeningDateRecord = {
  term: string;
  academicYear: string;
  reopeningDate: string;
  updatedAt?: string;
};
