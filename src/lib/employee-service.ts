import api from './api';
import { Employee, EmployeeFormData } from '@/types/employee';

export interface EmployeeListParams {
  page?: number;
  per_page?: number;
  search?: string;
  site_id?: string;
  status?: string;
  department?: string;
}

export interface EmployeeListEmployee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  department_id?: string;
  designation?: string;
  employment_status?: string;
  site_id?: string;
  hire_date?: string | null;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  nationality?: string;
  blood_group?: string;
  address?: string;
  alternate_contact_number?: string;
  adhar_number?: string;
  pan_card_number?: string;
  voter_id_driving_license?: string;
  uan?: string;
  esic_number?: string;
  employment_type?: string;
  work_location?: string;
  reporting_manager?: string;
  salary_code?: string;
  skill_category?: string;
  pf_applicability?: boolean;
  esic_applicability?: boolean;
  professional_tax_applicability?: boolean;
  salary_advance_loan?: number;
  bank_account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  highest_qualification?: string;
  year_of_passing?: number;
  additional_certifications?: string;
  experience_duration?: number;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  id?: string;
}

export interface EmployeeListResponse {
  data: EmployeeListEmployee[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export const employeeService = {
  // Get all employees
  getEmployees: async (params?: Record<string, any>): Promise<Employee[]> => {
    const response = await api.get('/employees/all', { params });
    const data = response.data.data || response.data;

    // ✅ normalize here
    return data.map((emp: any) => ({
      ...emp,
      id: emp.employee_id ?? emp.id, // ensure id always exists
    }));
  },

  // Get the paginated employee list used by Employee Management.
  listEmployees: async (params: EmployeeListParams = {}): Promise<EmployeeListResponse> => {
    const response = await api.get('/employees/list', { params });
    return {
      data: (response.data.data || []).map((emp: EmployeeListEmployee) => ({
        ...emp,
        id: emp.employee_id ?? emp.id,
      })),
      pagination: response.data.pagination,
    };
  },

  // Export all matching employees without pagination.
  exportEmployeesExcel: async (params: Omit<EmployeeListParams, 'page' | 'per_page'> = {}): Promise<Blob> => {
    const response = await api.get('/employees/export-excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get employee by ID
  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    const emp = response.data.data;

    return {
      ...emp,
      id: emp.employee_id ?? emp.id, // normalize
    };
  },

  // Create new employee
  createEmployee: async (employeeData: EmployeeFormData): Promise<Employee> => {
    const response = await api.post('/employees', employeeData);
    const emp = response.data.data;
    return { ...emp, id: emp.employee_id ?? emp.id };
  },

  // Update employee
  updateEmployee: async (id: string, employeeData: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employeeData);
    const emp = response.data.data;
    return { ...emp, id: emp.employee_id ?? emp.id };
  },

  // Delete employee
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Bulk import employees
  bulkImportEmployees: async (employees: EmployeeFormData[]): Promise<Employee[]> => {
    const response = await api.post('/employees/bulk-import', { employees });
    return response.data.data.map((emp: any) => ({
      ...emp,
      id: emp.employee_id ?? emp.id,
    }));
  },

  // Search employees
  searchEmployees: async (query: string): Promise<Employee[]> => {
    const response = await api.get(`/employees/search?q=${encodeURIComponent(query)}`);
    return response.data.map((emp: any) => ({
      ...emp,
      id: emp.employee_id ?? emp.id,
    }));
  },
};
