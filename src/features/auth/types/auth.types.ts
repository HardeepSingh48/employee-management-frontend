/**
 * Authentication related types
 */

import { UserRole } from '@/features/shared/types/common.types';

// User types
export interface User {
  id: string;
  employee_id?: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  permissions: string[];
  last_login?: string;
  profile_image?: string;
  department?: string;
  created_date?: string;
}

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  department_id: string;
  designation: string;
  salary_code: string;
  phone_number?: string;
  email?: string;
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  employee?: Employee;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  employee_id?: string;
  department?: string;
  created_by?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  employee: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Permission types
export interface UserPermissions {
  canViewEmployees: boolean;
  canCreateEmployees: boolean;
  canEditEmployees: boolean;
  canDeleteEmployees: boolean;
  canMarkAttendance: boolean;
  canViewAttendance: boolean;
  canCalculateSalary: boolean;
  canViewReports: boolean;
  canManageSalaryCodes: boolean;
  canManageDepartments: boolean;
}

// Auth guard types
export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// Token types
export interface TokenPayload {
  user_id: string;
  employee_id?: string;
  email: string;
  role: UserRole;
  exp: number;
}

// Export all types
// export type {
//   User,
//   Employee,
//   LoginRequest,
//   LoginResponse,
//   RegisterRequest,
//   RegisterResponse,
//   AuthState,
//   AuthContextType,
//   UserPermissions,
//   AuthGuardProps,
//   TokenPayload,
// };
