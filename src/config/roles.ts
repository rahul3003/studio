import type { LucideIcon } from "lucide-react";
import { ShieldCheck, UserCog, Briefcase, Users, User, Crown } from "lucide-react";

export type Role = {
  name: string;
  value: string;
  icon: LucideIcon;
  description: string;
};

export const ROLES: Role[] = [
  { name: "Super Admin", value: "superadmin", icon: Crown, description: "Full system access and control." },
  { name: "Admin", value: "admin", icon: ShieldCheck, description: "Manages users and system settings." },
  { name: "Manager", value: "manager", icon: Briefcase, description: "Manages teams and projects." },
  { name: "Team Lead", value: "teamlead", icon: Users, description: "Leads a team of employees." },
  { name: "Employee", value: "employee", icon: User, description: "Standard employee access." },
];

export const getRole = (value: string): Role | undefined => ROLES.find(r => r.value === value);

// Defines which roles can switch to which other roles
export const ROLE_SWITCH_PERMISSIONS: Record<string, string[]> = {
  superadmin: ["admin", "manager", "teamlead", "employee"],
  admin: ["manager", "teamlead", "employee"],
  manager: ["employee"],
  teamlead: ["employee"],
  employee: [],
};
