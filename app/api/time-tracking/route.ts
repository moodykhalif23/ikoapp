import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { EmployeeTimeEntry } from '@/lib/models'
import { getServerSession } from 'next-auth'

// Clock in endpoint
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { employeeId, employeeName, employeeEmail, shiftType, location, notes } = body

    // Check if employee already has an active session
    const activeEntry = await EmployeeTimeEntry.findOne({
      employeeId,
      status: 'active'
    })

    if (activeEntry) {
      return NextResponse.json(
        { error: 'Employee already has an active time entry' },
        { status: 400 }
      )
    }

    // Create new time entry
    const timeEntry = new EmployeeTimeEntry({
      employeeId,
      employeeName,
      employeeEmail,
      clockInTime: new Date(),
      shiftType: shiftType || 'morning',
      location,
      notes,
      status: 'active'
    })

    await timeEntry.save()

    return NextResponse.json({
      success: true,
      message: 'Clocked in successfully',
      data: timeEntry
    })

  } catch (error) {
    console.error('Error clocking in:', error)
    return NextResponse.json(
      { error: 'Failed to clock in' },
      { status: 500 }
    )
  }
}

// Get time entries
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const query: any = {}
    if (employeeId) query.employeeId = employeeId
    if (status) query.status = status

    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      EmployeeTimeEntry.find(query)
        .sort({ clockInTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmployeeTimeEntry.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}