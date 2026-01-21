import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { EmployeeTimeEntry } from '@/lib/models'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { notes } = body

    // Find and update the active time entry
    const timeEntry = await EmployeeTimeEntry.findOneAndUpdate(
      {
        _id: params.id,
        status: 'active'
      },
      {
        clockOutTime: new Date(),
        status: 'completed',
        notes: notes ? notes : undefined
      },
      {
        new: true,
        runValidators: true
      }
    )

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Active time entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Clocked out successfully',
      data: timeEntry
    })

  } catch (error) {
    console.error('Error clocking out:', error)
    return NextResponse.json(
      { error: 'Failed to clock out' },
      { status: 500 }
    )
  }
}