import api from './api';

export interface SalaryCode {
  id: number;
  salary_code: string;
  site_name: string;
  rank: string;
  state: string;
  base_wage: number;
  skill_level: string;
  is_active: boolean;
  created_at: string | null;
  display_name: string;
}

export const salaryCodesService = {
  // Get all active salary codes
  getSalaryCodes: async (): Promise<SalaryCode[]> => {
    const response = await api.get('/salary-codes');
    return response.data.data || [];
  },

  // Get salary code by code
  getSalaryCode: async (salaryCode: string): Promise<SalaryCode> => {
    const response = await api.get(`/salary-codes/${salaryCode}`);
    return response.data.data;
  },

  // Create new salary code (skill_level is not required - set during employee registration)
  createSalaryCode: async (salaryCodeData: {
    site_name: string;
    rank: string;
    state: string;
    base_wage: number;
    created_by?: string;
  }): Promise<SalaryCode> => {
    try {
      // console.log('🎯 Trying main endpoint: /salary-codes');
      const response = await api.post('/salary-codes', salaryCodeData);
      return response.data.data;
    } catch (error) {
      // console.log('❌ Main endpoint failed, trying alternative: /salary-codes/create');
      const response = await api.post('/salary-codes/create', salaryCodeData);
      return response.data.data;
    }
  },

  // Bulk create salary codes (skill_level is not required - set during employee registration)
  bulkCreateSalaryCodes: async (salaryCodesData: Array<{
    site_name: string;
    rank: string;
    state: string;
    base_wage: number;
    created_by?: string;
  }>): Promise<SalaryCode[]> => {
    const response = await api.post('/salary-codes/bulk', { salary_codes: salaryCodesData });
    return response.data.data;
  }
};
