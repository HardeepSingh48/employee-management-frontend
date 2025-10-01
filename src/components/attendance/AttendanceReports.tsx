'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, BarChart3, Calendar, Filter } from 'lucide-react';
import { attendanceService, type AttendanceRecord } from '@/lib/attendance-service';
import { sitesService, type Site } from '@/lib/sites-service';

export default function AttendanceReports() {
  // Loading state per report
  const [generatingMonthly, setGeneratingMonthly] = useState(false);
  const [generatingDaily, setGeneratingDaily] = useState(false);
  const [generatingEmployee, setGeneratingEmployee] = useState(false);
  const [generatingDepartment, setGeneratingDepartment] = useState(false);

  // Monthly report state
  const now = useMemo(() => new Date(), []);
  const [monthlyMonth, setMonthlyMonth] = useState<string>((now.getMonth() + 1).toString());
  const [monthlyYear, setMonthlyYear] = useState<string>(now.getFullYear().toString());
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await sitesService.getSites(1, 1000);
        setSites(res.data || []);
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message || 'Failed to load sites', variant: 'destructive' });
      }
    };
    loadSites();
  }, []);

  // Daily report state
  const [dailyDate, setDailyDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Employee report state
  const [employeeId, setEmployeeId] = useState<string>('');
  const [employeeFrom, setEmployeeFrom] = useState<string>('');
  const [employeeTo, setEmployeeTo] = useState<string>('');

  // Department report state
  const [department, setDepartment] = useState<string>('all');
  const [departmentFrom, setDepartmentFrom] = useState<string>('');
  const [departmentTo, setDepartmentTo] = useState<string>('');

  const downloadCsv = (filename: string, rows: Array<Record<string, any>>) => {
    if (!rows || rows.length === 0) {
      toast({ title: 'No data', description: 'No records found for the selected criteria' });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')]
      .concat(
        rows.map(r => headers.map(h => {
          const val = r[h] ?? '';
          const s = String(val).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        }).join(','))
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateMonthlyReport = async () => {
    if (!monthlyMonth || !monthlyYear) {
      toast({ title: 'Missing inputs', description: 'Select month and year' , variant: 'destructive'});
      return;
    }
    setGeneratingMonthly(true);
    try {
      const monthNum = parseInt(monthlyMonth, 10);
      const yearNum = parseInt(monthlyYear, 10);
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0); // last day of month
      const start = attendanceService.formatDate(startDate);
      const end = attendanceService.formatDate(endDate);

      const records = await attendanceService.getSiteAttendance(start, end, undefined, selectedSiteId || undefined);

      // Group by employee and aggregate
      const map = new Map<string, { employee_id: string; employee_name: string; present: number; absent: number; late: number; halfDay: number; overtimeHours: number }>();
      for (const r of records) {
        const key = r.employee_id;
        const current = map.get(key) || { employee_id: r.employee_id, employee_name: r.employee_name || '', present: 0, absent: 0, late: 0, halfDay: 0, overtimeHours: 0 };
        switch (r.attendance_status) {
          case 'Present': current.present += 1; break;
          case 'Absent': current.absent += 1; break;
          case 'Late': current.late += 1; break;
          case 'Half Day': current.halfDay += 1; break;
        }
        current.overtimeHours += (r.overtime_hours || 0);
        map.set(key, current);
      }

      const rows = Array.from(map.values()).map(v => ({
        'Employee ID': v.employee_id,
        'Name': v.employee_name,
        'Present Days': v.present,
        'Absent Days': v.absent,
        'Late Days': v.late,
        'Half Days': v.halfDay,
        'Total Overtime Hours': Math.round(v.overtimeHours * 100) / 100,
      }));

      const monthName = new Date(0, parseInt(monthlyMonth, 10) - 1).toLocaleString('default', { month: 'long' });
      const siteSuffix = selectedSiteId ? `_${selectedSiteId}` : '';
      downloadCsv(`attendance_monthly${siteSuffix}_${monthName}_${monthlyYear}.csv`, rows);
      toast({ title: 'Report Generated', description: 'Monthly report generated' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error?.message || 'Failed to generate monthly report', variant: 'destructive' });
    } finally {
      setGeneratingMonthly(false);
    }
  };

  const generateDailyReport = async () => {
    if (!dailyDate) {
      toast({ title: 'Missing inputs', description: 'Select a date', variant: 'destructive' });
      return;
    }
    setGeneratingDaily(true);
    try {
      const records = await attendanceService.getAttendanceByDate(dailyDate);
      const rows = (records || []).map((r: AttendanceRecord) => ({
        'Employee ID': r.employee_id,
        'Employee Name': r.employee_name || '',
        'Status': r.attendance_status,
        'Check-in Time': r.check_in_time || '',
        'Check-out Time': r.check_out_time || '',
        'Remarks': r.remarks || ''
      }));
      downloadCsv(`attendance_daily_${dailyDate}.csv`, rows);
      toast({ title: 'Report Generated', description: 'Daily report generated' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error?.message || 'Failed to generate daily report', variant: 'destructive' });
    } finally {
      setGeneratingDaily(false);
    }
  };

  const generateEmployeeReport = async () => {
    if (!employeeId || !employeeFrom || !employeeTo) {
      toast({ title: 'Missing inputs', description: 'Provide Employee ID, From and To dates', variant: 'destructive' });
      return;
    }
    setGeneratingEmployee(true);
    try {
      const records = await attendanceService.getEmployeeAttendance(employeeId, employeeFrom, employeeTo);
      const rows = (records || []).map((r: AttendanceRecord) => ({
        'Employee ID': r.employee_id,
        'Employee Name': r.employee_name || '',
        'Date': r.attendance_date,
        'Status': r.attendance_status,
        'Overtime Hours': r.overtime_hours || 0,
        'Check-in Time': r.check_in_time || '',
        'Check-out Time': r.check_out_time || '',
        'Remarks': r.remarks || ''
      }));
      downloadCsv(`attendance_employee_${employeeId}_${employeeFrom}_to_${employeeTo}.csv`, rows);
      toast({ title: 'Report Generated', description: 'Employee report generated' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error?.message || 'Failed to generate employee report', variant: 'destructive' });
    } finally {
      setGeneratingEmployee(false);
    }
  };

  const generateDepartmentReport = async () => {
    if (!departmentFrom || !departmentTo || !department) {
      toast({ title: 'Missing inputs', description: 'Provide department and date range', variant: 'destructive' });
      return;
    }
    setGeneratingDepartment(true);
    try {
      const employees = await attendanceService.getSiteEmployees();
      const attendance = await attendanceService.getSiteAttendance(departmentFrom, departmentTo);

      // Filter employees by department (supports department name or id fields if present)
      const filteredEmployees = (employees || []).filter((e: any) => {
        if (department === 'all') return true;
        const empDept = e.department || e.department_name || e.department_id || '';
        return String(empDept).toLowerCase() === String(department).toLowerCase();
      });
      const employeeIdSet = new Set(filteredEmployees.map((e: any) => String(e.employee_id)));

      const filteredAttendance = (attendance || []).filter((r: AttendanceRecord) => employeeIdSet.has(String(r.employee_id)));

      // Aggregate similar to monthly
      const map = new Map<string, { employee_id: string; employee_name: string; present: number; absent: number; late: number; halfDay: number; overtimeHours: number }>();
      for (const r of filteredAttendance) {
        const key = r.employee_id;
        const current = map.get(key) || { employee_id: r.employee_id, employee_name: r.employee_name || '', present: 0, absent: 0, late: 0, halfDay: 0, overtimeHours: 0 };
        switch (r.attendance_status) {
          case 'Present': current.present += 1; break;
          case 'Absent': current.absent += 1; break;
          case 'Late': current.late += 1; break;
          case 'Half Day': current.halfDay += 1; break;
        }
        current.overtimeHours += (r.overtime_hours || 0);
        map.set(key, current);
      }

      const rows = Array.from(map.values()).map(v => ({
        'Employee ID': v.employee_id,
        'Name': v.employee_name,
        'Present Days': v.present,
        'Absent Days': v.absent,
        'Late Days': v.late,
        'Half Days': v.halfDay,
        'Total Overtime Hours': Math.round(v.overtimeHours * 100) / 100,
      }));

      downloadCsv(`attendance_department_${department}_${departmentFrom}_to_${departmentTo}.csv`, rows);
      toast({ title: 'Report Generated', description: 'Department report generated' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error', description: error?.message || 'Failed to generate department report', variant: 'destructive' });
    } finally {
      setGeneratingDepartment(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard">Standard Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Report
                </CardTitle>
                <CardDescription>
                  Generate monthly attendance summary for all employees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
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
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={monthlyMonth} onValueChange={setMonthlyMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={monthlyYear} onValueChange={setMonthlyYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 3 }, (_, i) => {
                          const year = new Date().getFullYear() - 1 + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={generateMonthlyReport} 
                  disabled={generatingMonthly}
                  className="w-full"
                >
                  {generatingMonthly ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Monthly Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Daily Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Daily Report
                </CardTitle>
                <CardDescription>
                  Generate daily attendance report for a specific date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input 
                    type="date" 
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generateDailyReport} 
                  disabled={generatingDaily}
                  className="w-full"
                >
                  {generatingDaily ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Daily Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Employee Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Employee Report
                </CardTitle>
                <CardDescription>
                  Generate attendance report for a specific employee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input placeholder="Enter employee ID (e.g., EMP001)" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" value={employeeFrom} onChange={(e) => setEmployeeFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" value={employeeTo} onChange={(e) => setEmployeeTo(e.target.value)} />
                  </div>
                </div>
                <Button 
                  onClick={generateEmployeeReport} 
                  disabled={generatingEmployee}
                  className="w-full"
                >
                  {generatingEmployee ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Employee Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Department Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Department Report
                </CardTitle>
                <CardDescription>
                  Generate attendance summary by department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" value={departmentFrom} onChange={(e) => setDepartmentFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" value={departmentTo} onChange={(e) => setDepartmentTo(e.target.value)} />
                  </div>
                </div>
                <Button 
                  onClick={generateDepartmentReport} 
                  disabled={generatingDepartment}
                  className="w-full"
                >
                  {generatingDepartment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Department Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>
                Create custom attendance reports with specific filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Custom report builder will be available soon</p>
                <p className="text-sm">This will allow you to create reports with custom filters and columns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Attendance Analytics
              </CardTitle>
              <CardDescription>
                View attendance trends and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Attendance analytics dashboard will be available soon</p>
                <p className="text-sm">This will include charts, trends, and insights about attendance patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
