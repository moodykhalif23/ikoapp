import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const users = await User.find({})
      .select('-__v') // Exclude version field
      .sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}