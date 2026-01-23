import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Machine } from '@/lib/models'

// GET /api/machines - Get machines (active by default, all if ?all=true)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const all = request.nextUrl.searchParams.get('all') === 'true'
    const query = all ? {} : { status: 'active' }
    const machines = await Machine.find(query).sort({ name: 1 })

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Error fetching machines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    )
  }
}

// POST /api/machines - Create machine
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { name, type, status } = await request.json()
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const existing = await Machine.findOne({ name: name.trim() })
    if (existing) {
      return NextResponse.json(
        { error: 'Machine with this name already exists' },
        { status: 409 }
      )
    }

    const machine = new Machine({
      name: name.trim(),
      type: type.trim(),
      status: status || 'active'
    })

    await machine.save()

    return NextResponse.json({ success: true, data: machine }, { status: 201 })
  } catch (error) {
    console.error('Error creating machine:', error)
    return NextResponse.json(
      { error: 'Failed to create machine' },
      { status: 500 }
    )
  }
}
