'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/lib/attendance-service';
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
  attendance_status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  attendance_date: string;
  overtime_shifts?: number;
}

export default function MarkAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Late' | 'Half Day'>('Present');
  const [overtimeShifts, setOvertimeShifts] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [bulkAttendance, setBulkAttendance] = useState<BulkAttendanceData[]>([]);
  const [bulkDate, setBulkDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setAttendanceDate(today);
    setBulkDate(today);
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getSiteEmployees();
      setEmployees(data);
      
             // Initialize bulk attendance with all employees as Present
       const bulkData = data.map((emp: Employee) => ({
         employee_id: emp.employee_id,
         attendance_status: 'Present' as const,
         attendance_date: bulkDate || new Date().toISOString().split('T')[0],
         overtime_shifts: 0
       }));
      setBulkAttendance(bulkData);
    } catch (error: any) {
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

             // Reset bulk attendance to Present for all employees
       const resetBulkData = employees.map((emp: Employee) => ({
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

  const updateBulkAttendance = (employeeId: string, status: 'Present' | 'Absent' | 'Late' | 'Half Day') => {
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

  const setAllBulkAttendance = (status: 'Present' | 'Absent' | 'Late' | 'Half Day') => {
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
      case 'Late': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Half Day': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Half Day': return 'bg-orange-100 text-orange-800';
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Individual</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Bulk Mark Today</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mark Individual Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIndividualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.employee_id} value={emp.employee_id}>
                            {emp.full_name} - {emp.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Half Day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="bulk-date">Date</Label>
                    <Input
                      id="bulk-date"
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      required
                    />
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
                              <p className="font-medium">{employee?.full_name}</p>
                              <p className="text-sm text-gray-600">{employee?.designation}</p>
                            </div>
                          </div>
                                                     <div className="flex space-x-2">
                             <Select
                               value={record.attendance_status}
                               onValueChange={(value: any) => updateBulkAttendance(record.employee_id, value)}
                             >
                               <SelectTrigger className="w-32">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Present">Present</SelectItem>
                                 <SelectItem value="Absent">Absent</SelectItem>
                                 <SelectItem value="Late">Late</SelectItem>
                                 <SelectItem value="Half Day">Half Day</SelectItem>
                               </SelectContent>
                             </Select>
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
      </Tabs>
    </div>
  );
}
