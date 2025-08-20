import api from './api';
import { Employee, EmployeeFormData } from '@/types/employee';

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
