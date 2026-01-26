import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { IncidentTask } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assigneeId = searchParams.get("assigneeId")
    const reportId = searchParams.get("reportId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }
    if (assigneeId) {
      query.assignedToId = assigneeId
    }
    if (reportId) {
      query.reportId = reportId
    }

    const tasks = await IncidentTask.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean()

    const total = await IncidentTask.countDocuments(query)

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const task = new IncidentTask(body)
    await task.save()

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
