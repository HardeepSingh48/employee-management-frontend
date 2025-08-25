'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/lib/attendance-service';
import { Calculator, Download, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  site_id: string;
  department_name: string;
  designation: string;
}

interface SalarySummary {
  employee_id: string;
  employee_name: string;
  year: number;
  month: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  total_overtime_hours: number;
  working_days: number;
  holiday_count: number;
  attendance_percentage: number;
  basic_salary?: number;
  calculated_salary?: number;
}

export default function SiteSalaryReport() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salarySummaries, setSalarySummaries] = useState<SalarySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      loadSalarySummaries();
    }
  }, [selectedYear, selectedMonth, selectedEmployee, employees]);

  const loadEmployees = async () => {
    try {
      const data = await attendanceService.getSiteEmployees();
      setEmployees(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load employees',
        variant: 'destructive',
      });
    }
  };

  const loadSalarySummaries = async () => {
    setLoading(true);
    try {
      const summaries: SalarySummary[] = [];
      
      // Filter employees if specific employee is selected
      const employeesToProcess = selectedEmployee && selectedEmployee !== 'all'
        ? employees.filter(emp => emp.employee_id === selectedEmployee)
        : employees;

      for (const employee of employeesToProcess) {
        try {
          const summary = await attendanceService.getMonthlyAttendanceSummary(
            employee.employee_id,
            selectedYear,
            selectedMonth
          );
          
          // if (summary.success) {
          //   summaries.push({
          //     ...summary.data,
          //     employee_name: employee.full_name
          //   });
          // }
        } catch (error) {
          console.error(`Error loading summary for ${employee.employee_id}:`, error);
        }
      }
      
      setSalarySummaries(summaries);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load salary summaries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (salarySummaries.length === 0) {
      toast({
        title: 'No Data',
        description: 'No salary data to export',
        variant: 'destructive',
      });
      return;
    }

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
    const headers = [
      'Employee ID',
      'Employee Name',
      'Year',
      'Month',
      'Present Days',
      'Absent Days',
      'Late Days',
      'Half Days',
      'Overtime Hours',
      'Working Days',
      'Holidays',
      'Attendance %',
      'Basic Salary',
      'Calculated Salary'
    ];

    const csvContent = [
      headers.join(','),
      ...salarySummaries.map(summary => [
        summary.employee_id,
        `"${summary.employee_name}"`,
        summary.year,
        summary.month,
        summary.present_days,
        summary.absent_days,
        summary.late_days,
        summary.half_days,
        summary.total_overtime_hours,
        summary.working_days,
        summary.holiday_count,
        summary.attendance_percentage,
        summary.basic_salary || 0,
        summary.calculated_salary || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${monthName}_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Salary report exported to CSV',
    });
  };

  const getAttendancePercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendancePercentageBadge = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalPresentDays = salarySummaries.reduce((sum, s) => sum + s.present_days, 0);
  const totalAbsentDays = salarySummaries.reduce((sum, s) => sum + s.absent_days, 0);
  const totalOvertimeHours = salarySummaries.reduce((sum, s) => sum + s.total_overtime_hours, 0);
  const averageAttendance = salarySummaries.length > 0 
    ? salarySummaries.reduce((sum, s) => sum + s.attendance_percentage, 0) / salarySummaries.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Site Salary Report</h2>
        </div>
        <Button onClick={exportToCSV} disabled={salarySummaries.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee">Employee (Optional)</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Present Days</p>
                <p className="text-2xl font-bold text-green-600">{totalPresentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Absent Days</p>
                <p className="text-2xl font-bold text-red-600">{totalAbsentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Overtime</p>
                <p className="text-2xl font-bold text-blue-600">{totalOvertimeHours.toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className={`text-2xl font-bold ${getAttendancePercentageColor(averageAttendance)}`}>
                  {averageAttendance.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Salary Report for {monthNames[selectedMonth - 1]} {selectedYear} 
            ({salarySummaries.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading salary data...</p>
              </div>
            </div>
          ) : salarySummaries.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No salary data found for the selected criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Employee</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Present</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Absent</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Late</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Half Days</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Overtime</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Working Days</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Attendance %</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Basic Salary</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Calculated</th>
                  </tr>
                </thead>
                <tbody>
                  {salarySummaries.map((summary) => (
                    <tr key={summary.employee_id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <div>
                          <div className="font-medium">{summary.employee_name}</div>
                          <div className="text-sm text-gray-600">{summary.employee_id}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className="bg-green-100 text-green-800">{summary.present_days}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className="bg-red-100 text-red-800">{summary.absent_days}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className="bg-yellow-100 text-yellow-800">{summary.late_days}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className="bg-orange-100 text-orange-800">{summary.half_days}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {summary.total_overtime_hours.toFixed(1)} hrs
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {summary.working_days}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className={getAttendancePercentageBadge(summary.attendance_percentage)}>
                          {summary.attendance_percentage.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="font-medium">
                          ₹{summary.basic_salary?.toLocaleString() || 'N/A'}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="font-bold text-green-600">
                          ₹{summary.calculated_salary?.toLocaleString() || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
