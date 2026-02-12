import {
  Assessment,
  Branch,
  DataUploadJob,
  DataUploadTemplate,
  SchoolPortalCapability,
  SchoolUser,
  Student,
  TerminalReport,
  UserRole,
} from "../types/school";

export const SCHOOL_ID = "school_001";

export const roleLabels: Record<UserRole, string> = {
  proprietor: "Proprietor",
  administrator: "Administrator",
  headmaster: "Headmaster",
  subject_teacher: "Subject Teacher",
  class_teacher: "Class Teacher",
  student: "Student",
};

export const roleCapabilities: Record<UserRole, SchoolPortalCapability> = {
  proprietor: {
    canManageUsers: true,
    canGenerateReports: true,
    canSendWhatsapp: true,
    canSendEmail: true,
    canUploadExcel: true,
    canDownloadPdf: true,
  },
  administrator: {
    canManageUsers: true,
    canGenerateReports: true,
    canSendWhatsapp: true,
    canSendEmail: true,
    canUploadExcel: true,
    canDownloadPdf: true,
  },
  headmaster: {
    canManageUsers: true,
    canGenerateReports: true,
    canSendWhatsapp: true,
    canSendEmail: true,
    canUploadExcel: true,
    canDownloadPdf: true,
  },
  subject_teacher: {
    canManageUsers: false,
    canGenerateReports: true,
    canSendWhatsapp: false,
    canSendEmail: false,
    canUploadExcel: false,
    canDownloadPdf: true,
  },
  class_teacher: {
    canManageUsers: false,
    canGenerateReports: true,
    canSendWhatsapp: true,
    canSendEmail: true,
    canUploadExcel: false,
    canDownloadPdf: true,
  },
  student: {
    canManageUsers: false,
    canGenerateReports: false,
    canSendWhatsapp: false,
    canSendEmail: false,
    canUploadExcel: false,
    canDownloadPdf: true,
  },
};

export const branches: Branch[] = [
  {
    id: "branch_main",
    schoolId: SCHOOL_ID,
    code: "MAIN",
    name: "Main Campus",
    email: "main@kaasacademy.edu",
    phone: "+1-202-555-0110",
    address: "12 Palm Street",
    state: "Lagos",
    district: "Ikeja",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    registrationNumber: "KAAS-REG-001",
    taxNumber: "KAAS-TAX-440",
    isActive: true,
  },
  {
    id: "branch_annex",
    schoolId: SCHOOL_ID,
    code: "ANNX",
    name: "Annex Campus",
    email: "annex@kaasacademy.edu",
    phone: "+1-202-555-0111",
    address: "38 Marina Road",
    state: "Lagos",
    district: "Lekki",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    registrationNumber: "KAAS-REG-002",
    taxNumber: "KAAS-TAX-441",
    isActive: true,
  },
];

export const users: SchoolUser[] = [
  {
    id: "u_01",
    fullName: "Ade Kola",
    role: "proprietor",
    branchId: "branch_main",
    email: "proprietor@kaasacademy.edu",
  },
  {
    id: "u_02",
    fullName: "Mercy Bassey",
    role: "headmaster",
    branchId: "branch_main",
    email: "headmaster@kaasacademy.edu",
  },
  {
    id: "u_03",
    fullName: "Ify Nwosu",
    role: "class_teacher",
    branchId: "branch_main",
    classTeacherFor: "JSS 2A",
    email: "ify@kaasacademy.edu",
  },
  {
    id: "u_04",
    fullName: "Tunde Salami",
    role: "subject_teacher",
    branchId: "branch_annex",
    email: "tunde@kaasacademy.edu",
  },
];

export const students: Student[] = [
  {
    id: "st_001",
    admissionNo: "KA-0001",
    fullName: "Daniel Moses",
    branchId: "branch_main",
    className: "JSS 2",
    section: "A",
    rollNumber: "12",
    guardianPhone: "+1-202-555-1212",
  },
  {
    id: "st_002",
    admissionNo: "KA-0002",
    fullName: "Sandra Ene",
    branchId: "branch_main",
    className: "JSS 2",
    section: "A",
    rollNumber: "13",
    guardianPhone: "+1-202-555-1213",
  },
  {
    id: "st_003",
    admissionNo: "KA-0003",
    fullName: "Musa Idris",
    branchId: "branch_annex",
    className: "SS 1",
    section: "B",
    rollNumber: "4",
    guardianPhone: "+1-202-555-1214",
  },
];

export const assessments: Assessment[] = [
  {
    id: "as_001",
    branchId: "branch_main",
    className: "JSS 2",
    subject: "Mathematics",
    term: "first_term",
    maxScore: 100,
    assessmentDate: "2026-02-05",
    createdBy: "u_03",
  },
  {
    id: "as_002",
    branchId: "branch_main",
    className: "JSS 2",
    subject: "English",
    term: "first_term",
    maxScore: 100,
    assessmentDate: "2026-02-06",
    createdBy: "u_04",
  },
];

export const reports: TerminalReport[] = [
  {
    id: "rp_001",
    branchId: "branch_main",
    studentId: "st_001",
    className: "JSS 2",
    term: "first_term",
    scorePercent: 84,
    grade: "A",
    generatedAt: "2026-02-10",
    deliveryChannels: ["whatsapp", "pdf_download"],
  },
  {
    id: "rp_002",
    branchId: "branch_annex",
    studentId: "st_003",
    className: "SS 1",
    term: "first_term",
    scorePercent: 72,
    grade: "B",
    generatedAt: "2026-02-09",
    deliveryChannels: ["email"],
  },
];

export const uploadTemplates: DataUploadTemplate[] = [
  {
    id: "tpl_students",
    name: "Students Bulk Upload",
    entity: "students",
    requiredColumns: ["admissionNo", "fullName", "className", "section", "rollNumber", "guardianPhone"],
  },
  {
    id: "tpl_assessments",
    name: "Assessment Score Upload",
    entity: "assessments",
    requiredColumns: ["admissionNo", "subject", "term", "score", "maxScore"],
  },
];

export const uploadJobs: DataUploadJob[] = [
  {
    id: "job_1001",
    templateId: "tpl_students",
    fileName: "students_jss2_first_term.xlsx",
    branchId: "branch_main",
    status: "completed",
    uploadedAt: "2026-02-11T10:00:00Z",
    uploadedBy: "u_02",
    totalRows: 120,
    successfulRows: 118,
    failedRows: 2,
  },
  {
    id: "job_1002",
    templateId: "tpl_assessments",
    fileName: "math_scores_jss2.xlsx",
    branchId: "branch_main",
    status: "processing",
    uploadedAt: "2026-02-12T08:20:00Z",
    uploadedBy: "u_03",
    totalRows: 64,
    successfulRows: 51,
    failedRows: 0,
  },
];

export function getBranchName(branchId: string): string {
  return branches.find((branch) => branch.id === branchId)?.name ?? "Unknown Branch";
}

export function getStudentName(studentId: string): string {
  return students.find((student) => student.id === studentId)?.fullName ?? "Unknown Student";
}
