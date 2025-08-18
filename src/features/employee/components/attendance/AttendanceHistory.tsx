'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';

interface AttendanceRecord {
  attendance_id: string;
  attendance_date: string;
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours_worked: number;
  overtime_hours: number;
  late_minutes: number;
  is_holiday: boolean;
  is_weekend: boolean;
  remarks: string | null;
  marked_by: string;
}

interface AttendanceHistoryData {
  records: AttendanceRecord[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export default function AttendanceHistory() {
  const [data, setData] = useState<AttendanceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendanceHistory();
  }, [currentPage, selectedMonth, selectedYear]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '15',
        month: selectedMonth.toString(),
        year: selectedYear.toString()
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employee/attendance/history?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Half Day': return 'bg-blue-100 text-blue-800';
      case 'Holiday': return 'bg-purple-100 text-purple-800';
      case 'Leave': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Attendance History
        </CardTitle>
        <CardDescription>
          View your attendance records and history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Month:</label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => {
                setSelectedMonth(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Year:</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => {
                setSelectedYear(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading attendance history...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No attendance records found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.records.map((record) => (
                      <TableRow key={record.attendance_id}>
                        <TableCell className="font-medium">
                          {formatDate(record.attendance_date)}
                          {record.is_weekend && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Weekend
                            </Badge>
                          )}
                          {record.is_holiday && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Holiday
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.attendance_status)}>
                            {record.attendance_status}
                          </Badge>
                          {record.late_minutes > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              Late by {record.late_minutes} min
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(record.check_in_time)}</TableCell>
                        <TableCell>{formatTime(record.check_out_time)}</TableCell>
                        <TableCell>
                          {record.total_hours_worked ? `${record.total_hours_worked}h` : '-'}
                        </TableCell>
                        <TableCell>
                          {record.overtime_hours > 0 ? `${record.overtime_hours}h` : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.remarks || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((data.pagination.page - 1) * data.pagination.per_page) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.per_page, data.pagination.total)} of{' '}
                  {data.pagination.total} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!data.pagination.has_prev}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {data.pagination.page} of {data.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!data.pagination.has_next}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
