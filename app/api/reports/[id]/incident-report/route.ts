import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, IncidentReport } from '@/lib/models'
import { getReportById, handleApiError } from '@/lib/api-utils'

// GET /api/reports/[id]/incident-report - Get incident report data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (!report.incidentReportId) {
      return NextResponse.json({ message: 'No incident report data found' })
    }

    const incidentReport = await IncidentReport.findById(report.incidentReportId)
    return NextResponse.json(incidentReport)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch incident report data')
  }
}

// POST /api/reports/[id]/incident-report - Create/update incident report data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    const body = await request.json()

    // If incident report already exists, update it
    if (report.incidentReportId) {
      const updatedIncidentReport = await IncidentReport.findByIdAndUpdate(
        report.incidentReportId,
        body,
        { new: true, runValidators: true }
      )
      return NextResponse.json(updatedIncidentReport)
    }

    // Create new incident report
    const incidentReport = new IncidentReport({
      ...body,
      reportId: report._id
    })

    await incidentReport.save()

    // Update report with the new incident report ID
    report.incidentReportId = incidentReport._id
    await report.save()

    return NextResponse.json(incidentReport, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to save incident report data')
  }
}

// DELETE /api/reports/[id]/incident-report - Delete incident report data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (report.incidentReportId) {
      await IncidentReport.findByIdAndDelete(report.incidentReportId)
      report.incidentReportId = undefined
      await report.save()
    }

    return NextResponse.json({ message: 'Incident report data deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'Failed to delete incident report data')
  }
}