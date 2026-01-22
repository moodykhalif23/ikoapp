import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const { id } = params
    const body = await request.json()
    const { name, email, phone, employeeId, department, employeeType, roles, hireDate, status } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists (excluding current employee)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id }
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if employeeId already exists (excluding current employee)
    if (employeeId) {
      const existingEmployee = await User.findOne({ 
        employeeId,
        _id: { $ne: id }
      })
      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      id,
      {
        name,
        email: email.toLowerCase(),
        phone,
        employeeId,
        department,
        employeeType,
        roles,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        status
      },
      { new: true, select: '-password' }
    )

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const { id } = params

    const deletedEmployee = await User.findByIdAndDelete(id)

    if (!deletedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}