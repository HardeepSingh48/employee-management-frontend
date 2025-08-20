'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { employeeService } from '@/lib/employee-service';
import { EditModal } from '@/components/ui/CustomModal';

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
}



export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [editValues, setEditValues] = useState<Partial<EmployeeRow>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
          hire_date: emp.hire_date
        }));
        setEmployees(transformedData);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const openEdit = (row: EmployeeRow) => {
    setEditing(row);
    setEditValues({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email || '',
      phone_number: row.phone_number || '',
      department_id: row.department_id || '',
      designation: row.designation || '',
      employment_status: row.employment_status || 'Active'
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = await employeeService.updateEmployee(editing.employee_id, editValues as any);
      setEmployees(prev => prev.map(e => (e.employee_id === updated.id ? { ...e, ...updated } : e)));
      setEditing(null);
    } catch (e) {
      console.error('Failed to update employee', e);
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
      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No employees found.</div>
        ) : (
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
                  <th className="px-6 py-3"></th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${emp.employment_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {emp.employment_status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => openEdit(emp)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit Employee: ${editing.employee_id}` : 'Edit Employee'}
        values={editValues}
        fields={[
          { name: 'first_name', label: 'First Name', type: 'text' },
          { name: 'last_name', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'phone_number', label: 'Phone', type: 'text' },
          { name: 'department_id', label: 'Department', type: 'text' },
          { name: 'designation', label: 'Designation', type: 'text' },
          { name: 'employment_status', label: 'Status', type: 'text' },
        ]}
        onChange={setEditValues as any}
        onSave={saveEdit}
        saveLabel="Save Changes"
      />
    </div>
  );
}
