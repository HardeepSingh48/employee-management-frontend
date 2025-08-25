import api from './api';

export interface Deduction {
  deduction_id: string;
  employee_id: string;
  employee_name: string;
  deduction_type: string;
  total_amount: number;
  months: number;
  monthly_installment: number;
  start_month: string;
  created_at: string;
  status: 'Active' | 'Completed';
}

export interface CreateDeductionRequest {
  employee_id: string;
  deduction_type: string;
  total_amount: number;
  months: number;
  start_month: string;
  created_by?: string;
}

export interface UpdateDeductionRequest {
  deduction_type?: string;
  total_amount?: number;
  months?: number;
  start_month?: string;
  updated_by?: string;
}

export interface BulkUploadResponse {
  success_count: number;
  error_count: number;
  errors: string[];
}

export const deductionsService = {
  // Get all deductions
  getAllDeductions: async (): Promise<Deduction[]> => {
    const response = await api.get('/deductions');
    return response.data.data;
  },

  // Create new deduction
  createDeduction: async (data: CreateDeductionRequest): Promise<Deduction> => {
    const response = await api.post('/deductions', data);
    return response.data.data;
  },

  // Update deduction
  updateDeduction: async (deductionId: string, data: UpdateDeductionRequest): Promise<void> => {
    await api.put(`/deductions/${deductionId}`, data);
  },

  // Delete deduction
  deleteDeduction: async (deductionId: string): Promise<void> => {
    await api.delete(`/deductions/${deductionId}`);
  },

  // Get deductions for specific employee
  getEmployeeDeductions: async (employeeId: string): Promise<Deduction[]> => {
    const response = await api.get(`/deductions/employee/${employeeId}`);
    return response.data.data;
  },

  // Bulk upload deductions
  bulkUploadDeductions: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/deductions/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Download template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/deductions/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper function to download blob as file
  downloadBlob: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
