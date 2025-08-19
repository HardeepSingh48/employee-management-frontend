/**
 * Application routes configuration
 * Centralized route definitions for better maintainability
 */

export const ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/dashboard',
    EMPLOYEES: {
      BASE: '/employees',
      REGISTER: '/employees/register',
      LIST: '/employees/list',
      BULK_IMPORT: '/employees/bulk-import',
      DETAILS: (id: string) => `/employees/${id}`,
    },
    ATTENDANCE: {
      BASE: '/attendance',
      MARK: '/attendance/mark',
      REPORTS: '/attendance/reports',
    },
    SALARY_CODES: {
      BASE: '/salary-codes',
      CREATE: '/salary-codes/create',
      LIST: '/salary-codes/list',
    },
    SALARY: {
      BASE: '/salary',
      CALCULATE: '/salary/calculate',
      REPORTS: '/salary/reports',
    },
    REPORTS: '/reports',
  },

  // Employee routes
  EMPLOYEE: {
    DASHBOARD: '/employee/dashboard',
    PROFILE: '/employee/profile',
    ATTENDANCE: '/employee/attendance',
    SALARY: '/employee/salary',
  },

  // Error routes
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    SERVER_ERROR: '/500',
  },
} as const;

// Helper function to check if route is admin route
export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard') || 
         pathname.startsWith('/employees') || 
         pathname.startsWith('/attendance') || 
         pathname.startsWith('/salary-codes') || 
         pathname.startsWith('/salary') ||
         pathname.startsWith('/reports');
};

// Helper function to check if route is employee route
export const isEmployeeRoute = (pathname: string): boolean => {
  return pathname.startsWith('/employee');
};

// Helper function to check if route is public
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes: string[] = [ROUTES.PUBLIC.HOME, ROUTES.PUBLIC.LOGIN];
  return publicRoutes.includes(pathname);
};


// Helper function to get redirect route based on user role
export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD;
    case 'employee':
      return ROUTES.EMPLOYEE.DASHBOARD;
    default:
      return ROUTES.PUBLIC.LOGIN;
  }
};

export default ROUTES;
