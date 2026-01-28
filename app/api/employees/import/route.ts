import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Employee } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    console.log('Employee import API called');

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    console.log('File received:', file.name, file.size, 'bytes');

    // Read CSV content
    const csvText = await file.text()
    console.log('CSV content length:', csvText.length);
    
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('CSV lines:', lines.length);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, '')
    const rawHeaders = lines[0].split(',').map(h => h.trim())
    const headers = rawHeaders.map(normalizeHeader)
    
    console.log('Headers found:', headers);

    // Validate headers (name, employee id, phone required)
    if (!headers.includes('name') || !headers.includes('employeeid') || !headers.includes('phone')) {
      return NextResponse.json(
        { error: 'CSV must contain "Name", "Employee ID", and "Phone" columns' },
        { status: 400 }
      )
    }

    const employees = []
    const errors = []
    const existingEmployeeIds = new Set()

    // Check for existing employee IDs
    const existingEmployees = await Employee.find({}, 'employeeId').lean()
    existingEmployees.forEach(emp => existingEmployeeIds.add(emp.employeeId))

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
            case 'employeeid':
              employeeData.employeeId = value
              break
            case 'phone':
              employeeData.phone = value
              break
          }
        }
      })

      // Validate required fields
      if (!employeeData.name || !employeeData.employeeId || !employeeData.phone) {
        errors.push(`Row ${i + 1}: Missing required fields (name, employee id, or phone)`)
        continue
      }

      // Check for duplicate employee IDs
      if (existingEmployeeIds.has(employeeData.employeeId)) {
        errors.push(`Row ${i + 1}: Employee ID "${employeeData.employeeId}" already exists`)
        continue
      }

      // Set defaults
      employeeData.status = 'active'

      employees.push(employeeData)
      existingEmployeeIds.add(employeeData.employeeId)
    }

    console.log('Employees to import:', employees.length);
    console.log('Errors found:', errors.length);

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
    const insertedEmployees = await Employee.insertMany(employees)
    console.log('Employees inserted:', insertedEmployees.length);

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
