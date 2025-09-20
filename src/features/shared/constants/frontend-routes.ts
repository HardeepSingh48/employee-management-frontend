/**
 * Frontend Routes Configuration
 * Comprehensive routing structure for the Employee Management System
 */

export const FRONTEND_ROUTES = {
  // Public Routes (No Authentication Required)
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
  },

  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  // Admin Routes (Role: admin, hr, manager)
  ADMIN: {
    // Dashboard
    DASHBOARD: '/dashboard',
    
    // Employee Management
    EMPLOYEES: {
      BASE: '/employees',
      LIST: '/employees/list',
      REGISTER: '/employees/register',
      BULK_IMPORT: '/employees/bulk-import',
      DETAILS: (id: string) => `/employees/${id}`,
      EDIT: (id: string) => `/employees/${id}/edit`,
      PROFILE: (id: string) => `/employees/${id}/profile`,
      DOCUMENTS: (id: string) => `/employees/${id}/documents`,
      HISTORY: (id: string) => `/employees/${id}/history`,
    },

    // Department Management
    DEPARTMENTS: {
      BASE: '/departments',
      LIST: '/departments/list',
      CREATE: '/departments/create',
      DETAILS: (id: string) => `/departments/${id}`,
      EDIT: (id: string) => `/departments/${id}/edit`,
      EMPLOYEES: (id: string) => `/departments/${id}/employees`,
    },

    // Attendance Management
    ATTENDANCE: {
      BASE: '/attendance',
      MARK: '/attendance/mark',
      BULK_MARK: '/attendance/bulk-mark',
      CALENDAR: '/attendance/calendar',
      REPORTS: '/attendance/reports',
      EMPLOYEE_HISTORY: (id: string) => `/attendance/employee/${id}`,
      MONTHLY_REPORT: '/attendance/monthly-report',
      DAILY_REPORT: '/attendance/daily-report',
      EXPORT: '/attendance/export',
    },

    // Salary Code Management
    SALARY_CODES: {
      BASE: '/salary-codes',
      LIST: '/salary-codes/list',
      CREATE: '/salary-codes/create',
      BULK_IMPORT: '/salary-codes/bulk-import',
      DETAILS: (id: string) => `/salary-codes/${id}`,
      EDIT: (id: string) => `/salary-codes/${id}/edit`,
      EXPORT: '/salary-codes/export',
    },

    // Salary & Payroll Management
    SALARY: {
      BASE: '/salary',
      CALCULATE: '/salary/calculate',
      MONTHLY_CALCULATION: '/salary/monthly-calculation',
      INDIVIDUAL_CALCULATION: '/salary/individual-calculation',
      BULK_CALCULATION: '/salary/bulk-calculation',
      REPORTS: '/salary/reports',
      PAYSLIPS: '/salary/payslips',
      EXPORT: '/salary/export',
      EMPLOYEE_SALARY: (id: string) => `/salary/employee/${id}`,
    },

    // Payroll Generation
    PAYROLL: {
      BASE: '/payroll',
      GENERATE: '/dashboard/payroll',
    },

    // Leave Management
    LEAVE: {
      BASE: '/leave',
      REQUESTS: '/leave/requests',
      APPROVE: '/leave/approve',
      CALENDAR: '/leave/calendar',
      POLICIES: '/leave/policies',
      REPORTS: '/leave/reports',
      EMPLOYEE_LEAVE: (id: string) => `/leave/employee/${id}`,
    },

    // Reports & Analytics
    REPORTS: {
      BASE: '/reports',
      DASHBOARD: '/reports/dashboard',
      ATTENDANCE: '/reports/attendance',
      SALARY: '/reports/salary',
      EMPLOYEE: '/reports/employee',
      DEPARTMENT: '/reports/department',
      CUSTOM: '/reports/custom',
      EXPORT: '/reports/export',
    },

    // Settings & Configuration
    SETTINGS: {
      BASE: '/settings',
      GENERAL: '/settings/general',
      USERS: '/settings/users',
      ROLES: '/settings/roles',
      PERMISSIONS: '/settings/permissions',
      COMPANY: '/settings/company',
      NOTIFICATIONS: '/settings/notifications',
      BACKUP: '/settings/backup',
    },

    // User Management
    USERS: {
      BASE: '/users',
      LIST: '/users/list',
      CREATE: '/users/create',
      DETAILS: (id: string) => `/users/${id}`,
      EDIT: (id: string) => `/users/${id}/edit`,
      PERMISSIONS: (id: string) => `/users/${id}/permissions`,
    },
  },

  // Employee Routes (Role: employee)
  EMPLOYEE: {
    // Dashboard
    DASHBOARD: '/employee/dashboard',
    
    // Profile Management
    PROFILE: {
      BASE: '/employee/profile',
      VIEW: '/employee/profile/view',
      EDIT: '/employee/profile/edit',
      DOCUMENTS: '/employee/profile/documents',
      EMERGENCY_CONTACTS: '/employee/profile/emergency-contacts',
    },

    // Attendance
    ATTENDANCE: {
      BASE: '/employee/attendance',
      MARK: '/employee/attendance/mark',
      HISTORY: '/employee/attendance/history',
      CALENDAR: '/employee/attendance/calendar',
      SUMMARY: '/employee/attendance/summary',
      EXPORT: '/employee/attendance/export',
    },

    // Salary Information
    SALARY: {
      BASE: '/employee/salary',
      CURRENT: '/employee/salary/current',
      HISTORY: '/employee/salary/history',
      PAYSLIPS: '/employee/salary/payslips',
      TAX_DOCUMENTS: '/employee/salary/tax-documents',
    },

    // Leave Management
    LEAVE: {
      BASE: '/employee/leave',
      REQUEST: '/employee/leave/request',
      HISTORY: '/employee/leave/history',
      BALANCE: '/employee/leave/balance',
      CALENDAR: '/employee/leave/calendar',
    },

    // Documents
    DOCUMENTS: {
      BASE: '/employee/documents',
      PERSONAL: '/employee/documents/personal',
      COMPANY: '/employee/documents/company',
      UPLOAD: '/employee/documents/upload',
    },

    // Settings
    SETTINGS: {
      BASE: '/employee/settings',
      ACCOUNT: '/employee/settings/account',
      NOTIFICATIONS: '/employee/settings/notifications',
      PRIVACY: '/employee/settings/privacy',
      PASSWORD: '/employee/settings/password',
    },
  },

  // Error Pages
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
    MAINTENANCE: '/maintenance',
  },

  // Help & Support
  HELP: {
    BASE: '/help',
    FAQ: '/help/faq',
    CONTACT: '/help/contact',
    DOCUMENTATION: '/help/documentation',
    TUTORIALS: '/help/tutorials',
    SUPPORT_TICKET: '/help/support-ticket',
  },
} as const;

