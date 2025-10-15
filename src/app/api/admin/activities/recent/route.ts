import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, this would query an activity log table
    // For now, return placeholder data that represents recent system activities
    // This could be populated from audit logs, employee registrations, attendance records, etc.

    const activities = [
      {
        id: '1',
        type: 'employee_registered',
        description: 'New employee registered',
        user: 'John Doe - EMP001',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      },
      {
        id: '2',
        type: 'attendance_marked',
        description: 'Attendance marked',
        user: 'Bulk attendance for 50 employees',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      },
      {
        id: '3',
        type: 'salary_code_created',
        description: 'Salary code created',
        user: 'MUMBAI-SUPERVISOR-MH',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ];

    return NextResponse.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}