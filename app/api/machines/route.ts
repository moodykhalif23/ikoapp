import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Machine } from '@/lib/models'

// GET /api/machines - Get all active machines
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const machines = await Machine.find({ status: 'active' }).sort({ name: 1 })

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Error fetching machines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    )
  }
}