import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, SiteVisual } from '@/lib/models'
import { getReportById, handleApiError } from '@/lib/api-utils'

// GET /api/reports/[id]/site-visuals - Get site visuals data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (!report.siteVisualId) {
      return NextResponse.json({ message: 'No site visuals data found' })
    }

    const siteVisual = await SiteVisual.findById(report.siteVisualId)
    return NextResponse.json(siteVisual)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch site visuals data')
  }
}

// POST /api/reports/[id]/site-visuals - Create/update site visuals data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    const body = await request.json()

    // If site visual already exists, update it
    if (report.siteVisualId) {
      const updatedSiteVisual = await SiteVisual.findByIdAndUpdate(
        report.siteVisualId,
        body,
        { new: true, runValidators: true }
      )
      return NextResponse.json(updatedSiteVisual)
    }

    // Create new site visual
    const siteVisual = new SiteVisual({
      ...body,
      reportId: report._id
    })

    await siteVisual.save()

    // Update report with the new site visual ID
    report.siteVisualId = siteVisual._id
    await report.save()

    return NextResponse.json(siteVisual, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to save site visuals data')
  }
}

// DELETE /api/reports/[id]/site-visuals - Delete site visuals data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (report.siteVisualId) {
      await SiteVisual.findByIdAndDelete(report.siteVisualId)
      report.siteVisualId = undefined
      await report.save()
    }

    return NextResponse.json({ message: 'Site visuals data deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'Failed to delete site visuals data')
  }
}