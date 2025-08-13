import { z } from 'zod';

import { EmployeeFormData } from '@/types/employee';

// Comprehensive validation schema
export const employeeSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], 'Gender is required'),
maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], 'Marital status is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  bloodGroup: z.string().optional(),
  
  // Contact Information
  permanentAddress: z.string().min(1, 'Permanent address is required'),
  mobileNumber: z.string().min(10, 'Valid mobile number is required'),
  alternateContactNumber: z.string().optional(),
  
  // Government IDs
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  panCardNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  voterIdOrLicense: z.string().optional(),
  
  // Employment Details
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern'], 'Employment type is required' ),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  workLocation: z.string().min(1, 'Work location is required'),
  reportingManager: z.string().optional(),

  // Salary & Benefits
  salaryCode: z.string().min(1, 'Salary code is required'),
  skillCategory: z.string().optional(),
  pfApplicability: z.boolean(),
  esicApplicability: z.boolean(),
  professionalTaxApplicability: z.boolean(),
  salaryAdvanceOrLoan: z.number().optional(),
  
  // Government Schemes
  uanNumber: z.string().optional(),
  esicNumber: z.string().optional(),
  
  // Bank Details
  bankAccountNumber: z.string().min(1, 'Bank account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  
  // Education
  highestQualification: z.string().min(1, 'Highest qualification is required'),
  yearOfPassing: z.number().min(1900).max(new Date().getFullYear()),
  additionalCertifications: z.string().optional(),
  experienceDuration: z.number().min(0, 'Experience duration must be positive'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyRelationship: z.string().min(1, 'Relationship is required'),
  emergencyPhoneNumber: z.string().min(10, 'Valid emergency phone number is required'),
});


export type EmployeeFormSchema = z.infer<typeof employeeSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;