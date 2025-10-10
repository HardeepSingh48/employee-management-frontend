'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calendar, TrendingUp, Clock, User } from 'lucide-react';
import { attendanceService } from '@/lib/attendance-service';
import type { AttendanceRecord } from '@/lib/attendance-service';
import { sitesService, type Site } from '@/lib/sites-service';
import { employeeService } from '@/lib/employee-service';
import { salaryCodesService, type SalaryCode } from '@/lib/salary-codes-service';
import type { MonthlyAttendanceSummary } from '@/types/attendance';
import type { Employee } from '@/types/employee';

export default function MonthlyView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [monthlySummary, setMonthlySummary] = useState<MonthlyAttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [siteAttendance, setSiteAttendance] = useState<AttendanceRecord[]>([]);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);

  // Helper function to get employee name
  const getEmployeeName = (employee: Employee) => {
    return employee.full_name || 
           employee.fullName || 
           `${employee.first_name || ''} ${employee.last_name || ''}`.trim() ||
           'Unknown Employee';
  };

  // Helper function to get employee ID
  const getEmployeeId = (employee: Employee) => {
    return employee.employee_id || employee.id || '';
  };

  // Helper function to get salary codes for selected site
  const getSalaryCodesForSite = (siteId: string) => {
    const selectedSite = sites.find(s => s.site_id === siteId);
    if (!selectedSite) return [];

    return salaryCodes
      .filter(sc => sc.site_name === selectedSite.site_name)
      .map(sc => sc.salary_code);
  };

  // Load sites, salary codes and employees on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sitesRes, salaryCodesRes, employeeData] = await Promise.all([
          sitesService.getSites(1, 1000),
          salaryCodesService.getSalaryCodes(),
          employeeService.getEmployees()
        ]);

        setSites(sitesRes.data || []);
        setSalaryCodes(salaryCodesRes);
        // console.log('Loaded employees:', employeeData); // Debug log
        setEmployees(employeeData);
        if (employeeData.length > 0) {
          const firstEmployeeId = getEmployeeId(employeeData[0]);
          setSelectedEmployee(String(firstEmployeeId));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, []);

  // Load monthly summary when employee, year, or month changes
  useEffect(() => {
    if (selectedEmployee && selectedYear && selectedMonth) {
      loadMonthlySummary();
    }
  }, [selectedEmployee, selectedYear, selectedMonth]);

  // Update selected employee when site changes
  useEffect(() => {
    if (selectedSiteId && employees.length > 0) {
      const siteSalaryCodes = getSalaryCodesForSite(selectedSiteId);
      const filteredEmployees = employees.filter((e: any) =>
        siteSalaryCodes.includes(e.salary_code || e.salaryCode)
      );

      if (filteredEmployees.length > 0) {
        // Check if current selected employee is still valid
        const currentEmployee = employees.find(emp =>
          String(getEmployeeId(emp)) === String(selectedEmployee)
        );
        const isCurrentValid = currentEmployee && siteSalaryCodes.includes(currentEmployee.salary_code || currentEmployee.salaryCode || '');

        if (!isCurrentValid) {
          // Select first employee from filtered list
          const firstEmployeeId = getEmployeeId(filteredEmployees[0]);
          setSelectedEmployee(String(firstEmployeeId));
        }
      } else {
        // No employees for this site
        setSelectedEmployee('');
      }
    }
  }, [selectedSiteId, employees, salaryCodes]);

  // Load site attendance when site, year, or month changes
  useEffect(() => {
    const loadSiteAttendance = async () => {
      if (!selectedYear || !selectedMonth || !selectedSiteId) {
        setSiteAttendance([]);
        return;
      }
      try {
        const yearNum = parseInt(selectedYear, 10);
        const monthNum = parseInt(selectedMonth, 10);
        const start = new Date(yearNum, monthNum - 1, 1);
        const end = new Date(yearNum, monthNum, 0);
        const startDate = attendanceService.formatDate(start);
        const endDate = attendanceService.formatDate(end);
        const records = await attendanceService.getSiteAttendance(startDate, endDate, undefined, selectedSiteId);
        setSiteAttendance(records || []);
      } catch (error) {
        console.error('Error loading site attendance:', error);
        setSiteAttendance([]);
      }
    };
    loadSiteAttendance();
  }, [selectedSiteId, selectedYear, selectedMonth]);

  const loadMonthlySummary = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      const summary = await attendanceService.getMonthlyAttendanceSummary(
        selectedEmployee,
        parseInt(selectedYear),
        parseInt(selectedMonth)
      );
      setMonthlySummary(summary);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to load monthly attendance summary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge variant="default" className="bg-green-100 text-green-800">P</Badge>;
      case 'Absent':
        return <Badge variant="destructive">A</Badge>;
      case 'Late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">L</Badge>;
      case 'Half Day':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">H</Badge>;
      case 'Holiday':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">HOL</Badge>;
      case 'Leave':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">LV</Badge>;
      case 'OFF':
        return <Badge variant="outline" className="border-gray-500 text-gray-700 bg-gray-50">OFF</Badge>;
      default:
        return <Badge variant="outline">{status.charAt(0)}</Badge>;
    }
  };

  const selectedEmployeeData = employees.find(emp => 
    String(getEmployeeId(emp)) === String(selectedEmployee)
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Site Name</label>
          <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((s) => (
                <SelectItem key={s.site_id} value={s.site_id}>{s.site_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Employee</label>
          <Select 
            value={selectedEmployee || ''} 
            onValueChange={setSelectedEmployee}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                const siteSalaryCodes = selectedSiteId ? getSalaryCodesForSite(selectedSiteId) : [];
                const filteredEmployees = employees.filter((e: any) =>
                  !selectedSiteId || siteSalaryCodes.includes(e.salary_code || e.salaryCode)
                );

                return filteredEmployees.length === 0 ? (
                  <SelectItem value="no-employees" disabled>
                    No employees found
                  </SelectItem>
                ) : (
                  filteredEmployees.map((employee) => {
                    const employeeId = getEmployeeId(employee);
                    const employeeName = getEmployeeName(employee);

                    return (
                      <SelectItem
                        key={employeeId}
                        value={String(employeeId)}
                      >
                        {employeeId} - {employeeName}
                      </SelectItem>
                    );
                  })
                );
              })()}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Info */}
      {selectedEmployeeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{getEmployeeName(selectedEmployeeData)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                <p>{getEmployeeId(selectedEmployeeData)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p>{selectedEmployeeData.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Designation</p>
                <p>{selectedEmployeeData.designation || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading monthly summary...</span>
        </div>
      )}

      {/* Monthly Summary */}
      {monthlySummary && !isLoading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{monthlySummary.present_days}</p>
                    <p className="text-xs text-muted-foreground">Present Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{monthlySummary.absent_days}</p>
                    <p className="text-xs text-muted-foreground">Absent Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{monthlySummary.total_overtime_hours}</p>
                    <p className="text-xs text-muted-foreground">Overtime Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{monthlySummary.attendance_percentage}%</p>
                    <p className="text-xs text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                {getMonthName(monthlySummary.month)} {monthlySummary.year} - Detailed Summary
              </CardTitle>
              <CardDescription>
                Working Days: {monthlySummary.working_days} | Holidays: {monthlySummary.holiday_count}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{monthlySummary.present_days}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-600">{monthlySummary.absent_days}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">{monthlySummary.total_overtime_shifts}</p>
                  <p className="text-sm text-muted-foreground">Overtime Shifts</p>
                </div>
              </div>

              {/* Calendar View - Simple list for now */}
              <div className="space-y-2">
                <h4 className="font-medium">Daily Records:</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {monthlySummary.records.map((record) => (
                    <div key={record.attendance_id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.attendance_status)}
                        {record.overtime_hours > 0 && (
                          <Badge variant="outline" className="text-xs">
                            +{record.overtime_hours}h OT
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Data State */}
      {!monthlySummary && !isLoading && selectedEmployee && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No attendance data found for the selected period</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}