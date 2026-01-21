import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, PowerInterruption, SiteVisual, DailyProduction, IncidentReport, EmployeePlanning } from '@/lib/models'

// GET /api/reports/[id] - Get a specific report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const report = await Report.findOne({ id: params.id })
      .populate('powerInterruptionId')
      .populate('siteVisualId')
      .populate('dailyProductionId')
      .populate('incidentReportId')
      .populate('employeePlanningId')

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - Update a report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { status, reviewedBy, approvedBy, ...updateData } = body

    const report = await Report.findOne({ id: params.id })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Update status-related fields
    if (status) {
      report.status = status

      if (status === 'submitted' && !report.submittedAt) {
        report.submittedAt = new Date()
      } else if (status === 'reviewed' && reviewedBy) {
        report.reviewedAt = new Date()
        report.reviewedBy = reviewedBy
      } else if (status === 'approved' && approvedBy) {
        report.approvedAt = new Date()
        report.approvedBy = approvedBy
      }
    }

    // Update other fields
    Object.assign(report, updateData)

    await report.save()

    // Populate the updated report
    const updatedReport = await Report.findById(report._id)
      .populate('powerInterruptionId')
      .populate('siteVisualId')
      .populate('dailyProductionId')
      .populate('incidentReportId')
      .populate('employeePlanningId')

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Delete a report
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

    // Delete associated data
    if (report.powerInterruptionId) {
      await PowerInterruption.findByIdAndDelete(report.powerInterruptionId)
    }
    if (report.siteVisualId) {
      await SiteVisual.findByIdAndDelete(report.siteVisualId)
    }
    if (report.dailyProductionId) {
      await DailyProduction.findByIdAndDelete(report.dailyProductionId)
    }
    if (report.incidentReportId) {
      await IncidentReport.findByIdAndDelete(report.incidentReportId)
    }
    if (report.employeePlanningId) {
      await EmployeePlanning.findByIdAndDelete(report.employeePlanningId)
    }

    // Delete the main report
    await Report.findByIdAndDelete(report._id)

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}