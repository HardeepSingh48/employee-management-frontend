'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, RefreshCw, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { attendanceService } from '@/lib/attendance-service';
import type { Attendance } from '@/types/attendance';

export default function TodayAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const loadTodayAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getTodayAttendance();
      setAttendanceRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load today\'s attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  // Filter records based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecords(attendanceRecords);
    } else {
      const filtered = attendanceRecords.filter(record =>
        record.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.employee_name && record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, attendanceRecords]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'Late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>;
      case 'Half Day':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Half Day</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '--';
    }
  };

  const calculateWorkingHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return '--';
    try {
      const inTime = new Date(checkIn);
      const outTime = new Date(checkOut);
      const diffMs = outTime.getTime() - inTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return `${diffHours.toFixed(1)}h`;
    } catch {
      return '--';
    }
  };

  // Calculate stats
  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.attendance_status === 'Present').length,
    absent: filteredRecords.filter(r => r.attendance_status === 'Absent').length,
    late: filteredRecords.filter(r => r.attendance_status === 'Late').length,
    halfDay: filteredRecords.filter(r => r.attendance_status === 'Half Day').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading today's attendance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.halfDay}</p>
                <p className="text-xs text-muted-foreground">Half Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Button onClick={loadTodayAttendance} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance - {currentDate}</CardTitle>
          <CardDescription>
            {filteredRecords.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records found for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.attendance_id}>
                      <TableCell className="font-medium">{record.employee_id}</TableCell>
                      <TableCell>{record.employee_name || '--'}</TableCell>
                      <TableCell>{getStatusBadge(record.attendance_status)}</TableCell>
                      <TableCell>{formatTime(record.check_in_time)}</TableCell>
                      <TableCell>{formatTime(record.check_out_time)}</TableCell>
                      <TableCell>{calculateWorkingHours(record.check_in_time, record.check_out_time)}</TableCell>
                      <TableCell>
                        {record.overtime_hours > 0 ? `${record.overtime_hours}h` : '--'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.remarks || '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
