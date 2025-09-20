'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/auth-slice';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  // Clock,
  CheckCircle,
  AlertTriangle,
  Building2
} from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarActive, setSidebarActive] = useState('Home');
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      router.push('/employee/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={sidebarActive} onItemClick={setSidebarActive} userRole={user?.role} />

      <div className="ml-16">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,180</div>
                <p className="text-xs text-muted-foreground">
                  95.6% attendance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">54</div>
                <p className="text-xs text-muted-foreground">
                  4.4% absence rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹45.2L</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/employees/register')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Register New Employee
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/attendance')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/salary-codes/create')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Generate Salary Codes
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/salary')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Calculate Salary
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New employee registered</p>
                    <p className="text-xs text-gray-500">John Doe - EMP001</p>
                  </div>
                  <p className="text-xs text-gray-500">2 min ago</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Attendance marked</p>
                    <p className="text-xs text-gray-500">Bulk attendance for 50 employees</p>
                  </div>
                  <p className="text-xs text-gray-500">15 min ago</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Salary code created</p>
                    <p className="text-xs text-gray-500">MUMBAI-SUPERVISOR-MH</p>
                  </div>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>Current system status and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <p className="text-sm text-gray-600">Active Departments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">25</div>
                  <p className="text-sm text-gray-600">Salary Codes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">98.5%</div>
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