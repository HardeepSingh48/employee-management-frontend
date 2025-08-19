export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday' | 'Leave';

export interface Attendance {
  attendance_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_time?: string;
  check_out_time?: string;
  attendance_status: AttendanceStatus;
  overtime_hours: number;
  late_minutes: number;
  early_departure_minutes: number;
  total_hours_worked: number;
  is_holiday: boolean;
  is_weekend: boolean;
  remarks?: string;
  marked_by: string;
  is_approved: boolean;
  created_date: string;
  employee_name?: string; // Added when joining with employee data
}

export interface AttendanceFormData {
  employee_id: string;
  attendance_date: string;
  attendance_status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  overtime_hours?: number;
  remarks?: string;
}

export interface BulkAttendanceData {
  attendance_records: AttendanceFormData[];
  marked_by?: string;
}

export interface MonthlyAttendanceSummary {
  employee_id: string;
  year: number;
  month: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  total_overtime_hours: number;
  working_days: number;
  holiday_count: number;
  attendance_percentage: number;
  records: Attendance[];
}

export interface AttendanceFilters {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  attendance_status?: AttendanceStatus;
  department?: string;
}

export interface AttendanceStats {
  total_employees: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_percentage: number;
}

export interface Holiday {
  holiday_id: string;
  holiday_name: string;
  holiday_date: string;
  holiday_type: 'National' | 'Regional' | 'Company' | 'Optional';
  description?: string;
  is_paid: boolean;
  is_mandatory: boolean;
  is_active: boolean;
}
