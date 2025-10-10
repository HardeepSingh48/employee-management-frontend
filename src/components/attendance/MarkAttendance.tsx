'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/auth-slice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/lib/attendance-service';
import { sitesService, type Site } from '@/lib/sites-service';
import { employeeService } from '@/lib/employee-service';
import { salaryCodesService, type SalaryCode } from '@/lib/salary-codes-service';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  site_id: string;
  department_name: string;
  designation: string;
}

interface BulkAttendanceData {
  employee_id: string;
  attendance_status: 'Present' | 'Absent' | 'OFF';
  attendance_date: string;
  overtime_shifts?: number;
}

export default function MarkAttendance() {
  const user = useSelector(selectUser);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'OFF'>('Present');
  const [overtimeShifts, setOvertimeShifts] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [bulkAttendance, setBulkAttendance] = useState<BulkAttendanceData[]>([]);
  const [bulkDate, setBulkDate] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load sites, salary codes and employees
        const [sitesRes, salaryCodesRes, employeeData] = await Promise.all([
          sitesService.getSites(1, 1000),
          salaryCodesService.getSalaryCodes(),
          employeeService.getEmployees()
        ]);

        setSites(sitesRes.data || []);
        setSalaryCodes(salaryCodesRes);
        setAllEmployees(employeeData);

        // Load employees for the current user (role-based filtering)
        await loadEmployees();
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

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setAttendanceDate(today);
    setBulkDate(today);
  }, []);

  // Load employees when allEmployees data is available
  useEffect(() => {
    if (allEmployees.length > 0 || user?.role === 'supervisor') {
      loadEmployees();
    }
  }, [allEmployees, user?.role]);

  // Update bulk attendance when site changes
  useEffect(() => {
    if (user?.role !== 'employee' && employees.length > 0) {
      const filteredEmployees = selectedSiteId
        ? employees.filter((emp: any) => {
            const siteSalaryCodes = getSalaryCodesForSite(selectedSiteId);
            return siteSalaryCodes.includes(emp.salary_code || emp.salaryCode);
          })
        : employees;

      const bulkData = filteredEmployees.map((emp: Employee) => ({
        employee_id: emp.employee_id,
        attendance_status: 'Present' as const,
        attendance_date: bulkDate || new Date().toISOString().split('T')[0],
        overtime_shifts: 0
      }));
      setBulkAttendance(bulkData);
    }
  }, [selectedSiteId, employees, bulkDate, user?.role, salaryCodes, sites]);

  // Calculate date restrictions based on user role
  const getDateRestrictions = () => {
    const today = new Date();
    const userRole = user?.role;

    if (userRole === 'admin') {
      // Admin: no restrictions
      return {
        min: undefined,
        max: undefined
      };
    } else if (userRole === 'supervisor') {
      // Supervisor: current day + last 3 days
      const minDate = new Date(today);
      minDate.setDate(today.getDate() - 3);
      return {
        min: minDate.toISOString().split('T')[0],
        max: today.toISOString().split('T')[0]
      };
    } else {
      // Employee: only current day
      return {
        min: today.toISOString().split('T')[0],
        max: today.toISOString().split('T')[0]
      };
    }
  };

  const dateRestrictions = getDateRestrictions();

  // Helper function to get salary codes for selected site
  const getSalaryCodesForSite = (siteId: string) => {
    const selectedSite = sites.find(s => s.site_id === siteId);
    if (!selectedSite) return [];

    return salaryCodes
      .filter(sc => sc.site_name === selectedSite.site_name)
      .map(sc => sc.salary_code);
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      let data: any[] = [];

      if (user?.role === 'supervisor') {
        // Supervisors get their site employees
        data = await attendanceService.getSiteEmployees();
      } else if (user?.role === 'admin') {
        // Admins get all employees
        data = allEmployees;
      } else if (user?.role === 'employee') {
        // Employees get only themselves
        data = allEmployees.filter(emp => emp.employee_id === (user as any).employee_id);
      }

      console.log('Loaded employees:', data); // Debug log

      setEmployees(data);

      // Initialize bulk attendance with all employees as Present (only for supervisors and admins)
      if (user?.role !== 'employee') {
        const bulkData = data.map((emp: Employee) => ({
          employee_id: emp.employee_id,
          attendance_status: 'Present' as const,
          attendance_date: bulkDate || new Date().toISOString().split('T')[0],
          overtime_shifts: 0
        }));
        setBulkAttendance(bulkData);
      }
    } catch (error: any) {
      console.error('Error loading employees:', error); // Debug log
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !attendanceDate) {
      toast({
        title: 'Error',
        description: 'Please select an employee and date',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const attendanceData = {
        employee_id: selectedEmployee,
        attendance_date: attendanceDate,
        attendance_status: attendanceStatus,
        overtime_shifts: overtimeShifts,
        remarks: remarks
      };

      await attendanceService.markAttendance(attendanceData);

      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });

      // Reset form
      setSelectedEmployee('');
      setAttendanceStatus('Present');
      setOvertimeShifts(0);
      setRemarks('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkDate || bulkAttendance.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a date and ensure employees are loaded',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const attendanceRecords = bulkAttendance.map(record => ({
        ...record,
        attendance_date: bulkDate
      }));

      const result = await attendanceService.bulkMarkAttendance({
        attendance_records: attendanceRecords
      });

      toast({
        title: 'Success',
        description: `Successfully marked attendance for ${result.successful_count} out of ${result.total_count} employees`,
      });

             // Reset bulk attendance to Present for filtered employees
      const filteredEmployees = selectedSiteId
        ? employees.filter((emp: any) => {
            const siteSalaryCodes = getSalaryCodesForSite(selectedSiteId);
            return siteSalaryCodes.includes(emp.salary_code || emp.salaryCode);
          })
        : employees;
      const resetBulkData = filteredEmployees.map((emp: Employee) => ({
        employee_id: emp.employee_id,
        attendance_status: 'Present' as const,
        attendance_date: bulkDate,
        overtime_shifts: 0
      }));
      setBulkAttendance(resetBulkData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark bulk attendance',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateBulkAttendance = (employeeId: string, status: 'Present' | 'Absent' | 'OFF') => {
    setBulkAttendance(prev => 
      prev.map(record => 
        record.employee_id === employeeId 
          ? { ...record, attendance_status: status }
          : record
      )
    );
  };

  const updateBulkOvertime = (employeeId: string, overtimeShifts: number) => {
    setBulkAttendance(prev => 
      prev.map(record => 
        record.employee_id === employeeId 
          ? { ...record, overtime_shifts: overtimeShifts }
          : record
      )
    );
  };

  const setAllBulkAttendance = (status: 'Present' | 'Absent' | 'OFF') => {
    setBulkAttendance(prev => 
      prev.map(record => ({ ...record, attendance_status: status }))
    );
  };

  const setAllBulkOvertime = (overtimeShifts: number) => {
    setBulkAttendance(prev => 
      prev.map(record => ({ ...record, overtime_shifts: overtimeShifts }))
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'OFF': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'OFF': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Mark Attendance</h2>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className={`grid w-full ${user?.role === 'employee' ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <TabsTrigger value="individual" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Individual</span>
          </TabsTrigger>
          {user?.role !== 'employee' && (
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Bulk Mark Today</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mark Individual Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIndividualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="site">Site</Label>
                    <select
                      id="site"
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Sites</option>
                      {sites
                        .filter(site => {
                          if (user?.role === 'supervisor') {
                            // Supervisors can only see their own site
                            return site.site_id === (user as any).site_id;
                          }
                          return true; // Admins can see all sites
                        })
                        .map((site) => (
                          <option key={site.site_id} value={site.site_id}>
                            {site.site_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <select
                      id="employee"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select employee</option>
                      {employees
                        .filter((emp: any) => {
                          if (!selectedSiteId) return true;
                          const siteSalaryCodes = getSalaryCodesForSite(selectedSiteId);
                          return siteSalaryCodes.includes(emp.salary_code || emp.salaryCode);
                        })
                        .map((emp) => {
                          const employeeName = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown';
                          const displayText = `${emp.employee_id} - ${employeeName}`;
                          return (
                            <option key={emp.employee_id} value={emp.employee_id}>
                              {displayText}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      min={dateRestrictions.min}
                      max={dateRestrictions.max}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.value as 'Present' | 'Absent' | 'OFF')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="OFF">OFF</option>
                    </select>
                  </div>

                                     <div>
                     <Label htmlFor="overtime">Overtime (Shifts)</Label>
                     <Input
                       id="overtime"
                       type="number"
                       min="0"
                       step="0.5"
                       max="3"
                       value={overtimeShifts}
                       onChange={(e) => setOvertimeShifts(parseFloat(e.target.value) || 0)}
                       placeholder="0.0"
                     />
                     <p className="text-xs text-gray-500 mt-1">1 shift = 8 hours; 0.5 = 4 hours</p>
                   </div>

                   <div>
                     <Label htmlFor="remarks">Remarks (Optional)</Label>
                     <Input
                       id="remarks"
                       value={remarks}
                       onChange={(e) => setRemarks(e.target.value)}
                       placeholder="Add any remarks..."
                     />
                   </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Marking Attendance...' : 'Mark Attendance'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role !== 'employee' && (
          <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Mark Attendance for Today</CardTitle>
              <p className="text-sm text-gray-600">
                Mark attendance for all employees at once. Default status is "Present".
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulk-site">Site</Label>
                    <select
                      id="bulk-site"
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Sites</option>
                      {sites
                        .filter(site => {
                          if (user?.role === 'supervisor') {
                            // Supervisors can only see their own site
                            return site.site_id === (user as any).site_id;
                          }
                          return true; // Admins can see all sites
                        })
                        .map((site) => (
                          <option key={site.site_id} value={site.site_id}>
                            {site.site_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="bulk-date">Date</Label>
                    <Input
                      id="bulk-date"
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      min={dateRestrictions.min}
                      max={dateRestrictions.max}
                      required
                    />
                  </div>
               </div>
               <div className="flex space-x-2">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => setAllBulkAttendance('Present')}
                       className="text-green-600"
                     >
                       All Present
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => setAllBulkAttendance('Absent')}
                       className="text-red-600"
                     >
                       All Absent
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => setAllBulkOvertime(0)}
                       className="text-blue-600"
                     >
                       Clear OT
                     </Button>
                   </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Employee Attendance</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bulkAttendance.map((record) => {
                      const employee = employees.find(emp => emp.employee_id === record.employee_id);
                      return (
                        <div key={record.employee_id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(record.attendance_status)}
                            <div>
                              <p className="font-medium">
                                {employee?.employee_id} - {employee?.full_name || `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">{employee?.designation || 'No designation'}</p>
                            </div>
                          </div>
                                                     <div className="flex space-x-2">
                             <select
                               value={record.attendance_status}
                               onChange={(e) => updateBulkAttendance(record.employee_id, e.target.value as 'Present' | 'Absent' | 'OFF')}
                               className="flex h-8 w-32 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                             >
                               <option value="Present">Present</option>
                               <option value="Absent">Absent</option>
                               <option value="OFF">OFF</option>
                             </select>
                             <Input
                               type="number"
                               min="0"
                               step="0.5"
                               max="3"
                               placeholder="OT"
                               className="w-20"
                               value={record.overtime_shifts || 0}
                               onChange={(e) => updateBulkOvertime(record.employee_id, parseFloat(e.target.value) || 0)}
                             />
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Marking Bulk Attendance...' : `Mark Attendance for ${bulkAttendance.length} Employees`}
                </Button>
              </form>
            </CardContent>
          </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
