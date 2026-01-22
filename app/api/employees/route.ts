import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import bcrypt from 'bcryptjs'

// GET - Fetch all employees
export async function GET() {
  try {
    await connectToDatabase()
    
    const employees = await User.find({}, {
      password: 0 // Exclude password from response
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: employees
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { name, email, phone, employeeId, department, employeeType, roles, hireDate } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId })
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    // Generate default password (can be changed later)
    const defaultPassword = 'employee123'
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    const newEmployee = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      employeeId,
      department,
      employeeType: employeeType || 'permanent',
      roles: roles || ['viewer'],
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      status: 'active'
    })

    await newEmployee.save()

    // Return employee without password
    const { password, ...employeeData } = newEmployee.toObject()

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: employeeData
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}