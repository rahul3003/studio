import { ShieldCheck, UserCog, Briefcase, Users, User, Crown, LayoutDashboard, Building2, FolderKanban, ListTodo, Receipt, BriefcaseBusiness, CalendarCheck, Settings, FileText, Calculator, UserCircle2, Award, DollarSign, CalendarDays, Mail } from "lucide-react";

/**
 * @typedef {object} Role
 * @property {string} name
 * @property {string} value
 * @property {import("lucide-react").LucideIcon} icon
 * @property {string} description
 */

/** @type {Role[]} */
export const ROLES = [
  { name: "Super Admin", value: "SUPERADMIN", icon: Crown, description: "Full system access and control." },
  { name: "Admin", value: "ADMIN", icon: ShieldCheck, description: "Administrative access to most features." },
  { name: "Manager", value: "MANAGER", icon: Briefcase, description: "Manages teams, projects, and approvals." },
  { name: "HR", value: "HR", icon: UserCog, description: "Manages employee data, recruitment, and HR processes." },
  { name: "Accounts", value: "ACCOUNTS", icon: Calculator, description: "Manages finances, payroll, and reimbursements." },
  { name: "Employee", value: "EMPLOYEE", icon: User, description: "Standard employee access." },
];

/**
 * @param {string} value
 * @returns {Role | undefined}
 */
export const getRole = (value) => ROLES.find(r => r.value === value);

// Defines which roles can switch to which other roles
/** @type {Record<string, string[]>} */
export const ROLE_SWITCH_PERMISSIONS = {
  SUPERADMIN: ["ADMIN", "MANAGER", "HR", "ACCOUNTS", "EMPLOYEE"],
  ADMIN: ["MANAGER", "HR", "ACCOUNTS", "EMPLOYEE"],
  MANAGER: ["EMPLOYEE"],
  HR: ["EMPLOYEE"],
  ACCOUNTS: ["EMPLOYEE"],
  EMPLOYEE: [],
};

/**
 * @typedef {object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {import("lucide-react").LucideIcon} icon
 * @property {boolean} [showPoints] - Optional flag to show reward points badge
 * @property {NavItem[]} [children] - Optional children for collapsible submenus
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
  { href: "/dashboard/profile/rewards", label: "My Rewards", icon: Award, showPoints: true },
  { href: "/dashboard/profile/my-attendance", label: "My Attendance", icon: CalendarCheck },
  { href: "/dashboard/profile/remuneration", label: "My Remuneration", icon: DollarSign },
  { href: "/dashboard/profile/my-documents", label: "My Documents", icon: FileText },
  { href: "/dashboard/profile/holidays", label: "Holiday List", icon: CalendarDays },
];

/** @type {Record<string, NavItem[]>} */
export const ROLE_NAV_CONFIG = {
  SUPERADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile", // Base path for the group
      children: employeeProfileNavItems.map(item => ({...item, href: item.href})) // ensure full path
    },
    ...commonManagementNavItems,
    { href: "/dashboard/offers", label: "Offers", icon: Mail },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  ADMIN: [ 
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile",
      children: employeeProfileNavItems.map(item => ({...item, href: item.href}))
    },
    ...commonManagementNavItems,
    { href: "/dashboard/offers", label: "Offers", icon: Mail },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile",
      children: employeeProfileNavItems.map(item => ({...item, href: item.href}))
    },
    { href: "/dashboard/employees", label: "Team Members", icon: Users },
    { href: "/dashboard/projects", label: "Team Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Team Tasks", icon: ListTodo },
    { href: "/dashboard/attendance", label: "Team Attendance", icon: CalendarCheck },
    { href: "/dashboard/reimbursements", label: "Approve Claims", icon: Receipt },
    { href: "/dashboard/jobs", label: "Job Openings", icon: BriefcaseBusiness },
    { href: "/dashboard/documents", label: "Generate Docs", icon: FileText },
  ],
  HR: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile",
      children: employeeProfileNavItems.map(item => ({...item, href: item.href}))
    },
    { href: "/dashboard/employees", label: "Manage Employees", icon: Users },
    { href: "/dashboard/departments", label: "Manage Departments", icon: Building2 },
    { href: "/dashboard/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { href: "/dashboard/offers", label: "Manage Offers", icon: Mail },
    { href: "/dashboard/attendance", label: "Attendance Records", icon: CalendarCheck },
    { href: "/dashboard/documents", label: "HR Documents", icon: FileText },
    { href: "/dashboard/reimbursements", label: "Reimbursements", icon: Receipt },
  ],
  ACCOUNTS: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile",
      children: employeeProfileNavItems.map(item => ({...item, href: item.href}))
    },
    { href: "/dashboard/reimbursements", label: "Manage Reimbursements", icon: Receipt },
    { href: "/dashboard/documents", label: "Generate Pay Slips", icon: FileText },
    { href: "/dashboard/employees", label: "Employee List (View)", icon: Users },
  ],
  EMPLOYEE: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { 
      label: "Profile", 
      icon: UserCircle2, 
      href:"/dashboard/profile",
      children: employeeProfileNavItems.map(item => ({...item, href: item.href}))
    },
    { href: "/dashboard/tasks", label: "My Tasks", icon: ListTodo },
    { href: "/dashboard/reimbursements", label: "My Reimbursements", icon: Receipt },
  ],
};