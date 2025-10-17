export const STAFF_ROLES = {
  MANAGER: "manager",
  EMPLOYEE: "employee",

} as const;

export type StaffRole = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];

export const ALLOWED_ROLES = Object.values(STAFF_ROLES);