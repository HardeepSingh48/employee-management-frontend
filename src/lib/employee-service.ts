import api from './api';
import { Employee, EmployeeFormData } from '@/types/employee';

export const employeeService = {
  // Get all employees
getEmployees: async (params?: Record<string, any>): Promise<Employee[]> => {
  const response = await api.get('/employees/all', { params });
  return response.data.data || response.data;
},

  // Get employee by ID
  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  // Create new employee
  createEmployee: async (employeeData: EmployeeFormData): Promise<Employee> => {
    const response = await api.post('/employees', employeeData);
    return response.data.data;
  },

  // Update employee
  updateEmployee: async (id: string, employeeData: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data.data;
  },

  // Delete employee
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Bulk import employees
  bulkImportEmployees: async (employees: EmployeeFormData[]): Promise<Employee[]> => {
    const response = await api.post('/employees/bulk-import', { employees });
    return response.data.data;
  },
  searchEmployees: async (query: string): Promise<Employee[]> => {
  const response = await api.get(`/employees/search?q=${encodeURIComponent(query)}`);
  return response.data;
},
};

