'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/auth-slice';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileSpreadsheet,
  DollarSign
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Sidebar } from '@/components/layout/Sidebar';
import MarkAttendance from '@/components/attendance/MarkAttendance';
import BulkAttendance from '@/components/attendance/BulkAttendance';
import AttendanceRecords from '@/features/supervisor/components/attendance/AttendanceRecords';
import SiteSalaryReport from '@/features/supervisor/components/salary/SiteSalaryReport';
import DeductionsPage from '@/app/dashboard/deductions/page';

interface DashboardStats {
  site_employees_count: number;
  today_attendance_count: number;
  pending_attendance_count: number;
  monthly_stats: {
    month: number;
    year: number;
    working_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    attendance_percentage: number;
  };
}

function SupervisorDashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'supervisor') {
      router.push('/');
      return;
    }

    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['dashboard', 'individual', 'bulk', 'records', 'salary', 'deductions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    fetchDashboardStats();
  }, [isAuthenticated, user, router, searchParams]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/employees/site_employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        // Calculate basic stats from employee data
        const siteEmployeesCount = result.data.length;
        setStats({
          site_employees_count: siteEmployeesCount,
          today_attendance_count: 0, // This would come from attendance API
          pending_attendance_count: 0, // This would come from attendance API
          monthly_stats: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            working_days: 22, // Default value
            present_days: 0,
            absent_days: 0,
            late_days: 0,
            attendance_percentage: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={activeTab} onItemClick={setActiveTab} userRole="supervisor" />
      
      <div className="ml-16">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo width={40} height={40} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Supervisor'}!
                </h1>
                <p className="text-gray-600">
                  Site: {user?.site_id || 'Not assigned'} • {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                SUPERVISOR
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="individual">Mark Attendance</TabsTrigger>
          {/* <TabsTrigger value="bulk">Bulk Attendance</TabsTrigger> */}
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="salary">Salary Report</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Site Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Site Employees</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.site_employees_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total employees at your site
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.today_attendance_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Marked today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats?.pending_attendance_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Not marked today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Site ID</CardTitle>
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user?.site_id || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your assigned site
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setActiveTab('individual')}
                        className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                      >
                        <div className="text-lg font-semibold text-blue-600">Mark Individual</div>
                        <div className="text-sm text-blue-700">Single employee</div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('bulk')}
                        className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                      >
                        <div className="text-lg font-semibold text-green-600">Bulk Upload</div>
                        <div className="text-sm text-green-700">Excel file</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 text-gray-500">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start marking attendance to see activity here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="individual">
              <MarkAttendance />
            </TabsContent>

                          <TabsContent value="bulk">
                <BulkAttendance />
              </TabsContent>
              
              <TabsContent value="records">
                <AttendanceRecords />
              </TabsContent>
              
              <TabsContent value="salary">
                <SiteSalaryReport />
              </TabsContent>
              
              <TabsContent value="deductions">
                <DeductionsPage />
              </TabsContent>
            </Tabs>
          </div>
      </div>
    </div>
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SupervisorDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SupervisorDashboardContent />
    </Suspense>
  );
}
