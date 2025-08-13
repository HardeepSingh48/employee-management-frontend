// src/store/employeeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeService } from '@/lib/employee-service';

// Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  joiningDate: string;
  designation: string;
  department: string;
  reportingManager?: string;
  basicSalary: number;
  allowances?: number;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status: 'active' | 'inactive' | 'terminated';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {}

export interface EmployeeFilters {
  search: string;
  department: string;
  designation: string;
  status: string;
  joiningDateFrom: string;
  joiningDateTo: string;
}

export interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  totalEmployees: number;
  currentPage: number;
  itemsPerPage: number;
  filters: EmployeeFilters;
  sortBy: keyof Employee;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  bulkImportProgress: {
    isImporting: boolean;
    total: number;
    processed: number;
    errors: string[];
  };
  departments: string[];
  designations: string[];
  recentActivities: {
    id: string;
    employeeId: string;
    employeeName: string;
    action: string;
    timestamp: string;
    details?: string;
  }[];
}

// Initial state
const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  totalEmployees: 0,
  currentPage: 1,
  itemsPerPage: 20,
  filters: {
    search: '',
    department: '',
    designation: '',
    status: '',
    joiningDateFrom: '',
    joiningDateTo: '',
  },
  sortBy: 'firstName',
  sortOrder: 'asc',
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  bulkImportProgress: {
    isImporting: false,
    total: 0,
    processed: 0,
    errors: [],
  },
  departments: [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Operations',
    'Sales',
    'Customer Service',
    'Administration',
  ],
  designations: [
    'Software Engineer',
    'Senior Software Engineer',
    'Team Lead',
    'Project Manager',
    'HR Manager',
    'Finance Manager',
    'Marketing Executive',
    'Sales Representative',
    'Customer Support Executive',
    'System Administrator',
  ],
  recentActivities: [],
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (
    params: {
      page?: number;
      limit?: number;
      filters?: Partial<EmployeeFilters>;
      sortBy?: keyof Employee;
      sortOrder?: 'asc' | 'desc';
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await employeeService.getEmployees(params);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch employees';
      return rejectWithValue(message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      const employee = await employeeService.getEmployee(id);
      return employee;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch employee';
      return rejectWithValue(message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: EmployeeFormData, { rejectWithValue }) => {
    try {
      const employee = await employeeService.createEmployee(employeeData);
      return employee;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create employee';
      return rejectWithValue(message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async (
    { id, data }: { id: string; data: Partial<EmployeeFormData> },
    { rejectWithValue }
  ) => {
    try {
      const employee = await employeeService.updateEmployee(id, data);
      return employee;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update employee';
      return rejectWithValue(message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete employee';
      return rejectWithValue(message);
    }
  }
);

export const bulkImportEmployees = createAsyncThunk(
  'employees/bulkImportEmployees',
  async (
    employees: EmployeeFormData[],
    { rejectWithValue, dispatch }
  ) => {
    try {
      // Update progress as we process
      dispatch(setBulkImportProgress({ 
        isImporting: true, 
        total: employees.length, 
        processed: 0, 
        errors: [] 
      }));

      const results = await employeeService.bulkImportEmployees(employees);
      
      dispatch(setBulkImportProgress({ 
        isImporting: false, 
        total: employees.length, 
        processed: employees.length, 
        errors: [] 
      }));

      return results;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Bulk import failed';
      dispatch(setBulkImportProgress({ 
        isImporting: false, 
        total: 0, 
        processed: 0, 
        errors: [message] 
      }));
      return rejectWithValue(message);
    }
  }
);

export const searchEmployees = createAsyncThunk(
  'employees/searchEmployees',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const response = await employeeService.searchEmployees(searchTerm);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Search failed';
      return rejectWithValue(message);
    }
  }
);

export const getEmployeeStats = createAsyncThunk(
  'employees/getEmployeeStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await employeeService.getEmployeeStats();
      return stats;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get stats';
      return rejectWithValue(message);
    }
  }
);

// Employee slice
const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    
    setFilters: (state, action: PayloadAction<Partial<EmployeeFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filtering
    },
    
    clearFilters: (state) => {
      state.filters = {
        search: '',
        department: '',
        designation: '',
        status: '',
        joiningDateFrom: '',
        joiningDateTo: '',
      };
      state.currentPage = 1;
    },
    
    setSortBy: (state, action: PayloadAction<{ sortBy: keyof Employee; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    
    setBulkImportProgress: (state, action: PayloadAction<Partial<EmployeeState['bulkImportProgress']>>) => {
      state.bulkImportProgress = { ...state.bulkImportProgress, ...action.payload };
    },
    
    addRecentActivity: (state, action: PayloadAction<Omit<EmployeeState['recentActivities'][0], 'id' | 'timestamp'>>) => {
      const activity = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.recentActivities.unshift(activity);
      // Keep only last 50 activities
      if (state.recentActivities.length > 50) {
        state.recentActivities = state.recentActivities.slice(0, 50);
      }
    },
    
    clearRecentActivities: (state) => {
      state.recentActivities = [];
    },
    
    updateEmployeeStatus: (state, action: PayloadAction<{ id: string; status: Employee['status'] }>) => {
      const employee = state.employees.find(emp => emp.id === action.payload.id);
      if (employee) {
        employee.status = action.payload.status;
        employee.updatedAt = new Date().toISOString();
      }
    },
  },
  
  extraReducers: (builder) => {
    // Fetch Employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees;
        state.totalEmployees = action.payload.total;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Employee
    builder
      .addCase(fetchEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Employee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isCreating = false;
        state.employees.push(action.payload);
        state.totalEmployees += 1;
        state.error = null;
        
        // Add recent activity
        const activity = {
          employeeId: action.payload.employeeId,
          employeeName: `${action.payload.firstName} ${action.payload.lastName}`,
          action: 'created',
          details: `Employee ${action.payload.employeeId} was created`,
        };
        employeeSlice.caseReducers.addRecentActivity(state, { payload: activity, type: 'addRecentActivity' });
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.selectedEmployee?.id === action.payload.id) {
          state.selectedEmployee = action.payload;
        }
        state.error = null;
        
        // Add recent activity
        const activity = {
          employeeId: action.payload.employeeId,
          employeeName: `${action.payload.firstName} ${action.payload.lastName}`,
          action: 'updated',
          details: `Employee ${action.payload.employeeId} was updated`,
        };
        employeeSlice.caseReducers.addRecentActivity(state, { payload: activity, type: 'addRecentActivity' });
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Employee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedEmployee = state.employees.find(emp => emp.id === action.payload);
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.totalEmployees -= 1;
        if (state.selectedEmployee?.id === action.payload) {
          state.selectedEmployee = null;
        }
        state.error = null;
        
        // Add recent activity
        if (deletedEmployee) {
          const activity = {
            employeeId: deletedEmployee.employeeId,
            employeeName: `${deletedEmployee.firstName} ${deletedEmployee.lastName}`,
            action: 'deleted',
            details: `Employee ${deletedEmployee.employeeId} was deleted`,
          };
          employeeSlice.caseReducers.addRecentActivity(state, { payload: activity, type: 'addRecentActivity' });
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Bulk Import Employees
    builder
      .addCase(bulkImportEmployees.pending, (state) => {
        state.bulkImportProgress.isImporting = true;
        state.error = null;
      })
      .addCase(bulkImportEmployees.fulfilled, (state, action) => {
        state.bulkImportProgress.isImporting = false;
        state.employees.push(...action.payload);
        state.totalEmployees += action.payload.length;
        state.error = null;
        
        // Add recent activity
        const activity = {
          employeeId: 'BULK',
          employeeName: 'System',
          action: 'bulk_import',
          details: `${action.payload.length} employees were imported`,
        };
        employeeSlice.caseReducers.addRecentActivity(state, { payload: activity, type: 'addRecentActivity' });
      })
      .addCase(bulkImportEmployees.rejected, (state, action) => {
        state.bulkImportProgress.isImporting = false;
        state.error = action.payload as string;
      });

    // Search Employees
    builder
      .addCase(searchEmployees.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees;
        state.totalEmployees = action.payload.total;
      })
      .addCase(searchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export selectors
export const {
  clearError,
  clearSelectedEmployee,
  setFilters,
  clearFilters,
  setSortBy,
  setCurrentPage,
  setItemsPerPage,
  setBulkImportProgress,
  addRecentActivity,
  clearRecentActivities,
  updateEmployeeStatus,
} = employeeSlice.actions;

// Selectors
export const selectEmployees = (state: { employees: EmployeeState }) =>
  state.employees.employees;

export const selectSelectedEmployee = (state: { employees: EmployeeState }) =>
  state.employees.selectedEmployee;

export const selectEmployeeLoading = (state: { employees: EmployeeState }) =>
  state.employees.isLoading;

export const selectEmployeeCreating = (state: { employees: EmployeeState }) =>
  state.employees.isCreating;

export const selectEmployeeUpdating = (state: { employees: EmployeeState }) =>
  state.employees.isUpdating;

export const selectEmployeeDeleting = (state: { employees: EmployeeState }) =>
  state.employees.isDeleting;

export const selectEmployeeError = (state: { employees: EmployeeState }) =>
  state.employees.error;

export const selectEmployeeFilters = (state: { employees: EmployeeState }) =>
  state.employees.filters;

export const selectEmployeePagination = (state: { employees: EmployeeState }) => ({
  currentPage: state.employees.currentPage,
  itemsPerPage: state.employees.itemsPerPage,
  total: state.employees.totalEmployees,
});

export const selectBulkImportProgress = (state: { employees: EmployeeState }) =>
  state.employees.bulkImportProgress;

export const selectDepartments = (state: { employees: EmployeeState }) =>
  state.employees.departments;

export const selectDesignations = (state: { employees: EmployeeState }) =>
  state.employees.designations;

export const selectRecentActivities = (state: { employees: EmployeeState }) =>
  state.employees.recentActivities;

export default employeeSlice.reducer;
