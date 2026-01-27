import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { IncidentTask, User } from "@/lib/models"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const task = await IncidentTask.findById(resolvedParams.id).lean()

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const body = await request.json()
    const updates = { ...body }
    const comment = body?.comment
    delete updates.comment

    if (updates.assignedToId && !updates.assignedToName) {
      const assignee = await User.findById(updates.assignedToId).select("name email").lean()
      if (assignee) {
        updates.assignedToName = assignee.name
        updates.assignedToEmail = assignee.email
      }
    }

    const updateOps: Record<string, any> = {}
    if (Object.keys(updates).length > 0) {
      updateOps.$set = updates
    }
    if (comment) {
      const normalized = {
        id: comment.id || `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: comment.author || "Unknown",
        role: comment.role || "user",
        text: comment.text || "",
        timestamp: comment.timestamp || new Date().toISOString()
      }
      updateOps.$push = { comments: normalized }
    }

    const task = await IncidentTask.findByIdAndUpdate(resolvedParams.id, updateOps, {
      new: true
    }).lean()

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
