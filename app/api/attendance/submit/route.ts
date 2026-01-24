import { NextRequest, NextResponse } from 'next/server'
import { createAttendanceNotification } from '@/lib/notification-utils'

// POST /api/attendance/submit - Notify admins/viewers that attendance was submitted
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attendanceDate, reporterName } = body

    if (!attendanceDate) {
      return NextResponse.json(
        { error: 'attendanceDate is required' },
        { status: 400 }
      )
    }

    await createAttendanceNotification(attendanceDate, reporterName || 'Reporter')

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error submitting attendance notification:', error)
    return NextResponse.json(
      { error: 'Failed to submit attendance notification' },
      { status: 500 }
    )
  }
}