// Route Groups for easier management
export const ROUTE_GROUPS = {
  PUBLIC: Object.values(FRONTEND_ROUTES.PUBLIC),
  AUTH: Object.values(FRONTEND_ROUTES.AUTH),
  ADMIN: [
    FRONTEND_ROUTES.ADMIN.DASHBOARD,
    ...Object.values(FRONTEND_ROUTES.ADMIN.EMPLOYEES).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.DEPARTMENTS).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.ATTENDANCE).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.SALARY_CODES).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.SALARY).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.LEAVE).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.REPORTS).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.SETTINGS).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.ADMIN.USERS).filter(route => typeof route === 'string'),
  ],
  EMPLOYEE: [
    FRONTEND_ROUTES.EMPLOYEE.DASHBOARD,
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.PROFILE).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.ATTENDANCE).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.SALARY).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.LEAVE).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.DOCUMENTS).filter(route => typeof route === 'string'),
    ...Object.values(FRONTEND_ROUTES.EMPLOYEE.SETTINGS).filter(route => typeof route === 'string'),
  ],
};

// Helper functions for route management
export const RouteHelpers = {
  // Check if route is public
  isPublicRoute: (pathname: string): boolean => {
  return (ROUTE_GROUPS.PUBLIC as string[]).includes(pathname);
},

  // Check if route is admin route
  isAdminRoute: (pathname: string): boolean => {
    return pathname.startsWith('/dashboard') || 
           pathname.startsWith('/employees') || 
           pathname.startsWith('/departments') ||
           pathname.startsWith('/attendance') || 
           pathname.startsWith('/salary-codes') || 
           pathname.startsWith('/salary') ||
           pathname.startsWith('/leave') ||
           pathname.startsWith('/reports') ||
           pathname.startsWith('/settings') ||
           pathname.startsWith('/users');
  },

  // Check if route is employee route
  isEmployeeRoute: (pathname: string): boolean => {
    return pathname.startsWith('/employee');
  },

  // Get default route for user role
  getDefaultRouteForRole: (role: string): string => {
    switch (role) {
      case 'admin':
      case 'superadmin':
      case 'hr':
      case 'manager':
        return FRONTEND_ROUTES.ADMIN.DASHBOARD;
      case 'supervisor':
        return FRONTEND_ROUTES.ADMIN.DASHBOARD; // or create supervisor dashboard
      case 'employee':
        return FRONTEND_ROUTES.EMPLOYEE.DASHBOARD;
      default:
        return FRONTEND_ROUTES.PUBLIC.LOGIN;
    }
  },

  // Get breadcrumb for route
  getBreadcrumb: (pathname: string): string[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumb: string[] = [];
    
    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      breadcrumb.push(path);
    });
    
    return breadcrumb;
  },

  // Check if user has access to route
  hasAccessToRoute: (pathname: string, userRole: string): boolean => {
    if (RouteHelpers.isPublicRoute(pathname)) return true;

    if (RouteHelpers.isAdminRoute(pathname)) {
      return ['admin', 'superadmin', 'hr', 'manager'].includes(userRole);
    }

    if (RouteHelpers.isEmployeeRoute(pathname)) {
      return userRole === 'employee';
    }

    return false;
  },
};

export default FRONTEND_ROUTES;
