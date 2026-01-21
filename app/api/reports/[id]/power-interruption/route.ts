import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, PowerInterruption } from '@/lib/models'

// GET /api/reports/[id]/power-interruption - Get power interruption data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const report = await Report.findOne({ id: params.id })
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    if (!report.powerInterruptionId) {
      return NextResponse.json({ message: 'No power interruption data found' })
    }

    const powerInterruption = await PowerInterruption.findById(report.powerInterruptionId)
    return NextResponse.json(powerInterruption)
  } catch (error) {
    console.error('Error fetching power interruption:', error)
    return NextResponse.json(
      { error: 'Failed to fetch power interruption data' },
      { status: 500 }
    )
  }
}

// POST /api/reports/[id]/power-interruption - Create/update power interruption data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const report = await Report.findOne({ id: params.id })
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // If power interruption already exists, update it
    if (report.powerInterruptionId) {
      const updatedPowerInterruption = await PowerInterruption.findByIdAndUpdate(
        report.powerInterruptionId,
        body,
        { new: true, runValidators: true }
      )
      return NextResponse.json(updatedPowerInterruption)
    }

    // Create new power interruption
    const powerInterruption = new PowerInterruption({
      ...body,
      reportId: report._id
    })

    await powerInterruption.save()

    // Update report with the new power interruption ID
    report.powerInterruptionId = powerInterruption._id
    await report.save()

    return NextResponse.json(powerInterruption, { status: 201 })
  } catch (error) {
    console.error('Error saving power interruption:', error)
    return NextResponse.json(
      { error: 'Failed to save power interruption data' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id]/power-interruption - Delete power interruption data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const report = await Report.findOne({ id: params.id })
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    if (report.powerInterruptionId) {
      await PowerInterruption.findByIdAndDelete(report.powerInterruptionId)
      report.powerInterruptionId = undefined
      await report.save()
    }

    return NextResponse.json({ message: 'Power interruption data deleted successfully' })
  } catch (error) {
    console.error('Error deleting power interruption:', error)
    return NextResponse.json(
      { error: 'Failed to delete power interruption data' },
      { status: 500 }
    )
  }
}