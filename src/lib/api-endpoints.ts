const normalize = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

export const API_ENDPOINTS = {
  classes: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_CLASSES ?? "/classes"),
  students: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_STUDENTS ?? "/students"),
  subjects: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_SUBJECTS ?? "/subjects"),
  assessments: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_ASSESSMENTS ?? "/assessments"),
  usersManagement: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_USERS_MANAGEMENT ?? "/users-management"),
  settingsHub: normalize(process.env.NEXT_PUBLIC_API_ENDPOINT_SETTINGS_HUB ?? "/settings/hub"),
};
