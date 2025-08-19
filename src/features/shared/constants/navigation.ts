/**
 * Navigation Configuration
 * Defines navigation structure for different user roles
 */

import {
  Home,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Calculator,
  TrendingUp,
  Briefcase,
  Settings,
  User,
  FileText,
  BarChart3,
  Building2,
  Shield,
  HelpCircle,
  Bell,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  CalendarDays,
  ClockIcon,
  Wallet,
  Receipt,
  PieChart,
  LineChart,
  MapPin,
  Phone,
  Mail,
  Camera,
  Lock,
  Key,
  Database,
  Cloud,
  Zap,
  Target,
  Award,
  Star,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Layers,
  Grid,
  List,
  Table,
  // Card,
  Layout,
  Sidebar,
  Menu,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { FRONTEND_ROUTES } from './frontend-routes';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  route?: string;
  children?: NavigationItem[];
  badge?: string | number;
  description?: string;
  permissions?: string[];
  isNew?: boolean;
  isComingSoon?: boolean;
}

// Admin Navigation Structure
export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    route: FRONTEND_ROUTES.ADMIN.DASHBOARD,
    description: 'Overview and key metrics',
  },
  {
    id: 'employees',
    label: 'Employee Management',
    icon: Users,
    children: [
      {
        id: 'employees-list',
        label: 'All Employees',
        icon: List,
        route: FRONTEND_ROUTES.ADMIN.EMPLOYEES.LIST,
        description: 'View and manage all employees',
      },
      {
        id: 'employees-register',
        label: 'Register Employee',
        icon: UserPlus,
        route: FRONTEND_ROUTES.ADMIN.EMPLOYEES.REGISTER,
        description: 'Add new employee',
      },
      {
        id: 'employees-bulk-import',
        label: 'Bulk Import',
        icon: Upload,
        route: FRONTEND_ROUTES.ADMIN.EMPLOYEES.BULK_IMPORT,
        description: 'Import employees from Excel',
      },
    ],
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: Building2,
    children: [
      {
        id: 'departments-list',
        label: 'All Departments',
        icon: List,
        route: FRONTEND_ROUTES.ADMIN.DEPARTMENTS.LIST,
      },
      {
        id: 'departments-create',
        label: 'Create Department',
        icon: Plus,
        route: FRONTEND_ROUTES.ADMIN.DEPARTMENTS.CREATE,
      },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    children: [
      {
        id: 'attendance-mark',
        label: 'Mark Attendance',
        icon: UserCheck,
        route: FRONTEND_ROUTES.ADMIN.ATTENDANCE.MARK,
        description: 'Mark attendance for employees',
      },
      {
        id: 'attendance-bulk',
        label: 'Bulk Attendance',
        icon: Upload,
        route: FRONTEND_ROUTES.ADMIN.ATTENDANCE.BULK_MARK,
        description: 'Upload attendance from Excel',
      },
      {
        id: 'attendance-calendar',
        label: 'Attendance Calendar',
        icon: Calendar,
        route: FRONTEND_ROUTES.ADMIN.ATTENDANCE.CALENDAR,
        description: 'Calendar view of attendance',
      },
      {
        id: 'attendance-reports',
        label: 'Attendance Reports',
        icon: BarChart3,
        route: FRONTEND_ROUTES.ADMIN.ATTENDANCE.REPORTS,
        description: 'Generate attendance reports',
      },
    ],
  },
  {
    id: 'salary-codes',
    label: 'Salary Codes',
    icon: Tag,
    children: [
      {
        id: 'salary-codes-list',
        label: 'All Salary Codes',
        icon: List,
        route: FRONTEND_ROUTES.ADMIN.SALARY_CODES.LIST,
      },
      {
        id: 'salary-codes-create',
        label: 'Create Salary Code',
        icon: Plus,
        route: FRONTEND_ROUTES.ADMIN.SALARY_CODES.CREATE,
      },
      {
        id: 'salary-codes-import',
        label: 'Bulk Import',
        icon: Upload,
        route: FRONTEND_ROUTES.ADMIN.SALARY_CODES.BULK_IMPORT,
      },
    ],
  },
  {
    id: 'salary',
    label: 'Salary & Payroll',
    icon: DollarSign,
    children: [
      {
        id: 'salary-calculate',
        label: 'Calculate Salary',
        icon: Calculator,
        route: FRONTEND_ROUTES.ADMIN.SALARY.CALCULATE,
        description: 'Calculate monthly salaries',
      },
      {
        id: 'salary-monthly',
        label: 'Monthly Calculation',
        icon: Calendar,
        route: FRONTEND_ROUTES.ADMIN.SALARY.MONTHLY_CALCULATION,
      },
      {
        id: 'salary-individual',
        label: 'Individual Calculation',
        icon: User,
        route: FRONTEND_ROUTES.ADMIN.SALARY.INDIVIDUAL_CALCULATION,
      },
      {
        id: 'salary-reports',
        label: 'Salary Reports',
        icon: FileText,
        route: FRONTEND_ROUTES.ADMIN.SALARY.REPORTS,
      },
      {
        id: 'salary-payslips',
        label: 'Payslips',
        icon: Receipt,
        route: FRONTEND_ROUTES.ADMIN.SALARY.PAYSLIPS,
      },
    ],
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: CalendarDays,
    children: [
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        icon: FileText,
        route: FRONTEND_ROUTES.ADMIN.LEAVE.REQUESTS,
        badge: '5', // Example badge for pending requests
      },
      {
        id: 'leave-approve',
        label: 'Approve Leaves',
        icon: CheckCircle,
        route: FRONTEND_ROUTES.ADMIN.LEAVE.APPROVE,
      },
      {
        id: 'leave-calendar',
        label: 'Leave Calendar',
        icon: Calendar,
        route: FRONTEND_ROUTES.ADMIN.LEAVE.CALENDAR,
      },
      {
        id: 'leave-policies',
        label: 'Leave Policies',
        icon: Shield,
        route: FRONTEND_ROUTES.ADMIN.LEAVE.POLICIES,
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: TrendingUp,
    children: [
      {
        id: 'reports-dashboard',
        label: 'Reports Dashboard',
        icon: BarChart3,
        route: FRONTEND_ROUTES.ADMIN.REPORTS.DASHBOARD,
      },
      {
        id: 'reports-attendance',
        label: 'Attendance Reports',
        icon: Clock,
        route: FRONTEND_ROUTES.ADMIN.REPORTS.ATTENDANCE,
      },
      {
        id: 'reports-salary',
        label: 'Salary Reports',
        icon: DollarSign,
        route: FRONTEND_ROUTES.ADMIN.REPORTS.SALARY,
      },
      {
        id: 'reports-employee',
        label: 'Employee Reports',
        icon: Users,
        route: FRONTEND_ROUTES.ADMIN.REPORTS.EMPLOYEE,
      },
      {
        id: 'reports-custom',
        label: 'Custom Reports',
        icon: Settings,
        route: FRONTEND_ROUTES.ADMIN.REPORTS.CUSTOM,
      },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Shield,
    children: [
      {
        id: 'users-list',
        label: 'All Users',
        icon: List,
        route: FRONTEND_ROUTES.ADMIN.USERS.LIST,
      },
      {
        id: 'users-create',
        label: 'Create User',
        icon: UserPlus,
        route: FRONTEND_ROUTES.ADMIN.USERS.CREATE,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      {
        id: 'settings-general',
        label: 'General Settings',
        icon: Settings,
        route: FRONTEND_ROUTES.ADMIN.SETTINGS.GENERAL,
      },
      {
        id: 'settings-company',
        label: 'Company Settings',
        icon: Building2,
        route: FRONTEND_ROUTES.ADMIN.SETTINGS.COMPANY,
      },
      {
        id: 'settings-notifications',
        label: 'Notifications',
        icon: Bell,
        route: FRONTEND_ROUTES.ADMIN.SETTINGS.NOTIFICATIONS,
      },
      {
        id: 'settings-backup',
        label: 'Backup & Restore',
        icon: Database,
        route: FRONTEND_ROUTES.ADMIN.SETTINGS.BACKUP,
      },
    ],
  },
];

// Employee Navigation Structure
export const EMPLOYEE_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    route: FRONTEND_ROUTES.EMPLOYEE.DASHBOARD,
    description: 'Your personal dashboard',
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    children: [
      {
        id: 'profile-view',
        label: 'View Profile',
        icon: Eye,
        route: FRONTEND_ROUTES.EMPLOYEE.PROFILE.VIEW,
      },
      {
        id: 'profile-edit',
        label: 'Edit Profile',
        icon: Edit,
        route: FRONTEND_ROUTES.EMPLOYEE.PROFILE.EDIT,
      },
      {
        id: 'profile-documents',
        label: 'My Documents',
        icon: FileText,
        route: FRONTEND_ROUTES.EMPLOYEE.PROFILE.DOCUMENTS,
      },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    children: [
      {
        id: 'attendance-mark',
        label: 'Mark Attendance',
        icon: UserCheck,
        route: FRONTEND_ROUTES.EMPLOYEE.ATTENDANCE.MARK,
        description: 'Mark your daily attendance',
      },
      {
        id: 'attendance-history',
        label: 'Attendance History',
        icon: Calendar,
        route: FRONTEND_ROUTES.EMPLOYEE.ATTENDANCE.HISTORY,
        description: 'View your attendance records',
      },
      {
        id: 'attendance-summary',
        label: 'Monthly Summary',
        icon: BarChart3,
        route: FRONTEND_ROUTES.EMPLOYEE.ATTENDANCE.SUMMARY,
      },
    ],
  },
  {
    id: 'salary',
    label: 'Salary Information',
    icon: DollarSign,
    children: [
      {
        id: 'salary-current',
        label: 'Current Salary',
        icon: Wallet,
        route: FRONTEND_ROUTES.EMPLOYEE.SALARY.CURRENT,
        description: 'View current month salary',
      },
      {
        id: 'salary-history',
        label: 'Salary History',
        icon: Calendar,
        route: FRONTEND_ROUTES.EMPLOYEE.SALARY.HISTORY,
      },
      {
        id: 'salary-payslips',
        label: 'Payslips',
        icon: Receipt,
        route: FRONTEND_ROUTES.EMPLOYEE.SALARY.PAYSLIPS,
      },
      {
        id: 'salary-tax',
        label: 'Tax Documents',
        icon: FileText,
        route: FRONTEND_ROUTES.EMPLOYEE.SALARY.TAX_DOCUMENTS,
      },
    ],
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: CalendarDays,
    children: [
      {
        id: 'leave-request',
        label: 'Request Leave',
        icon: Plus,
        route: FRONTEND_ROUTES.EMPLOYEE.LEAVE.REQUEST,
      },
      {
        id: 'leave-history',
        label: 'Leave History',
        icon: Calendar,
        route: FRONTEND_ROUTES.EMPLOYEE.LEAVE.HISTORY,
      },
      {
        id: 'leave-balance',
        label: 'Leave Balance',
        icon: BarChart3,
        route: FRONTEND_ROUTES.EMPLOYEE.LEAVE.BALANCE,
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    children: [
      {
        id: 'documents-personal',
        label: 'Personal Documents',
        icon: User,
        route: FRONTEND_ROUTES.EMPLOYEE.DOCUMENTS.PERSONAL,
      },
      {
        id: 'documents-company',
        label: 'Company Documents',
        icon: Building2,
        route: FRONTEND_ROUTES.EMPLOYEE.DOCUMENTS.COMPANY,
      },
      {
        id: 'documents-upload',
        label: 'Upload Documents',
        icon: Upload,
        route: FRONTEND_ROUTES.EMPLOYEE.DOCUMENTS.UPLOAD,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      {
        id: 'settings-account',
        label: 'Account Settings',
        icon: User,
        route: FRONTEND_ROUTES.EMPLOYEE.SETTINGS.ACCOUNT,
      },
      {
        id: 'settings-notifications',
        label: 'Notifications',
        icon: Bell,
        route: FRONTEND_ROUTES.EMPLOYEE.SETTINGS.NOTIFICATIONS,
      },
      {
        id: 'settings-password',
        label: 'Change Password',
        icon: Lock,
        route: FRONTEND_ROUTES.EMPLOYEE.SETTINGS.PASSWORD,
      },
    ],
  },
];

// Helper function to get navigation based on user role
export const getNavigationForRole = (role: string): NavigationItem[] => {
  switch (role) {
    case 'admin':
    case 'hr':
    case 'manager':
      return ADMIN_NAVIGATION;
    case 'employee':
      return EMPLOYEE_NAVIGATION;
    default:
      return [];
  }
};

// Helper function to find navigation item by route
export const findNavigationItemByRoute = (
  navigation: NavigationItem[],
  route: string
): NavigationItem | null => {
  for (const item of navigation) {
    if (item.route === route) {
      return item;
    }
    if (item.children) {
      const found = findNavigationItemByRoute(item.children, route);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to get breadcrumb from navigation
export const getBreadcrumbFromNavigation = (
  navigation: NavigationItem[],
  route: string,
  breadcrumb: NavigationItem[] = []
): NavigationItem[] => {
  for (const item of navigation) {
    const currentBreadcrumb = [...breadcrumb, item];
    
    if (item.route === route) {
      return currentBreadcrumb;
    }
    
    if (item.children) {
      const found = getBreadcrumbFromNavigation(item.children, route, currentBreadcrumb);
      if (found.length > 0) return found;
    }
  }
  return [];
};

export default {
  ADMIN_NAVIGATION,
  EMPLOYEE_NAVIGATION,
  getNavigationForRole,
  findNavigationItemByRoute,
  getBreadcrumbFromNavigation,
};
