export type UserRole =
  | "proprietor"
  | "administrator"
  | "headmaster"
  | "subject_teacher"
  | "class_teacher"
  | "student";

export type ReportChannel = "whatsapp" | "email" | "pdf_download";

export interface Branch {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  country: string;
  timezone: string;
  registrationNumber: string;
  taxNumber?: string;
  isActive: boolean;
}

export interface SchoolUser {
  id: string;
  fullName: string;
  role: UserRole;
  branchId: string;
  classTeacherFor?: string;
  email: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  branchId: string;
  className: string;
  section: string;
  rollNumber: string;
  guardianPhone: string;
}

export interface Assessment {
  id: string;
  branchId: string;
  className: string;
  subject: string;
  term: "first_term" | "second_term" | "third_term";
  maxScore: number;
  assessmentDate: string;
  createdBy: string;
}

export interface TerminalReport {
  id: string;
  branchId: string;
  studentId: string;
  className: string;
  term: "first_term" | "second_term" | "third_term";
  scorePercent: number;
  grade: string;
  generatedAt: string;
  deliveryChannels: ReportChannel[];
}

export interface DataUploadTemplate {
  id: string;
  name: string;
  entity: "students" | "staff" | "assessments" | "fees";
  requiredColumns: string[];
}

export interface DataUploadJob {
  id: string;
  templateId: string;
  fileName: string;
  branchId: string;
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: string;
  uploadedBy: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
}

export interface SchoolPortalCapability {
  canManageUsers: boolean;
  canGenerateReports: boolean;
  canSendWhatsapp: boolean;
  canSendEmail: boolean;
  canUploadExcel: boolean;
  canDownloadPdf: boolean;
}
