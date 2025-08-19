import React, { useState, useEffect } from 'react';
import { salaryCodesService, SalaryCode } from '@/lib/salary-codes-service';
import { EditModal } from '@/components/ui/CustomModal';

const SalaryCodeList: React.FC = () => {
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SalaryCode | null>(null);
  const [editValues, setEditValues] = useState({ site_name: '', rank: '', state: '', base_wage: 0, skill_level: '' });

  useEffect(() => {
    const fetchSalaryCodes = async () => {
      try {
        setLoading(true);
        const codes = await salaryCodesService.getSalaryCodes();
        setSalaryCodes(codes);
      } catch (err: any) {
        console.error('Error fetching salary codes:', err);
        setError(err.message || 'Failed to fetch salary codes');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryCodes();
  }, []);

  const openEdit = (code: SalaryCode) => {
    setEditing(code);
    setEditValues({
      site_name: code.site_name,
      rank: code.rank,
      state: code.state,
      base_wage: code.base_wage,
      skill_level: code.skill_level || ''
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const updated = await salaryCodesService.updateSalaryCode(editing.salary_code, editValues);
      setSalaryCodes(prev => prev.map(c => (c.id === updated.id ? { ...c, ...updated } : c)));
      setEditing(null);
    } catch (e) {
      console.error('Failed to update salary code', e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading salary codes...</span>
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
        <h2 className="text-2xl font-bold text-gray-800">Salary Codes</h2>
        <p className="text-gray-600 mt-1">Manage existing salary codes</p>
      </div>

      <div className="p-6">
        {salaryCodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No salary codes found.</p>
            <p className="text-sm text-gray-400 mt-1">Create your first salary code using the form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Wage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {code.salary_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.site_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{code.base_wage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => openEdit(code)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">Edit</button>
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
        title={editing ? `Edit Salary Code: ${editing.salary_code}` : 'Edit Salary Code'}
        values={editValues}
        fields={[
          { name: 'site_name', label: 'Site Name', type: 'text' },
          { name: 'rank', label: 'Rank', type: 'text' },
          { name: 'state', label: 'State', type: 'text' },
          { name: 'base_wage', label: 'Base Wage', type: 'number' },
        ]}
        onChange={setEditValues}
        onSave={saveEdit}
        saveLabel="Save Changes"
      />
    </div>
  );
};

export default SalaryCodeList;
