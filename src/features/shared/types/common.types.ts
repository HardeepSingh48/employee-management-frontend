/**
 * Common types used across the application
 */

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  records: T[];
  pagination: PaginationInfo;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  resetLabel?: string;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterConfig {
  search?: boolean;
  dateRange?: boolean;
  status?: FilterOption[];
  department?: FilterOption[];
  custom?: Record<string, FilterOption[]>;
}

// Upload types
export interface FileUploadConfig {
  accept: string[];
  maxSize: number; // in bytes
  multiple?: boolean;
  required?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// User roles and permissions
export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface Permission {
  resource: string;
  actions: string[];
}

// Status types
export type EmploymentStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday' | 'Leave';
export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  isLoading?: boolean;
  error?: string;
}

export interface TableComponentProps<T> extends BaseComponentProps {
  data: T[];
  config: TableConfig<T>;
  loading?: boolean;
  error?: string;
  onRowClick?: (record: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

// Export all types
// export type {
//   ApiResponse,
//   PaginationInfo,
//   PaginatedResponse,
//   FormField,
//   FormConfig,
//   TableColumn,
//   TableConfig,
//   FilterOption,
//   DateRange,
//   FilterConfig,
//   FileUploadConfig,
//   UploadedFile,
//   Notification,
//   LoadingState,
//   Permission,
//   BaseComponentProps,
//   FormComponentProps,
//   TableComponentProps,
// };
