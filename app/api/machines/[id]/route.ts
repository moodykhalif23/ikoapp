import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Machine } from '@/lib/models'

interface Params {
  params: { id: string }
}

// PUT /api/machines/[id] - Update machine
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const { id } = params
    const { name, type, status } = await request.json()

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const updated = await Machine.findByIdAndUpdate(
      id,
      { name: name.trim(), type: type.trim(), status },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'Machine with this name already exists' },
        { status: 409 }
      )
    }
    console.error('Error updating machine:', error)
    return NextResponse.json(
      { error: 'Failed to update machine' },
      { status: 500 }
    )
  }
}

// DELETE /api/machines/[id] - Delete machine
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase()
    const { id } = params

    const deleted = await Machine.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting machine:', error)
    return NextResponse.json(
      { error: 'Failed to delete machine' },
      { status: 500 }
    )
  }
}
