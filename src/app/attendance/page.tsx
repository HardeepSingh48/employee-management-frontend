'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/layout/Logo';
import { CalendarDays, Clock, Users, TrendingUp, UserCheck, FileSpreadsheet } from 'lucide-react';

// Import attendance components
import MarkAttendance from '@/components/attendance/MarkAttendance';
import BulkAttendance from '@/components/attendance/BulkAttendance';
import AttendanceReports from '@/components/attendance/AttendanceReports';
import TodayAttendance from '@/components/attendance/TodayAttendance';
import MonthlyView from '@/components/attendance/MonthlyView';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('today');
  const [currentDate, setCurrentDate] = useState('');

  // Set current date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo width={40} height={40} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
            <p className="text-muted-foreground">
              Manage employee attendance, track working hours, and generate reports
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="w-4 h-4 mr-1" />
          {currentDate || 'Loading...'}
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Present</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-xs text-muted-foreground">employees present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Absent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">--</div>
            <p className="text-xs text-muted-foreground">employees absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">--</div>
            <p className="text-xs text-muted-foreground">late today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--%</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value="mark" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Mark
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Bulk
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                View and manage attendance for {currentDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayAttendance />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mark" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Mark attendance for individual employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkAttendance />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Attendance</CardTitle>
              <CardDescription>
                Mark attendance for multiple employees at once or import from Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkAttendance />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly View</CardTitle>
              <CardDescription>
                View monthly attendance summary and calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>
                Generate and export attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceReports />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
              <CardDescription>
                Configure working hours, holidays, and attendance policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Attendance settings will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
