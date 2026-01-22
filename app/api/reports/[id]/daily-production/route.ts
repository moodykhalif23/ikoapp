import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, DailyProduction } from '@/lib/models'
import { getReportById, handleApiError } from '@/lib/api-utils'

// GET /api/reports/[id]/daily-production
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const { report, error } = await getReportById(resolvedParams.id)
    if (error) return error

    if (!report.dailyProductionId) {
      return NextResponse.json({ message: 'No daily production data found' })
    }

    const dailyProduction = await DailyProduction.findById(report.dailyProductionId)
    return NextResponse.json(dailyProduction)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch daily production data')
  }
}

// POST /api/reports/[id]/daily-production - Create/update daily production data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const { report, error } = await getReportById(resolvedParams.id)
    if (error) return error

    const body = await request.json()

    // If daily production already exists, update it
    if (report.dailyProductionId) {
      const updatedDailyProduction = await DailyProduction.findByIdAndUpdate(
        report.dailyProductionId,
        body,
        { new: true, runValidators: true }
      )
      return NextResponse.json(updatedDailyProduction)
    }

    // Create new daily production
    const dailyProduction = new DailyProduction({
      ...body,
      reportId: report._id
    })

    await dailyProduction.save()

    // Update report with the new daily production ID
    report.dailyProductionId = dailyProduction._id
    await report.save()

    return NextResponse.json(dailyProduction, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to save daily production data')
  }
}

// DELETE /api/reports/[id]/daily-production - Delete daily production data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const { report, error } = await getReportById(resolvedParams.id)
    if (error) return error

    if (report.dailyProductionId) {
      await DailyProduction.findByIdAndDelete(report.dailyProductionId)
      report.dailyProductionId = undefined
      await report.save()
    }

    return NextResponse.json({ message: 'Daily production data deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'Failed to delete daily production data')
  }
}