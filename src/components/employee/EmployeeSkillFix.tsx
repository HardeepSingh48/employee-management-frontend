'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, Save, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const SKILL_CATEGORIES = [
  'Highly Skilled',
  'Skilled', 
  'Semi-Skilled',
  'Un-Skilled'
];

interface EmployeeDebugInfo {
  employee_id: string;
  name: string;
  skill_category: string | null;
  salary_code: string | null;
  wage_rate: number | null;
  wage_master_info: {
    salary_code: string;
    base_wage: number;
    skill_level: string;
    site_name: string;
    rank: string;
    state: string;
  } | null;
}

export default function EmployeeSkillFix() {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeDebugInfo | null>(null);
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSearchEmployee = async () => {
    if (!employeeId.trim()) {
      toast({
        title: 'Missing Employee ID',
        description: 'Please enter an employee ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}/debug`);
      setEmployeeInfo(response.data.data);
      setNewSkillCategory(response.data.data.skill_category || '');
      
      toast({
        title: 'Employee Found',
        description: `Loaded data for ${response.data.data.name}`,
      });
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      toast({
        title: 'Employee Not Found',
        description: error.response?.data?.message || 'Failed to fetch employee data',
        variant: 'destructive',
      });
      setEmployeeInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSkillCategory = async () => {
    if (!employeeInfo || !newSkillCategory) {
      toast({
        title: 'Missing Information',
        description: 'Please select a skill category',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await api.put(`/employees/${employeeInfo.employee_id}`, {
        skill_category: newSkillCategory
      });
      
      // Update local state
      setEmployeeInfo({
        ...employeeInfo,
        skill_category: newSkillCategory
      });
      
      toast({
        title: 'Success',
        description: `Skill category updated to ${newSkillCategory}`,
      });
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update skill category',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Employee Skill Category Fix
          </CardTitle>
          <CardDescription>
            Debug and fix skill category issues for salary calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="employee-id">Employee ID</Label>
              <Input
                id="employee-id"
                placeholder="Enter Employee ID (e.g., EMP001)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearchEmployee} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {employeeInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>
              Current data for {employeeInfo.name} ({employeeInfo.employee_id})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Current Employee Data</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Employee ID:</span>
                    <span className="font-medium">{employeeInfo.employee_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{employeeInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Category:</span>
                    <span className={`font-medium ${!employeeInfo.skill_category ? 'text-red-500' : 'text-green-600'}`}>
                      {employeeInfo.skill_category || 'NOT SET ❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Code:</span>
                    <span className="font-medium">{employeeInfo.salary_code || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Wage Rate:</span>
                    <span className="font-medium">
                      {employeeInfo.wage_rate ? `₹${employeeInfo.wage_rate}` : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Salary Code Information</h4>
                {employeeInfo.wage_master_info ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Wage:</span>
                      <span className="font-medium text-green-600">₹{employeeInfo.wage_master_info.base_wage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Site:</span>
                      <span className="font-medium">{employeeInfo.wage_master_info.site_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rank:</span>
                      <span className="font-medium">{employeeInfo.wage_master_info.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State:</span>
                      <span className="font-medium">{employeeInfo.wage_master_info.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WageMaster Skill:</span>
                      <span className="font-medium">{employeeInfo.wage_master_info.skill_level}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">No salary code assigned ❌</p>
                )}
              </div>
            </div>

            {/* Issue Diagnosis */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Issue Diagnosis:</h4>
              <div className="text-sm text-yellow-700">
                {!employeeInfo.skill_category && (
                  <p>• ❌ Employee skill category is not set - this causes "Not Specified" in salary calculations</p>
                )}
                {!employeeInfo.salary_code && (
                  <p>• ⚠️ No salary code assigned - will use fallback wage rates</p>
                )}
                {employeeInfo.skill_category && employeeInfo.salary_code && (
                  <p>• ✅ Employee data looks good - skill category and salary code are set</p>
                )}
              </div>
            </div>

            {/* Fix Section */}
            <div className="space-y-4">
              <h4 className="font-medium">Fix Skill Category</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="skill-category">Select Skill Category</Label>
                  <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleUpdateSkillCategory} 
                    disabled={isUpdating || !newSkillCategory}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
