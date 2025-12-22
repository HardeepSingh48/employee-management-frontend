import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Normalize backend URL to include '/api' exactly once
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendUrl = rawBackendUrl.endsWith('/api') ? rawBackendUrl : `${rawBackendUrl}/api`;
    const response = await fetch(`${backendUrl}/attendance/today`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch today attendance');
    }

    const attendanceRecords = data.data || [];
    const present = attendanceRecords.filter((att: any) => att.attendance_status === 'Present').length;
    const absent = attendanceRecords.filter((att: any) => att.attendance_status === 'Absent').length;

    return NextResponse.json({
      success: true,
      present,
      absent,
      total: attendanceRecords.length
    });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch today attendance' },
      { status: 500 }
    );
  }
}