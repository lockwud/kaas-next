import type { AppRole } from "./auth-session";

type AccessRule = {
  prefix: string;
  roles: AppRole[];
};

const STAFF_ROLES: AppRole[] = ["proprietor", "administrator", "headmaster", "subject_teacher", "class_teacher"];

const RULES: AccessRule[] = [
  { prefix: "/AdminDashboard/Settings", roles: STAFF_ROLES },
  { prefix: "/AdminDashboard/Organization", roles: STAFF_ROLES },
  { prefix: "/AdminDashboard/Billing", roles: STAFF_ROLES },
  { prefix: "/AdminDashboard/Finance", roles: STAFF_ROLES },
  { prefix: "/AdminDashboard/HR", roles: STAFF_ROLES },
  {
    prefix: "/AdminDashboard/Academics",
    roles: STAFF_ROLES,
  },
  { prefix: "/AdminDashboard/MySchool", roles: STAFF_ROLES },
];

export const canAccessPath = (path: string, role: AppRole): boolean => {
  if (role === "guest") return false;
  const rule = RULES.find((entry) => path.startsWith(entry.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
};
