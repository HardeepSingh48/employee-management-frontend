import api from './api';
import { API_ENDPOINTS } from '@/features/shared/constants/api-endpoints';

export interface FormBEmployee {
  slNo: number;
  employeeCode: string;
  employeeName: string;
  designation: string;
  rateOfWage: {
    bs: number;
    da: number;
  };
  daysWorked: number;
  overtime: number;
  totalDays: number;
  grossEarnings: {
    bs: number;
    da: number;
    hra: number;
    cov: number;
    ota: number;
    ae: number;
  };
  totalEarnings: number;
  deductions: {
    pf: number;
    esi: number;
    cit: number;
    ptax: number;
    adv: number;
    otherRecoveries: number;
    total: number;
  };
  netPayable: number;
  siteName: string;
}

export interface FormBTotals {
  totalEmployees: number;
  totalDaysWorked: number;
  totalOvertime: number;
  totalEarnings: number;
  totalDeductions: number;
  totalOtherRecoveries: number;
  totalNetPayable: number;
}

export interface FormBFilters {
  year: number;
  month: number;
  site: string;
  monthName: string;
}

export interface FormBResponse {
  success: boolean;
  data: FormBEmployee[];
  totals: FormBTotals;
  filters: FormBFilters;
  message?: string;
}

export interface FormBRequest {
  year: number;
  month: number;
  site?: string;
}

export interface FormCEmployee {
  slNo: number;
  memberName: string;
  grossWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  epfContribution: number;
  epsContribution: number;
  epfEpsDiff: number;
  ncpDays: number;
  refundOfAdvance: number;
  siteName: string;
}

export interface FormCTotals {
  totalEmployees: number;
  totalGrossWages: number;
  totalEpfWages: number;
  totalEpsWages: number;
  totalEdliWages: number;
  totalEpfContribution: number;
  totalEpsContribution: number;
  totalEpfEpsDiff: number;
  totalNcpDays: number;
  totalRefundOfAdvance: number;
}

export interface FormCResponse {
  success: boolean;
  data: FormCEmployee[];
  totals: FormCTotals;
  filters: FormBFilters;
  message?: string;
}

export interface FormDEmployee {
  slNo: number;
  insuranceNo: string;
  nameOfInsuredPerson: string;
  noOfDays: number;
  totalMonthlyWages: number;
  ipContribution: number;
  siteName: string;
}

export interface FormDTotals {
  totalEmployees: number;
  totalDays: number;
  totalMonthlyWages: number;
  totalIpContribution: number;
}

export interface FormDResponse {
  success: boolean;
  data: FormDEmployee[];
  totals: FormDTotals;
  filters: FormBFilters;
  message?: string;
}

export const formsService = {
  // Get Form B data
  getFormBData: async (params: FormBRequest): Promise<FormBResponse> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });
      
      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_B}?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Form B data');
    }
  },

  // Download Form B Excel file
  downloadFormBExcel: async (params: FormBRequest): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });
      
      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_B_DOWNLOAD}?${queryParams.toString()}`, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download Form B Excel file');
    }
  },

  // Helper function to trigger file download
  triggerFileDownload: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Get available sites for Form B filtering
  getAvailableSites: async (): Promise<string[]> => {
    try {
      // This would typically come from a dedicated endpoint
      // For now, we'll use the salary codes endpoint to get unique sites
      const response = await api.get('/salary-codes');
      const salaryCodes = response.data.data || [];
      
      // Extract unique site names
      const sites = [...new Set(salaryCodes.map((code: any) => code.site_name as string))];
      return sites.filter((site): site is string => 
  typeof site === 'string' && Boolean(site) && site.trim() !== ''
); // Remove any null/undefined/empty values
    } catch (error: any) {
      console.error('Failed to fetch available sites:', error);
      return [];
    }
  },

  // Format currency for display
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format number for display
  formatNumber: (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return new Intl.NumberFormat('en-IN').format(value);
  },

  // Get month name from number
  getMonthName: (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  },

  // Generate filename for Excel download
  generateExcelFilename: (site: string, month: number, year: number): string => {
    const monthName = formsService.getMonthName(month);
    const siteName = site || 'All';
    return `FormB_${siteName}_${monthName}_${year}.xlsx`;
  },

  // Get Form C data (EPF)
  getFormCData: async (params: FormBRequest): Promise<FormCResponse> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });

      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_C}?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Form C data');
    }
  },

  // Download Form C Excel file
  downloadFormCExcel: async (params: FormBRequest): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });

      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_C_DOWNLOAD}?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download Form C Excel file');
    }
  },

  // Get Form D data (ESIC)
  getFormDData: async (params: FormBRequest): Promise<FormDResponse> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });

      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_D}?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Form D data');
    }
  },

  // Download Form D Excel file
  downloadFormDExcel: async (params: FormBRequest): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams({
        year: params.year.toString(),
        month: params.month.toString(),
      });

      if (params.site) {
        queryParams.append('site', params.site);
      }

      const response = await api.get(`${API_ENDPOINTS.FORMS.FORM_D_DOWNLOAD}?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download Form D Excel file');
    }
  },

  // Generate filename for Form C Excel download
  generateFormCExcelFilename: (site: string, month: number, year: number): string => {
    const monthName = formsService.getMonthName(month);
    const siteName = site || 'All';
    return `FormC_EPF_${siteName}_${monthName}_${year}.xlsx`;
  },

  // Generate filename for Form D Excel download
  generateFormDExcelFilename: (site: string, month: number, year: number): string => {
    const monthName = formsService.getMonthName(month);
    const siteName = site || 'All';
    return `FormD_ESIC_${siteName}_${monthName}_${year}.xlsx`;
  },
};
