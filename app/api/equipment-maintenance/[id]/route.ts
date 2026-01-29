import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { EquipmentMaintenance } from '@/lib/models'

// Update maintenance record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const body = await request.json()
    console.log('PUT /api/equipment-maintenance/[id] - Request body:', body);
    
    const updates = { ...body }

    // Convert date strings to Date objects
    if (updates.scheduledDate) {
      updates.scheduledDate = new Date(updates.scheduledDate)
    }
    if (updates.completedDate) {
      updates.completedDate = new Date(updates.completedDate)
    }

    const resolvedParams = await params
    console.log('PUT /api/equipment-maintenance/[id] - ID:', resolvedParams.id);
    console.log('PUT /api/equipment-maintenance/[id] - Updates:', updates);

    const maintenanceRecord = await EquipmentMaintenance.findByIdAndUpdate(
      resolvedParams.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    )

    if (!maintenanceRecord) {
      console.log('PUT /api/equipment-maintenance/[id] - Record not found');
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      )
    }

    console.log('PUT /api/equipment-maintenance/[id] - Updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenanceRecord
    })

  } catch (error: any) {
    console.error('Error updating maintenance record:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to update maintenance record' },
      { status: 500 }
    )
  }
}

// Delete maintenance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const resolvedParams = await params
    const maintenanceRecord = await EquipmentMaintenance.findByIdAndDelete(resolvedParams.id)

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