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
    let csvText = await file.text()
    console.log('CSV content length:', csvText.length);
    
    // Remove BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1)
    }
    
    // Normalize line endings (handle both CRLF and LF)
    csvText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('CSV lines after normalization:', lines.length);
    console.log('First few lines:', lines.slice(0, 3));

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, '')
    
    // Parse CSV line handling quoted values
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          // Handle escaped quotes ("")
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }
    
    const rawHeaders = parseCSVLine(lines[0])
    const headers = rawHeaders.map(normalizeHeader)
    
    console.log('Raw headers:', rawHeaders);
    console.log('Normalized headers:', headers);

    // Validate headers (name and employee id are required, phone is optional)
    const requiredHeaders = ['name', 'employeeid']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      console.log('Missing headers:', missingHeaders);
      console.log('Available headers:', headers);
      return NextResponse.json(
        { 
          error: 'CSV must contain "Name" and "Employee ID" columns',
          details: `Missing columns: ${missingHeaders.join(', ')}. Found columns: ${rawHeaders.join(', ')}`
        },
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
      const values = parseCSVLine(lines[i])

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Invalid number of columns (expected ${headers.length}, got ${values.length})`)
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

      // Validate required fields (only name and employeeId are required)
      if (!employeeData.name || !employeeData.employeeId) {
        errors.push(`Row ${i + 1}: Missing required fields (name or employee id)`)
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
