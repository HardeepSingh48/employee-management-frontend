// src/types/employee.ts
import type { EmployeeFormData } from "@/lib/validations/employee";
export type { EmployeeFormData } from "@/lib/validations/employee";

export interface Employee {
  id: string;

  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  nationality: string;
  bloodGroup?: string;

  // Contact Information
  permanentAddress: string;
  mobileNumber: string;
  alternateContactNumber?: string;

  // Government IDs
  aadhaarNumber: string;
  panCardNumber: string;
  voterIdOrLicense?: string;
  uanNumber?: string;
  esicNumber?: string;

  // Employment Details
  dateOfJoining: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern";
  department: string;
  designation: string;
  workLocation: string;
  reportingManager?: string;

  // Salary & Benefits
  salaryCode: string;
  skillCategory?: string;
  pfApplicability: boolean;
  esicApplicability: boolean;
  professionalTaxApplicability: boolean;
  salaryAdvanceOrLoan?: number;

  // Bank Details
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;

  // Education
  highestQualification: string;
  yearOfPassing: number;
  additionalCertifications?: string;
  experienceDuration: number;

  // Emergency Contact
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhoneNumber: string;

  // Documents
  chequeFileName?: string;
  chequeFileUrl?: string;

  // System fields
  status: "active" | "inactive";
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateRequest extends EmployeeFormData {
  chequeFile?: File;
}

// Summaries, filters, enums
export interface EmployeeSummary {
  id: string;
  fullName: string;
  department: string;
  designation: string;
  mobileNumber: string;
  status: "active" | "inactive";
  dateOfJoining: string;
  salaryCode?: string;
}

export interface EmployeeFilters {
  department?: string;
  designation?: string;
  employmentType?: string;
  status?: "active" | "inactive";
  searchTerm?: string;
}

export const DEPARTMENTS = [
  "HR",
  "IT",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Engineering",
  "Customer Support",
  "Legal",
  "Administration",
] as const;

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern",
] as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const QUALIFICATIONS = [
  "High School",
  "Intermediate",
  "Diploma",
  "Bachelor's",
  "Master's",
  "PhD",
] as const;

export const SKILL_CATEGORIES = [
  "Skilled",
  "Semi-Skilled",
  "Unskilled",
  "Highly Skilled",
] as const;
