import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Attendance } from '@/lib/models'

// PUT /api/attendance/[id] - Update attendance record
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await context.params
    const body = await request.json()

    const updates: any = {
      shiftType: body.shiftType,
      signInTime: body.signInTime,
      signOutTime: body.signOutTime || undefined,
      date: body.date ? new Date(body.date) : undefined
    }

    const updated = await Attendance.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    )
  }
}
