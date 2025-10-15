import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current month payroll data
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // In a real implementation, this would aggregate payroll data from the backend
    // For now, return placeholder data
    const total = 4520000; // ₹45.2L in paise - this would come from actual payroll calculations
    const growth = 8; // 8% growth - this would be calculated from historical data

    return NextResponse.json({
      success: true,
      total,
      growth,
      period: `${year}-${month.toString().padStart(2, '0')}`
    });
  } catch (error) {
    console.error('Error fetching monthly payroll:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch monthly payroll' },
      { status: 500 }
    );
  }
}