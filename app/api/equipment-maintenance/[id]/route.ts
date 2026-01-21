import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { EquipmentMaintenance } from '@/lib/models'

// Update maintenance record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const updates = { ...body }

    // Convert date strings to Date objects
    if (updates.scheduledDate) {
      updates.scheduledDate = new Date(updates.scheduledDate)
    }
    if (updates.completedDate) {
      updates.completedDate = new Date(updates.completedDate)
    }

    const maintenanceRecord = await EquipmentMaintenance.findByIdAndUpdate(
      params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate('equipmentId')

    if (!maintenanceRecord) {
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenanceRecord
    })

  } catch (error) {
    console.error('Error updating maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance record' },
      { status: 500 }
    )
  }
}

// Delete maintenance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const maintenanceRecord = await EquipmentMaintenance.findByIdAndDelete(params.id)

    if (!maintenanceRecord) {
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting maintenance record:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance record' },
      { status: 500 }
    )
  }
}