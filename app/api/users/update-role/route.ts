import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// PUT /api/users/update-role - Update user roles
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()

    const { userId, roles } = await request.json()

    if (!userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: 'User ID and roles array are required' },
        { status: 400 }
      )
    }

    // Validate roles
    const validRoles = ['admin', 'reporter', 'viewer']
    const invalidRoles = roles.filter(role => !validRoles.includes(role))
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Invalid roles specified: ${invalidRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Update user roles
    const user = await User.findByIdAndUpdate(
      userId,
      { roles: roles },
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
      roles: user.roles,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      user: userData,
      message: 'Roles updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating user roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}