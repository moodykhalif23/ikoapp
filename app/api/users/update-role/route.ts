import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// PUT /api/users/update-role - Update user role
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'reporter', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return updated user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      user: userData,
      message: 'Role updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}