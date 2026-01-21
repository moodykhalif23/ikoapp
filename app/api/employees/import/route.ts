import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read CSV content
    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const expectedHeaders = ['name', 'email', 'role', 'employeetype', 'employeeid', 'department', 'phone', 'hiredate']

    // Validate headers (at least name and email are required)
    if (!headers.includes('name') || !headers.includes('email')) {
      return NextResponse.json(
        { error: 'CSV must contain at least "name" and "email" columns' },
        { status: 400 }
      )
    }

    const employees = []
    const errors = []
    const existingEmails = new Set()

    // Check for existing emails
    const existingUsers = await User.find({}, 'email').lean()
    existingUsers.forEach(user => existingEmails.add(user.email.toLowerCase()))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Invalid number of columns`)
        continue
      }

      const employeeData: any = {}

      headers.forEach((header, index) => {
        const value = values[index]
        if (value) {
          switch (header) {
            case 'name':
              employeeData.name = value
              break
            case 'email':
              employeeData.email = value.toLowerCase()
              break
            case 'role':
              employeeData.role = ['admin', 'reporter', 'viewer'].includes(value.toLowerCase())
                ? value.toLowerCase()
                : 'viewer'
              break
            case 'employeetype':
              employeeData.employeeType = ['permanent', 'casual'].includes(value.toLowerCase())
                ? value.toLowerCase()
                : 'permanent'
              break
            case 'employeeid':
              employeeData.employeeId = value
              break
            case 'department':
              employeeData.department = value
              break
            case 'phone':
              employeeData.phone = value
              break
            case 'hiredate':
              if (value) {
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                  employeeData.hireDate = date
                }
              }
              break
          }
        }
      })

      // Validate required fields
      if (!employeeData.name || !employeeData.email) {
        errors.push(`Row ${i + 1}: Missing required fields (name or email)`)
        continue
      }

      // Check for duplicate emails
      if (existingEmails.has(employeeData.email)) {
        errors.push(`Row ${i + 1}: Email "${employeeData.email}" already exists`)
        continue
      }

      // Set defaults
      employeeData.employeeType = employeeData.employeeType || 'permanent'
      employeeData.role = employeeData.role || 'viewer'
      employeeData.status = 'active'

      employees.push(employeeData)
      existingEmails.add(employeeData.email)
    }

    if (employees.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid employees to import',
          details: errors
        },
        { status: 400 }
      )
    }

    // Insert employees
    const insertedEmployees = await User.insertMany(employees)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedEmployees.length} employees`,
      data: {
        imported: insertedEmployees.length,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('Error importing employees:', error)
    return NextResponse.json(
      { error: 'Failed to import employees' },
      { status: 500 }
    )
  }
}