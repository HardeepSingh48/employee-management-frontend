import  api  from '@/lib/api';

export interface Employee {
  employee_id: number;
  name: string;
  department: string;
  site_id: string;
  skill_level: string;
}

export interface Site {
  site_id: string;
  site_name: string;
  location: string;
}

export interface PayrollPreviewRequest {
  employee_ids: number[];
  start_date: string;
  end_date: string;
}

export interface PayrollGenerateRequest {
  employee_ids?: number[];
  employee_range?: {
    from: number;
    to: number;
  };
  start_date: string;
  end_date: string;
  filename?: string;
}

export interface PayrollPreviewResponse {
  success: boolean;
  message: string;
  data?: {
    preview_html: string;
    total_employees: number;
    preview_count: number;
    period: string;
  };
}

export interface PayrollResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface EmployeesResponse {
  success: boolean;
  message: string;
  data?: Employee[];
}

export interface SitesResponse {
  success: boolean;
  message: string;
  data?: Site[];
}

export class PayrollService {
  private static baseUrl = '/payroll';

  /**
   * Get employees for payroll selection
   */
  static async getEmployees(siteId?: string): Promise<EmployeesResponse> {
    try {
      const params = new URLSearchParams();
      if (siteId) {
        params.append('site_id', siteId);
      }

      const url = `${this.baseUrl}/employees${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch employees',
      };
    }
  }

  /**
   * Get sites for filtering
   */
  static async getSites(): Promise<SitesResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/sites`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch sites',
      };
    }
  }

  /**
   * Preview payroll (first 3 employees)
   */
  static async previewPayroll(request: PayrollPreviewRequest): Promise<PayrollPreviewResponse> {
    try {
      const params = new URLSearchParams({
        employee_ids: request.employee_ids.join(','),
        start_date: request.start_date,
        end_date: request.end_date,
      });

      const response = await api.get(`${this.baseUrl}/preview?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate preview',
      };
    }
  }

  /**
   * Generate and download payroll PDF
   */
  static async generatePayroll(request: PayrollGenerateRequest): Promise<Blob | PayrollResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, request, {
        responseType: 'blob',
      });

      // Check if response is actually a PDF (blob) or error JSON
      if (response.data instanceof Blob && response.data.type === 'application/pdf') {
        return response.data;
      } else {
        // Try to parse as JSON error response
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          return errorData;
        } catch {
          return {
            success: false,
            message: 'Failed to generate payroll PDF',
          };
        }
      }
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        // Handle blob error response
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          return errorData;
        } catch {
          return {
            success: false,
            message: 'Failed to generate payroll PDF',
          };
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate payroll PDF',
      };
    }
  }

  /**
   * Download blob as file
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default PayrollService;





