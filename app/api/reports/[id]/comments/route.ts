import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Report } from '@/lib/models'

// Get comments for a report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const report = await Report.findOne({ id: resolvedParams.id }).select('comments')

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ comments: report.comments || [] })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/reports/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { author, role, text, timestamp } = body

    if (!author || !role || !text) {
      return NextResponse.json(
        { error: 'Author, role, and text are required' },
        { status: 400 }
      )
    }

    const resolvedParams = await params
    const report = await Report.findOne({ id: resolvedParams.id })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const comment = {
      id: `${Date.now()}`,
      author,
      role,
      text,
      timestamp: timestamp || new Date().toLocaleTimeString()
    }

    report.comments = Array.isArray(report.comments) ? report.comments : []
    report.comments.push(comment)
    await report.save()

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
