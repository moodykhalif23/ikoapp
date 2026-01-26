import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, PowerInterruption, SiteVisual, DailyProduction, IncidentReport } from '@/lib/models'
import { createReportNotification } from '@/lib/notification-utils'

// GET /api/reports - Get all reports with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const reportedByEmail = searchParams.get('reportedByEmail')
    const date = searchParams.get('date')
    const includeDrafts = searchParams.get('includeDrafts') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const query: any = {}

    if (status) {
      query.status = status
    } else if (!reportedByEmail && !includeDrafts) {
      query.status = { $ne: 'draft' }
    }
    if (reportedByEmail) query.reportedByEmail = reportedByEmail
    if (date) query.date = date

    const reports = await Report.find(query)
      .populate('powerInterruptionId')
      .populate('siteVisualId')
      .populate('dailyProductionId')
      .populate('incidentReportId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)

    const total = await Report.countDocuments(query)

    return NextResponse.json({
      reports,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const {
      id,
      date,
      reportedBy,
      reportedByEmail,
      powerInterruptions,
      dailyProduction,
      incidentReport,
      attendance,
      siteVisuals,
      status
    } = body

    let reportId = id
    if (!reportId) {
      let counter = 0
      do {
        reportId = `RPT-${Date.now()}${counter > 0 ? `-${counter}` : ''}`
        counter++
      } while (await Report.findOne({ id: reportId }))
    }

    // Create the main report
    const report = new Report({
      id: reportId,
      date,
      reportedBy,
      reportedByEmail,
      status: status || 'draft',
      powerInterruptions,
      dailyProduction,
      incidentReport,
      attendance,
      siteVisuals
    })

    if (status === 'submitted') {
      report.submittedAt = new Date()
    }

    await report.save()

    if (status === 'submitted') {
      try {
        await createReportNotification(
          report.id,
          report.reportedBy,
          'Daily Report'
        )
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError)
      }
    }

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
