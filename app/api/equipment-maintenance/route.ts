import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { EquipmentMaintenance, Machine } from '@/lib/models'

// Get all maintenance records
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const equipmentId = searchParams.get('equipmentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const query: any = {}
    if (status) query.status = status
    if (priority) query.priority = priority
    if (equipmentId) query.equipmentId = equipmentId

    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      EquipmentMaintenance.find(query)
        .populate('equipmentId')
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EquipmentMaintenance.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching maintenance records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records' },
      { status: 500 }
    )
  }
}

// Create new maintenance record
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const {
      equipmentId,
      equipmentName,
      maintenanceType,
      priority,
      scheduledDate,
      description,
      assignedTo,
      estimatedHours,
      notes,
      createdBy
    } = body

    // Verify equipment exists
    const equipment = await Machine.findById(equipmentId)
    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    const maintenanceRecord = new EquipmentMaintenance({
      equipmentId,
      equipmentName: equipmentName || equipment.name,
      maintenanceType,
      priority,
      scheduledDate: new Date(scheduledDate),
      description,
      assignedTo,
      estimatedHours,
      notes,
      createdBy
    })

    await maintenanceRecord.save()

    return NextResponse.json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenanceRecord
    })

  } catch (error) {
    console.error('Error creating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    )
  }
}