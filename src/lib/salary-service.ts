import api from './api';

export interface SalaryCalculationData {
  'Employee ID': string;
  'Employee Name': string;
  'Skill Level': string;
  'Present Days': number;
  'Daily Wage': number;
  'Basic': number;
  'Special Basic': number;
  'DA': number;
  'HRA': number;
  'Overtime': number;
  'Others': number;
  'Total Earnings': number;
  'PF': number;
  'ESIC': number;
  'Society': number;
  'Income Tax': number;
  'Insurance': number;
  'Others Recoveries': number;
  'Total Deductions': number;
  'Net Salary': number;
}

export interface SalaryAdjustments {
  'Special Basic'?: number;
  'DA'?: number;
  'HRA'?: number;
  'Overtime'?: number;
  'Others'?: number;
  'Society'?: number;
  'Income Tax'?: number;
  'Insurance'?: number;
  'Others Recoveries'?: number;
}

export interface MonthlySalaryRequest {
  year: number;
  month: number;
  site_id?: string;
}

export interface IndividualSalaryRequest {
  employee_id: string;
  year: number;
  month: number;
  adjustments?: SalaryAdjustments;
}

export const salaryService = {
  // Upload Excel files for salary calculation (uses employee salary codes for wage rates)
  uploadExcelForCalculation: async (
    attendanceFile: File,
    adjustmentsFile?: File
  ): Promise<SalaryCalculationData[]> => {
    const formData = new FormData();
    formData.append('attendance', attendanceFile);
    if (adjustmentsFile) {
      formData.append('adjustments', adjustmentsFile);
    }

    const response = await api.post('/salary/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Calculate monthly salary for all employees using database records
  calculateMonthlySalary: async (data: MonthlySalaryRequest): Promise<SalaryCalculationData[]> => {
    const response = await api.post('/salary/calculate-monthly', data);
    return response.data.data;
  },

  // Calculate salary for individual employee
  calculateIndividualSalary: async (data: IndividualSalaryRequest): Promise<SalaryCalculationData> => {
    const response = await api.post('/salary/calculate-individual', data);
    return response.data.data;
  },

  // Download attendance template
  downloadAttendanceTemplate: async (): Promise<Blob> => {
    const response = await api.get('/salary/template/attendance', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download adjustments template
  downloadAdjustmentsTemplate: async (): Promise<Blob> => {
    const response = await api.get('/salary/template/adjustments', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export salary data to Excel
  exportSalaryData: async (salaryData: SalaryCalculationData[]): Promise<Blob> => {
    const response = await api.post('/salary/export', 
      { salary_data: salaryData },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Helper function to download blob as file
  downloadBlob: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Helper function to format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  },

  // Helper function to get current month/year
  getCurrentMonthYear: (): { year: number; month: number } => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  },

  // Helper function to get month name
  getMonthName: (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  },

  // Validate Excel file
  validateExcelFile: (file: File): { valid: boolean; message?: string } => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Please upload a valid Excel file (.xlsx or .xls)'
      };
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return {
        valid: false,
        message: 'File size should be less than 10MB'
      };
    }
    
    return { valid: true };
  }
};
