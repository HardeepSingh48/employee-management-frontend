'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, RefreshCw, Clock, UserCheck, UserX, AlertCircle, Filter } from 'lucide-react';
import { attendanceService } from '@/lib/attendance-service';
import { sitesService, type Site } from '@/lib/sites-service';
import type { Attendance } from '@/types/attendance';

export default function TodayAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  const loadTodayAttendance = async () => {
    setIsLoading(true);
    try {
      let data: Attendance[];

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // If a specific site is selected, get site-specific attendance for today
      if (selectedSiteId && selectedSiteId !== 'all') {
        // For large sites, we need to fetch all pages or increase the limit
        let allData: Attendance[] = [];
        let page = 1;
        const perPage = 500; // Increase limit to get more records

        while (true) {
          const response = await attendanceService.getSiteAttendance(today, today, undefined, selectedSiteId, page, perPage);
          if (response && response.length > 0) {
            allData = allData.concat(response);
            if (response.length < perPage) break; // Last page
            page++;
          } else {
            break;
          }
        }
        data = allData;
      } else {
        // Get all attendance for today
        data = await attendanceService.getTodayAttendance();
      }

      // Sort records by employee_id in ascending order
      const sortedData = data.sort((a, b) => {
        // Convert both employee_ids to strings for consistent comparison
        const aId = a.employee_id ? String(a.employee_id) : '';
        const bId = b.employee_id ? String(b.employee_id) : '';

        if (aId && bId) {
          return aId.localeCompare(bId);
        }
        return 0;
      });

      setAttendanceRecords(sortedData);
      setFilteredRecords(sortedData);
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

  const loadSites = async () => {
    try {
      const response = await sitesService.getSites(1, 1000);
      setSites(response.data || []);
    } catch (error: any) {
      console.error('Failed to load sites:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load sites',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    loadSites();
    setCurrentDate(new Date().toLocaleDateString());
  }, [selectedSiteId]);

  // Filter records based on search term (site filtering is now done at API level)
  useEffect(() => {
    let filtered = attendanceRecords;

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(record => {
        // Search in employee_id - convert to string first to handle numeric IDs
        const employeeIdStr = record.employee_id ? String(record.employee_id).toLowerCase() : '';
        const employeeIdMatch = employeeIdStr.includes(searchLower);

        // Search in employee_name
        const employeeNameMatch = record.employee_name &&
          typeof record.employee_name === 'string' &&
          record.employee_name.toLowerCase().includes(searchLower);

        return employeeIdMatch || employeeNameMatch;
      });
    }

    setFilteredRecords(filtered);
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
    off: filteredRecords.filter(r => r.attendance_status === 'OFF').length,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.off}</p>
                <p className="text-xs text-muted-foreground">OFF</p>
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Site Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="site-filter" className="text-sm font-medium">Site:</Label>
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites
                  .filter(site => site.site_id && site.site_id.trim() !== '')
                  .map((site) => (
                    <SelectItem key={site.site_id} value={site.site_id}>
                      {site.site_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
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
            {selectedSiteId && selectedSiteId !== 'all' && (
              <span className="ml-2 text-blue-600">
                (Filtered by site: {sites.find(s => s.site_id === selectedSiteId)?.site_name})
              </span>
            )}
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
