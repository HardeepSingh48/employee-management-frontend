'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/auth-slice';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Calendar,

  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Sidebar } from '@/components/layout/Sidebar';
import MarkAttendanceCard from '@/features/employee/components/attendance/MarkAttendanceCard';
import AttendanceHistory from '@/features/employee/components/attendance/AttendanceHistory';
import ProfileCard from '@/features/employee/components/profile/ProfileCard';
import SalaryCard from '@/features/employee/components/salary/SalaryCard';

interface DashboardStats {
  today_status: {
    date: string;
    marked: boolean;
    status: string | null;
    check_in: string | null;
    check_out: string | null;
  };
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

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, user, router]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/employee/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Half Day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'Present': return <CheckCircle className="w-4 h-4" />;
      case 'Absent': return <XCircle className="w-4 h-4" />;
      case 'Late': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
      <Sidebar activeItem={activeTab} onItemClick={setActiveTab} userRole="employee" />
      
      <div className="ml-16">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo width={40} height={40} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Employee'}!
                </h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
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
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="salary">Salary</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Today's Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                    {getStatusIcon(stats?.today_status.status ?? null)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.today_status.marked ? (
                        <Badge className={getStatusColor(stats.today_status.status)}>
                          {stats.today_status.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Marked</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.today_status.check_in && `In: ${stats.today_status.check_in}`}
                      {stats?.today_status.check_out && ` | Out: ${stats.today_status.check_out}`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.monthly_stats.present_days || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.monthly_stats.attendance_percentage.toFixed(1) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Working Days</CardTitle>
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.monthly_stats.working_days || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MarkAttendanceCard onAttendanceMarked={fetchDashboardStats} />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Monthly Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {stats?.monthly_stats.present_days || 0}
                        </div>
                        <div className="text-sm text-green-700">Present</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {stats?.monthly_stats.absent_days || 0}
                        </div>
                        <div className="text-sm text-red-700">Absent</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats?.monthly_stats.late_days || 0}
                      </div>
                      <div className="text-sm text-yellow-700">Late Days</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceHistory />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileCard />
            </TabsContent>

            <TabsContent value="salary">
              <SalaryCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
