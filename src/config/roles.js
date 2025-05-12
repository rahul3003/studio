import { ShieldCheck, UserCog, Briefcase, Users, User, Crown, LayoutDashboard, Building2, FolderKanban, ListTodo, Receipt, BriefcaseBusiness, CalendarCheck, Settings, FileText, Calculator, UserCircle2 } from "lucide-react";

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
  { name: "Manager", value: "manager", icon: Briefcase, description: "Manages teams, projects, and approvals." },
  { name: "HR", value: "hr", icon: UserCog, description: "Manages employee data, recruitment, and HR processes." },
  { name: "Accounts", value: "accounts", icon: Calculator, description: "Manages finances, payroll, and reimbursements." },
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
  superadmin: ["manager", "hr", "accounts", "employee"], // Super Admin can switch to any role
  manager: ["employee"], // Manager can switch to Employee
  hr: ["employee"], // HR can switch to Employee
  accounts: ["employee"], // Accounts can switch to Employee
  employee: [], // Employee cannot switch roles
};

/**
 * @typedef {object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {import("lucide-react").LucideIcon} icon
 */

const commonNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
  { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];


/** @type {Record<string, NavItem[]>} */
export const ROLE_NAV_CONFIG = {
  superadmin: [
    ...commonNavItems,
  ],
   manager: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 },
    { href: "/dashboard/employees", label: "Team Members", icon: Users },
    { href: "/dashboard/projects", label: "Team Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Team Tasks", icon: ListTodo },
    { href: "/dashboard/attendance", label: "Team Attendance", icon: CalendarCheck },
    { href: "/dashboard/reimbursements", label: "Approve Reimbursements", icon: Receipt },
    { href: "/dashboard/jobs", label: "Job Openings", icon: BriefcaseBusiness },
    { href: "/dashboard/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  hr: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 },
    { href: "/dashboard/employees", label: "Manage Employees", icon: Users },
    { href: "/dashboard/departments", label: "Manage Departments", icon: Building2 },
    { href: "/dashboard/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance Records", icon: CalendarCheck },
    { href: "/dashboard/documents", label: "HR Documents", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  accounts: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 },
    { href: "/dashboard/reimbursements", label: "Manage Reimbursements", icon: Receipt },
    { href: "/dashboard/documents", label: "Generate Pay Slips", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  employee: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserCircle2 },
    { href: "/dashboard/tasks", label: "My Tasks", icon: ListTodo },
    { href: "/dashboard/attendance", label: "My Attendance", icon: CalendarCheck },
    { href: "/dashboard/reimbursements", label: "My Reimbursements", icon: Receipt },
    { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
    { href: "/dashboard/documents", label: "My Documents", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
};