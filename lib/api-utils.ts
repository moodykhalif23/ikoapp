import { NextResponse } from 'next/server'
import { Report } from '@/lib/models'

export async function getReportById(reportId: string) {
  const report = await Report.findOne({ id: reportId })
  if (!report) {
    return { error: NextResponse.json({ error: 'Report not found' }, { status: 404 }) }
  }
  return { report }
}

export function handleApiError(error: any, message: string) {
  console.error(message, error)
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}