import type { AppRole } from "./auth-session";

type AccessRule = {
  prefix: string;
  roles: AppRole[];
};

const RULES: AccessRule[] = [
  { prefix: "/AdminDashboard/Settings", roles: ["proprietor", "administrator"] },
  { prefix: "/AdminDashboard/Organization", roles: ["proprietor", "administrator"] },
  { prefix: "/AdminDashboard/Billing", roles: ["proprietor", "administrator"] },
  { prefix: "/AdminDashboard/Finance", roles: ["proprietor", "administrator"] },
  { prefix: "/AdminDashboard/HR", roles: ["proprietor", "administrator", "headmaster"] },
  {
    prefix: "/AdminDashboard/Academics",
    roles: ["proprietor", "administrator", "headmaster", "subject_teacher", "class_teacher"],
  },
  { prefix: "/AdminDashboard/MySchool", roles: ["proprietor", "administrator", "headmaster"] },
];

export const canAccessPath = (path: string, role: AppRole): boolean => {
  if (role === "guest") return false;
  const rule = RULES.find((entry) => path.startsWith(entry.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
};
