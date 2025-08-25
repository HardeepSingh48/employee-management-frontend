import api from './api';

export interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  employee_name?: string;
  attendance_date: string;
  check_in_time?: string;
  check_out_time?: string;
  attendance_status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday' | 'Leave';
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
}

export interface AttendanceMarkRequest {
  employee_id: string;
  attendance_date?: string; // Optional, defaults to today
  attendance_status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  check_in_time?: string;
  check_out_time?: string;
  overtime_hours?: number;
  remarks?: string;
  marked_by?: string;
}

export interface BulkAttendanceRequest {
  attendance_records: AttendanceMarkRequest[];
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
  records: AttendanceRecord[];
}

export interface AttendanceUpdateRequest {
  attendance_status?: 'Present' | 'Absent' | 'Late' | 'Half Day';
  check_in_time?: string;
  check_out_time?: string;
  overtime_hours?: number;
  remarks?: string;
  is_approved?: boolean;
  approved_by?: string;
  updated_by?: string;
}

export const attendanceService = {
  // Mark individual attendance
  markAttendance: async (data: AttendanceMarkRequest): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/mark', data);
    return response.data.data;
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (data: BulkAttendanceRequest): Promise<{
    successful_count: number;
    total_count: number;
    results: any[];
  }> => {
    const response = await api.post('/attendance/bulk-mark', data);
    return response.data;
  },

  // Get employee attendance records
  getEmployeeAttendance: async (
    employeeId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/attendance/employee/${employeeId}?${params.toString()}`);
    return response.data.data;
  },

  // Get attendance by date
  getAttendanceByDate: async (date: string): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance/date/${date}`);
    return response.data.data;
  },

  // Get today's attendance
  getTodayAttendance: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/today');
    return response.data.data;
  },

  // Get monthly attendance summary
  getMonthlyAttendanceSummary: async (
    employeeId: string, 
    year: number, 
    month: number
  ): Promise<MonthlyAttendanceSummary> => {
    const response = await api.get(`/attendance/monthly-summary/${employeeId}?year=${year}&month=${month}`);
    return response.data.data;
  },

  // Update attendance record
  updateAttendance: async (
    attendanceId: string, 
    data: AttendanceUpdateRequest
  ): Promise<AttendanceRecord> => {
    const response = await api.put(`/attendance/update/${attendanceId}`, data);
    return response.data.data;
  },

  // Get site employees (for supervisors)
  getSiteEmployees: async (): Promise<any[]> => {
    const response = await api.get('/attendance/site-employees');
    return response.data.data;
  },

  // Get site attendance with filtering
  getSiteAttendance: async (
    startDate?: string,
    endDate?: string,
    employeeId?: string
  ): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (employeeId) params.append('employee_id', employeeId);
    
    const response = await api.get(`/attendance/site-attendance?${params.toString()}`);
    return response.data.data;
  },

  // Helper function to format date for API
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Helper function to format datetime for API
  formatDateTime: (date: Date): string => {
    return date.toISOString();
  },

  // Helper function to get current date
  getCurrentDate: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  // Helper function to get current month/year
  getCurrentMonthYear: (): { year: number; month: number } => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  }
};
