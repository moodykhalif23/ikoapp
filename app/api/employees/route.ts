import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Employee } from '@/lib/models'

// GET - Fetch all employees
export async function GET() {
  try {
    await connectToDatabase()
    
    const employees = await Employee.find({}).sort({ createdAt: -1 })

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
    const { name, employeeId, phone, employeeType, hireDate } = body

    // Validate required fields
    if (!name || !employeeId) {
      return NextResponse.json(
        { error: 'Name and Employee ID are required' },
        { status: 400 }
      )
    }

    // Check if employeeId already exists
    const existingEmployee = await Employee.findOne({ employeeId })
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    const newEmployee = new Employee({
      name,
      employeeId,
      phone,
      employeeType: employeeType || 'permanent',
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      status: 'active'
    })

    await newEmployee.save()

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}