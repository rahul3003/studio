
import { ShieldCheck, UserCog, Briefcase, Users, User, Crown } from "lucide-react";

/**
 * @typedef {object} Role
 * @property {string} name
 * @property {string} value
 * @property {import("lucide-react").LucideIcon} icon
 * @property {string} description
 */

/** @type {Role[]} */
export const ROLES = [
  { name: "Super Admin", value: "superadmin", icon: Crown, description: "Full system access and control." },
  { name: "Admin", value: "admin", icon: ShieldCheck, description: "Manages users and system settings." },
  { name: "Manager", value: "manager", icon: Briefcase, description: "Manages teams and projects." },
  { name: "Team Lead", value: "teamlead", icon: Users, description: "Leads a team of employees." },
  { name: "Employee", value: "employee", icon: User, description: "Standard employee access." },
];

/**
 * @param {string} value
 * @returns {Role | undefined}
 */
export const getRole = (value) => ROLES.find(r => r.value === value);

// Defines which roles can switch to which other roles
/** @type {Record<string, string[]>} */
export const ROLE_SWITCH_PERMISSIONS = {
  superadmin: ["admin", "manager", "teamlead", "employee"],
  admin: ["manager", "teamlead", "employee"],
  manager: ["employee"],
  teamlead: ["employee"],
  employee: [],
};
