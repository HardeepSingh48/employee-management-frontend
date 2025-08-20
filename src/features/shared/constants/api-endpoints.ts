/**
 * Centralized API endpoints configuration
 * Organize endpoints by feature/domain for better maintainability
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },

  // Employee management endpoints
  EMPLOYEES: {
    BASE: '/api/employees',
    REGISTER: '/api/employees/register',
    BULK_IMPORT: '/api/employees/bulk-import',
    BY_ID: (id: string) => `/api/employees/${id}`,
    LIST: '/api/employees/list',
    ALL: '/api/employees/all',
  },

  // Department endpoints
  DEPARTMENTS: {
    BASE: '/api/departments',
    CREATE: '/api/departments',
    LIST: '/api/departments',
    BY_ID: (id: string) => `/api/departments/${id}`,
  },

  // Salary code endpoints
  SALARY_CODES: {
    BASE: '/api/salary-codes',
    CREATE: '/api/salary-codes',
    LIST: '/api/salary-codes',
    BULK_IMPORT: '/api/salary-codes/bulk-import',
    BY_ID: (id: string) => `/api/salary-codes/${id}`,
  },

  // Attendance endpoints (Admin)
  ATTENDANCE: {
    BASE: '/api/attendance',
    MARK: '/api/attendance/mark',
    BULK_MARK: '/api/attendance/bulk-mark',
    BY_EMPLOYEE: (employeeId: string) => `/api/attendance/employee/${employeeId}`,
    MONTHLY_SUMMARY: (employeeId: string) => `/api/attendance/monthly-summary/${employeeId}`,
    REPORTS: '/api/attendance/reports',
  },

  // Employee self-service endpoints
  EMPLOYEE: {
    PROFILE: '/api/employee/profile',
    ATTENDANCE: {
      MARK: '/api/employee/attendance/mark',
      HISTORY: '/api/employee/attendance/history',
      SUMMARY: '/api/employee/attendance/summary',
    },
    SALARY: {
      CURRENT: '/api/employee/salary/current',
    },
    DASHBOARD: {
      STATS: '/api/employee/dashboard/stats',
    },
  },

  // Salary calculation endpoints
  SALARY: {
    BASE: '/api/salary',
    UPLOAD: '/api/salary/upload',
    CALCULATE_MONTHLY: '/api/salary/calculate-monthly',
    CALCULATE_INDIVIDUAL: '/api/salary/calculate-individual',
    REPORTS: '/api/salary/reports',
  },

  // Forms endpoints
  FORMS: {
    BASE: '/forms',
    FORM_B: '/forms/form-b',
    FORM_B_DOWNLOAD: '/forms/form-b/download',
  },

  // File upload endpoints
  UPLOADS: {
    EMPLOYEE_DOCUMENTS: '/api/uploads/employee-documents',
    ATTENDANCE_SHEETS: '/api/uploads/attendance-sheets',
    SALARY_SHEETS: '/api/uploads/salary-sheets',
  },
} as const;

// Helper function to build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to build endpoint with query params
export const buildEndpoint = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryString(params)}`;
};

export default API_ENDPOINTS;
