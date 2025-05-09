
import { ShieldCheck, UserCog, Briefcase, Users, User, Crown, LayoutDashboard, Building2, FolderKanban, ListTodo, Receipt, BriefcaseBusiness, CalendarCheck, Settings } from "lucide-react";

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

/**
 * @typedef {object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {import("lucide-react").LucideIcon} icon
 */

/** @type {Record<string, NavItem[]>} */
export const ROLE_NAV_CONFIG = {
  superadmin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: Users },
    { href: "/dashboard/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
    { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: Users },
    { href: "/dashboard/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
    { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: Users },
    { href: "/dashboard/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
    { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  teamlead: [ // Assuming Team Lead has same access as Manager based on prompt
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: Users },
    { href: "/dashboard/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
    { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/dashboard/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  employee: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/my-projects", label: "My Projects", icon: FolderKanban },
    { href: "/dashboard/my-tasks", label: "My Tasks", icon: ListTodo },
    { href: "/dashboard/my-reimbursements", label: "My Reimbursements", icon: Receipt },
    { href: "/dashboard/my-attendance", label: "My Attendance", icon: CalendarCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
};
