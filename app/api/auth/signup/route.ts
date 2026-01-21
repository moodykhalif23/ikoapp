import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// POST /api/auth/signup - Register new user
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user without a role initially (they'll select it after signup)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || undefined // Don't set a default role for new signups
    })

    await user.save()

    // Return user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      user: userData,
      message: 'Account created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error during signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}