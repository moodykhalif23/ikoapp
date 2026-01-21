import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import bcrypt from 'bcryptjs'

// POST /api/auth/signup - Register new user
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { name, email, password, role, employeeType, employeeId, department, phone, hireDate } = await request.json()

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

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roles: role ? [role] : [], // Convert single role to array or empty array
      employeeType: employeeType || 'permanent',
      employeeId: employeeId || undefined,
      department: department || undefined,
      phone: phone || undefined,
      hireDate: hireDate ? new Date(hireDate) : undefined
    })

    await user.save()

    // Return user data (excluding password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
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