'use client';

import React, { useEffect, useState } from 'react';
import { employeeService } from '@/lib/employee-service';
import { ComprehensiveEditModal } from '@/components/ui/modals/ComprehensiveEditModal';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmployeeRow {
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  department_id?: string;
  designation?: string;
  employment_status?: string;
  hire_date?: string | null;
  // Add all other employee fields that might be returned
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
}

interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadEmployees = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);

      // For now, use the existing employeeService which handles authentication
      // TODO: Update to use the new paginated endpoint once CORS is resolved
      const data = await employeeService.getEmployees();

      // Transform the data to match EmployeeRow interface
      const transformedData: EmployeeRow[] = data.map((emp: any) => ({
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone_number: emp.phone_number,
        department_id: emp.department_id,
        designation: emp.designation,
        employment_status: emp.employment_status,
        hire_date: emp.hire_date,
        // Map all other fields
        date_of_birth: emp.date_of_birth,
        gender: emp.gender,
        marital_status: emp.marital_status,
        nationality: emp.nationality,
        blood_group: emp.blood_group,
        address: emp.address,
        alternate_contact_number: emp.alternate_contact_number,
        adhar_number: emp.adhar_number,
        pan_card_number: emp.pan_card_number,
        voter_id_driving_license: emp.voter_id_driving_license,
        uan: emp.uan,
        esic_number: emp.esic_number,
        employment_type: emp.employment_type,
        work_location: emp.work_location,
        reporting_manager: emp.reporting_manager,
        salary_code: emp.salary_code,
        skill_category: emp.skill_category,
        pf_applicability: emp.pf_applicability,
        esic_applicability: emp.esic_applicability,
        professional_tax_applicability: emp.professional_tax_applicability,
        salary_advance_loan: emp.salary_advance_loan,
        bank_account_number: emp.bank_account_number,
        bank_name: emp.bank_name,
        ifsc_code: emp.ifsc_code,
        highest_qualification: emp.highest_qualification,
        year_of_passing: emp.year_of_passing,
        additional_certifications: emp.additional_certifications,
        experience_duration: emp.experience_duration,
        emergency_contact_name: emp.emergency_contact_name,
        emergency_contact_relationship: emp.emergency_contact_relationship,
        emergency_contact_phone: emp.emergency_contact_phone
      }));

      // For now, implement client-side pagination and search
      let filteredData = transformedData;

      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredData = transformedData.filter(emp =>
          String(emp.employee_id || '').toLowerCase().includes(searchLower) ||
          (emp.first_name || '').toLowerCase().includes(searchLower) ||
          (emp.last_name || '').toLowerCase().includes(searchLower) ||
          (emp.email || '').toLowerCase().includes(searchLower) ||
          (emp.phone_number || '').toLowerCase().includes(searchLower) ||
          (emp.designation || '').toLowerCase().includes(searchLower)
        );
      }

      // Implement client-side pagination
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / 10);
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setEmployees(paginatedData);
      setPagination({
        page,
        per_page: 10,
        total: totalItems,
        pages: totalPages
      });

    } catch (e: any) {
      setError(e?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      void loadEmployees(1, searchTerm);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const openEdit = async (row: EmployeeRow) => {
    try {
      // Fetch complete employee details for editing
      // If your employeeService has a method to get single employee with full details
      const fullEmployeeData = await employeeService.getEmployee(row.employee_id);
      console.log('Full employee data for editing:', fullEmployeeData);
      setEditing(fullEmployeeData as EmployeeRow);
    } catch (error) {
      console.error('Error fetching full employee details:', error);
      // Fallback to the row data we have
      console.log('Using basic row data:', row);
      setEditing(row);
    }
  };

  const saveEdit = async (formData: FormData) => {
    if (!editing) return;

    try {
      // Convert FormData to regular object for the API call
      const updateData: any = {};

      // Extract all form data entries
      for (let [key, value] of formData.entries()) {
        // Skip file uploads for now - you might want to handle these separately
        if (value instanceof File) {
          continue;
        }
        updateData[key] = value;
      }

      const updated = await employeeService.updateEmployee(editing.employee_id, updateData);

      // Update the local state with the updated employee data
      setEmployees(prev => prev.map(e =>
        e.employee_id === editing.employee_id
          ? { ...e, ...updated }
          : e
      ));

      setEditing(null);

      // Show success message
      alert('Employee updated successfully!');
    } catch (e: any) {
      console.error('Failed to update employee', e);
      alert(`Error updating employee: ${e.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(employeeId);
      await employeeService.deleteEmployee(employeeId);

      // Remove the employee from the local state
      setEmployees(prev => prev.filter(e => e.employee_id !== employeeId));

      // If we're on a page that becomes empty after deletion, go to previous page
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh the current page to get updated data
        void loadEmployees(currentPage, searchTerm);
      }

      alert('Employee deleted successfully!');
    } catch (e: any) {
      console.error('Failed to delete employee', e);
      alert(`Error deleting employee: ${e.message || 'Unknown error'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
        <p className="text-gray-600 mt-1">List of all employees</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employee ID, name, email, phone, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
  {employees.length === 0 ? (
    <div className="text-center py-8 text-gray-500">No employees found.</div>
  ) : (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp.employee_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.employee_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.first_name} {emp.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.phone_number || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.designation || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      emp.employment_status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {emp.employment_status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => openEdit(emp)}
                    className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(emp.employee_id)}
                    disabled={deleteLoading === emp.employee_id}
                    className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === emp.employee_id ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 inline" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Always show if there are employees */}
      {employees.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            {pagination ? (
              <>
                Showing {((pagination.page - 1) * pagination.per_page) + 1} to{" "}
                {Math.min(pagination.page * pagination.per_page, pagination.total)} of{" "}
                {pagination.total} employees
              </>
            ) : (
              `Showing ${employees.length} employees`
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Pages */}
            {pagination && pagination.pages > 1 && (
              <div className="flex space-x-1">
                {(() => {
                  const visiblePages = Math.min(5, pagination.pages);
                  const startPage = Math.max(
                    1,
                    Math.min(currentPage - 2, pagination.pages - visiblePages + 1)
                  );

                  return Array.from({ length: visiblePages }, (_, i) => {
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination?.pages || 1, currentPage + 1))
              }
              disabled={currentPage === (pagination?.pages || 1)}
              className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </>
  )}
</div>


      {/* Comprehensive Edit Modal */}
      <ComprehensiveEditModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        employee={editing}
        onSave={saveEdit}
      />
    </div>
  );
}



