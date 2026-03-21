import { SchoolPortalCapability, UserRole } from "../types/school";

// Role labels for display purposes
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

// Note: All school data (branches, users, students, assessments, reports, etc.)
// should now be fetched from the API instead of using hardcoded data.
// Use apiRequest from @/lib/api-client to fetch data from backend endpoints.
