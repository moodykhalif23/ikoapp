import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Attendance, Employee } from '@/lib/models'

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const query: any = {}
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      query.date = { $gte: start, $lt: end }
    }

    const records = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Create attendance record
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { employeeId, date, shiftType, signInTime, signOutTime, createdBy } = body

    if (!employeeId || !date || !shiftType || !signInTime) {
      return NextResponse.json(
        { error: 'Employee, date, shift type, and sign-in time are required' },
        { status: 400 }
      )
    }

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const record = new Attendance({
      employeeId,
      employeeName: employee.name,
      date: new Date(date),
      shiftType,
      signInTime,
      signOutTime: signOutTime || undefined,
      createdBy
    })

    await record.save()

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}
