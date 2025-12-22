import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Normalize backend URL to include '/api' exactly once
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendUrl = rawBackendUrl.endsWith('/api') ? rawBackendUrl : `${rawBackendUrl}/api`;
    const response = await fetch(`${backendUrl}/departments`, {
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
      throw new Error(data.message || 'Failed to fetch departments');
    }

    const count = data.data ? data.data.length : 0;

    return NextResponse.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching department count:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch department count' },
      { status: 500 }
    );
  }
}