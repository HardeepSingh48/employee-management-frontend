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
import { Calendar, Clock, Download, Search, Filter } from 'lucide-react';

interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  overtime_hours: number;
  total_hours_worked: number;
  remarks: string | null;
  marked_by: string;
  created_date: string | null;
}

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  site_id: string;
  department_name: string;
  designation: string;
}

export default function AttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadAttendanceRecords();
    }
  }, [startDate, endDate, selectedEmployee, selectedStatus]);

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

  const loadAttendanceRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getSiteAttendance(
        startDate,
        endDate,
        selectedEmployee === 'all' ? undefined : selectedEmployee
      );
      
      // Filter by status if selected
      let filteredData = data;
      if (selectedStatus && selectedStatus !== 'all') {
        filteredData = data.filter(record => record.attendance_status === selectedStatus);
      }
      
      setAttendanceRecords(filteredData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load attendance records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      toast({
        title: 'No Data',
        description: 'No attendance records to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Date',
      'Status',
      'Check In',
      'Check Out',
      'Overtime Hours',
      'Total Hours',
      'Remarks',
      'Marked By',
      'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...attendanceRecords.map(record => [
        record.employee_id,
        `"${record.employee_name}"`,
        record.attendance_date,
        record.attendance_status,
        record.check_in_time || '',
        record.check_out_time || '',
        record.overtime_hours,
        record.total_hours_worked,
        `"${record.remarks || ''}"`,
        record.marked_by,
        record.created_date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_records_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Attendance records exported to CSV',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Half Day': return 'bg-orange-100 text-orange-800';
      case 'Leave': return 'bg-purple-100 text-purple-800';
      case 'Holiday': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Attendance Records</h2>
        </div>
        <Button onClick={exportToCSV} disabled={attendanceRecords.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="employee">Employee</Label>
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Records ({attendanceRecords.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading attendance records...</p>
              </div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found for the selected criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Employee</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Check In</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Check Out</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Overtime</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Total Hours</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Remarks</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.attendance_id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <div>
                          <div className="font-medium">{record.employee_name}</div>
                          <div className="text-sm text-gray-600">{record.employee_id}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className={getStatusColor(record.attendance_status)}>
                          {record.attendance_status}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDateTime(record.check_in_time)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDateTime(record.check_out_time)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {record.overtime_hours} hrs
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {record.total_hours_worked} hrs
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {record.remarks || '-'}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="capitalize">{record.marked_by}</span>
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
