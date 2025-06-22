export enum RoleType {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  HR = 'HR',
  ACCOUNTS = 'ACCOUNTS',
  EMPLOYEE = 'EMPLOYEE'
}

export enum DesignationType {
  INTERN = 'INTERN',
  TRAINEE = 'TRAINEE',
  JUNIOR_DEVELOPER = 'JUNIOR_DEVELOPER',
  ASSOCIATE_DEVELOPER = 'ASSOCIATE_DEVELOPER',
  DEVELOPER = 'DEVELOPER',
  SENIOR_DEVELOPER = 'SENIOR_DEVELOPER',
  TEAM_LEAD = 'TEAM_LEAD',
  PRINCIPAL_ENGINEER = 'PRINCIPAL_ENGINEER',
  JUNIOR_DESIGNER = 'JUNIOR_DESIGNER',
  DESIGNER = 'DESIGNER',
  SENIOR_DESIGNER = 'SENIOR_DESIGNER',
  HR_EXECUTIVE = 'HR_EXECUTIVE',
  SENIOR_HR = 'SENIOR_HR',
  SALES_REP = 'SALES_REP',
  SENIOR_SALES_REP = 'SENIOR_SALES_REP',
  ANALYST = 'ANALYST',
  SENIOR_ANALYST = 'SENIOR_ANALYST',
  ASSOCIATE_QA = 'ASSOCIATE_QA',
  QA_ENGINEER = 'QA_ENGINEER',
  SENIOR_QA = 'SENIOR_QA',
  DEVOPS_ENGINEER = 'DEVOPS_ENGINEER',
  SENIOR_DEVOPS_ENGINEER = 'SENIOR_DEVOPS_ENGINEER',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  SENIOR_PRODUCT_MANAGER = 'SENIOR_PRODUCT_MANAGER',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  ACCOUNTANT = 'ACCOUNTANT'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  PROBATION = 'PROBATION',
  RESIGNED = 'RESIGNED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum EmployeeType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTOR = 'CONTRACTOR',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface Document {
  name: string;
  url: string;
  status: DocumentStatus;
  required: boolean;
  number?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  branch: string;
}

export interface PersonalInformation {
  phone: string;
  address: string;
  personalEmail?: string;
  city?: string;
  documents: Document[];
  bankDetails: BankDetails;
}

export interface SecondaryData {
  currentPosition: string;
  currentRemuneration: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  totalAnnualLeave: number;
  totalSickLeave: number;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: RoleType;
  designation: DesignationType;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  status: EmployeeStatus;
  joinDate: string;
  gender: Gender;
  employeeType: EmployeeType;
  salary?: string;
  avatarUrl?: string;
  reportingManager?: {
    id: string;
    name: string;
  };
  reportingManagerId?: string;
  joiningLetterHtml?: string;
  baseRole?: string;
  currentRole?: string;
  personalInformation?: PersonalInformation;
  secondaryData?: SecondaryData;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
} 