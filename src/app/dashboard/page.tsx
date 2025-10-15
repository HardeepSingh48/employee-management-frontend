'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/auth-slice';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Logo } from '@/components/layout/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Building2,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

// Types for dashboard data
interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  monthlyPayroll: number;
  activeDepartments: number;
  salaryCodes: number;
  systemUptime: string;
  employeeGrowth: number;
  payrollGrowth: number;
}

interface ActivityItem {
  id: string;
  type: 'employee_registered' | 'attendance_marked' | 'salary_code_created';
  description: string;
  timestamp: string;
  user?: string;
}

interface DashboardData {
  stats: DashboardStats;
  activities: ActivityItem[];
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
      return;
    }

    try {
      setError(null);
      const [employeesRes, attendanceRes, payrollRes, activitiesRes, departmentsRes, salaryCodesRes] = await Promise.all([
        fetch('/api/admin/employees/count').then(r => r.json()),
        fetch('/api/admin/attendance/today').then(r => r.json()),
        fetch('/api/admin/payroll/monthly').then(r => r.json()),
        fetch('/api/admin/activities/recent').then(r => r.json()),
        fetch('/api/admin/departments/count').then(r => r.json()),
        fetch('/api/admin/salary-codes/count').then(r => r.json())
      ]);

      const stats: DashboardStats = {
        totalEmployees: employeesRes.count || 0,
        presentToday: attendanceRes.present || 0,
        absentToday: attendanceRes.absent || 0,
        monthlyPayroll: payrollRes.total || 0,
        activeDepartments: departmentsRes.count || 0,
        salaryCodes: salaryCodesRes.count || 0,
        systemUptime: '98.5%', // Could be fetched from monitoring service
        employeeGrowth: employeesRes.growth || 0,
        payrollGrowth: payrollRes.growth || 0
      };

      const activities: ActivityItem[] = activitiesRes.activities || [];

      setDashboardData({
        stats,
        activities,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    }
  }, [isAuthenticated, user]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.push('/employee/dashboard');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, router, fetchDashboardData]);

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} userRole={user?.role} />

        <div className="ml-16">
          {/* Header Skeleton */}
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          <div className="p-6">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions and Recent Activity Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* System Status Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} userRole={user?.role} />

        <div className="ml-16">
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo width={40} height={40} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {user?.name}!</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  {user?.role?.toUpperCase()}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} userRole={user?.role} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <Logo width={32} height={32} className="sm:w-10 sm:h-10" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 truncate">
                  Welcome back, {user?.name}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
                {user?.role?.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Last updated info */}
          {dashboardData?.lastUpdated && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {dashboardData?.stats.totalEmployees.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(dashboardData?.stats.employeeGrowth ?? 0) >= 0 ? '+' : ''}{(dashboardData?.stats.employeeGrowth ?? 0)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {dashboardData?.stats.presentToday.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats.totalEmployees ?
                    `${((dashboardData.stats.presentToday / dashboardData.stats.totalEmployees) * 100).toFixed(1)}% attendance rate` :
                    '0% attendance rate'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {dashboardData?.stats.absentToday.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats.totalEmployees ?
                    `${((dashboardData.stats.absentToday / dashboardData.stats.totalEmployees) * 100).toFixed(1)}% absence rate` :
                    '0% absence rate'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  ₹{(dashboardData?.stats.monthlyPayroll || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(dashboardData?.stats.payrollGrowth ?? 0) >= 0 ? '+' : ''}{(dashboardData?.stats.payrollGrowth ?? 0)}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left transition-all duration-200 hover:bg-blue-50 hover:border-blue-200"
                  variant="outline"
                  onClick={() => router.push('/employees/register')}
                >
                  <Users className="mr-3 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Register New Employee</div>
                    <div className="text-xs text-muted-foreground">Add employee to the system</div>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left transition-all duration-200 hover:bg-green-50 hover:border-green-200"
                  variant="outline"
                  onClick={() => router.push('/attendance')}
                >
                  <Calendar className="mr-3 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Mark Attendance</div>
                    <div className="text-xs text-muted-foreground">Record daily attendance</div>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left transition-all duration-200 hover:bg-purple-50 hover:border-purple-200"
                  variant="outline"
                  onClick={() => router.push('/salary-codes/create')}
                >
                  <DollarSign className="mr-3 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Generate Salary Codes</div>
                    <div className="text-xs text-muted-foreground">Create new salary codes</div>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left transition-all duration-200 hover:bg-orange-50 hover:border-orange-200"
                  variant="outline"
                  onClick={() => router.push('/salary')}
                >
                  <TrendingUp className="mr-3 h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Calculate Salary</div>
                    <div className="text-xs text-muted-foreground">Process payroll calculations</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {dashboardData?.activities && dashboardData.activities.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-3 sm:space-y-4">
                    {dashboardData.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                          activity.type === 'employee_registered' ? 'bg-green-500' :
                          activity.type === 'attendance_marked' ? 'bg-blue-500' :
                          activity.type === 'salary_code_created' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.description}</p>
                          {activity.user && (
                            <p className="text-xs text-gray-500 truncate">by {activity.user}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex-shrink-0">
                          {(() => {
                            const now = new Date();
                            const activityTime = new Date(activity.timestamp);
                            const diffMs = now.getTime() - activityTime.getTime();
                            const diffMins = Math.floor(diffMs / (1000 * 60));
                            const diffHours = Math.floor(diffMins / 60);
                            const diffDays = Math.floor(diffHours / 24);

                            if (diffMins < 1) return 'Just now';
                            if (diffMins < 60) return `${diffMins}m ago`;
                            if (diffHours < 24) return `${diffHours}h ago`;
                            return `${diffDays}d ago`;
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                    <p className="text-xs">Activities will appear here as they occur</p>
                  </div>
                )}
              </CardContent>
            </Card> */}
          </div>

          {/* System Status */}
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>Current system status and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                    {dashboardData?.stats.activeDepartments || 0}
                  </div>
                  <p className="text-sm text-gray-600">Active Departments</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                    {dashboardData?.stats.salaryCodes || 0}
                  </div>
                  <p className="text-sm text-gray-600">Salary Codes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 sm:col-span-2 lg:col-span-1">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                    {dashboardData?.stats.systemUptime || '98.5%'}
                  </div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}