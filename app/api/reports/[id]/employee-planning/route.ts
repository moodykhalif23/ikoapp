import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report, EmployeePlanning } from '@/lib/models'
import { getReportById, handleApiError } from '@/lib/api-utils'

// GET /api/reports/[id]/employee-planning - Get employee planning data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (!report.employeePlanningId) {
      return NextResponse.json({ message: 'No employee planning data found' })
    }

    const employeePlanning = await EmployeePlanning.findById(report.employeePlanningId)
    return NextResponse.json(employeePlanning)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch employee planning data')
  }
}

// POST /api/reports/[id]/employee-planning - Create/update employee planning data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    const body = await request.json()

    // If employee planning already exists, update it
    if (report.employeePlanningId) {
      const updatedEmployeePlanning = await EmployeePlanning.findByIdAndUpdate(
        report.employeePlanningId,
        body,
        { new: true, runValidators: true }
      )
      return NextResponse.json(updatedEmployeePlanning)
    }

    // Create new employee planning
    const employeePlanning = new EmployeePlanning({
      ...body,
      reportId: report._id
    })

    await employeePlanning.save()

    // Update report with the new employee planning ID
    report.employeePlanningId = employeePlanning._id
    await report.save()

    return NextResponse.json(employeePlanning, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Failed to save employee planning data')
  }
}

// DELETE /api/reports/[id]/employee-planning - Delete employee planning data
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { report, error } = await getReportById(params.id)
    if (error) return error

    if (report.employeePlanningId) {
      await EmployeePlanning.findByIdAndDelete(report.employeePlanningId)
      report.employeePlanningId = undefined
      await report.save()
    }

    return NextResponse.json({ message: 'Employee planning data deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'Failed to delete employee planning data')
  }
}