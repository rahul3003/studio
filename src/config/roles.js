import { ShieldCheck, UserCog, Briefcase, Users, User, Crown, LayoutDashboard, Building2, FolderKanban, ListTodo, Receipt, BriefcaseBusiness, CalendarCheck, Settings, FileText, Calculator, UserCircle2, Award, DollarSign, CalendarDays } from "lucide-react";

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
  superadmin: ["manager", "hr", "accounts", "employee"], 
  manager: ["employee"], 
  hr: ["employee"], 
  accounts: ["employee"], 
  employee: [], 
};

/**
 * @typedef {object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {import("lucide-react").LucideIcon} icon
 */

const commonManagementNavItems = [
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/departments", label: "Departments", icon: Building2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
  { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/dashboard/attendance", label: "Attendance Mgmt", icon: CalendarCheck },
  { href: "/dashboard/documents", label: "Document Generation", icon: FileText },
];

const employeeProfileNavItems = [
  { href: "/dashboard/profile", label: "Personal Info", icon: UserCircle2 },
  { href: "/dashboard/profile/rewards", label: "My Rewards", icon: Award },
  { href: "/dashboard/profile/my-attendance", label: "My Attendance", icon: CalendarCheck },
  { href: "/dashboard/profile/remuneration", label: "My Remuneration", icon: DollarSign },
  { href: "/dashboard/profile/my-documents", label: "My Documents", icon: FileText },
  { href: "/dashboard/profile/holidays", label: "Holiday List", icon: CalendarDays },
];

/** @type {Record<string, NavItem[]>} */
export const ROLE_NAV_CONFIG = {
  superadmin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...employeeProfileNavItems,
    ...commonManagementNavItems,
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...employeeProfileNavItems,
    { href: "/dashboard/employees", label: "Team Members", icon: Users }, // Specific to manager
    { href: "/dashboard/projects", label: "Team Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Team Tasks", icon: ListTodo },
    { href: "/dashboard/attendance", label: "Team Attendance", icon: CalendarCheck }, // Main attendance for team
    { href: "/dashboard/reimbursements", label: "Approve Claims", icon: Receipt },
    { href: "/dashboard/jobs", label: "Job Openings", icon: BriefcaseBusiness }, // View jobs
    { href: "/dashboard/documents", label: "Generate Docs", icon: FileText },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  hr: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...employeeProfileNavItems,
    { href: "/dashboard/employees", label: "Manage Employees", icon: Users },
    { href: "/dashboard/departments", label: "Manage Departments", icon: Building2 },
    { href: "/dashboard/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance Records", icon: CalendarCheck }, // Main attendance
    { href: "/dashboard/documents", label: "HR Documents", icon: FileText }, // Document generation
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt }, // View/process
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  accounts: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...employeeProfileNavItems,
    { href: "/dashboard/reimbursements", label: "Manage Reimbursements", icon: Receipt },
    { href: "/dashboard/documents", label: "Generate Pay Slips", icon: FileText }, // Specific document generation
    { href: "/dashboard/employees", label: "Employee List", icon: Users }, // View employees for payroll
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  employee: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...employeeProfileNavItems,
    { href: "/dashboard/tasks", label: "My Tasks", icon: ListTodo }, // Tasks assigned to them
    { href: "/dashboard/reimbursements", label: "My Reimbursements", icon: Receipt }, // Submit/view their claims
    // { href: "/dashboard/projects", label: "My Projects", icon: FolderKanban }, // Projects they are part of - can be added if project assignment is detailed
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
};
