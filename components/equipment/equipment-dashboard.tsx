"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Clock, Calendar, Settings, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Box,
  Button as MuiButton,
  Chip,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

interface EquipmentDashboardProps {
  machines?: any[]
  user?: any
}

interface MaintenanceRecord {
  _id: string
  equipmentName: string
  maintenanceType: string
  priority: string
  status: string
  scheduledDate: string
  completedDate?: string
  description: string
  assignedTo?: string
  estimatedHours?: number
  actualHours?: number
  cost?: number
  createdAt: string
}

export default function EquipmentDashboard({ machines: initialMachines = [], user }: EquipmentDashboardProps) {
  const [machineList, setMachineList] = useState<any[]>(initialMachines)
  const [machinesLoading, setMachinesLoading] = useState(true)
  const [machineDialogOpen, setMachineDialogOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<any | null>(null)
  const [machineForm, setMachineForm] = useState({
    name: "",
    type: "",
    status: "active"
  })
  const [machineSubmitting, setMachineSubmitting] = useState(false)
  const [machineError, setMachineError] = useState<string | null>(null)

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMaintenance, setShowAddMaintenance] = useState(false)

  // Form states
  const [newMaintenance, setNewMaintenance] = useState({
    equipmentId: "",
    maintenanceType: "preventive",
    priority: "medium",
    scheduledDate: "",
    description: "",
    assignedTo: "",
    estimatedHours: "",
    notes: ""
  })

  useEffect(() => {
    fetchMaintenanceRecords()
    fetchMachines()
  }, [])

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await fetch('/api/equipment-maintenance')
      if (response.ok) {
        const data = await response.json()
        setMaintenanceRecords(data.data)
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMachines = async () => {
    try {
      setMachinesLoading(true)
      const response = await fetch('/api/machines?all=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched machines data:', data);
        console.log('First machine structure:', data[0]);
        setMachineList(data)
      } else {
        setMachineError("Failed to fetch machines")
      }
    } catch (error) {
      setMachineError("Error fetching machines")
    } finally {
      setMachinesLoading(false)
    }
  }

  // Helper function to get machine ID
  const getMachineId = (machine: any) => {
    return machine._id || machine.id || machine._id?.toString();
  }

  const handleOpenMachineDialog = (machine?: any) => {
    if (machine) {
      setEditingMachine(machine)
      setMachineForm({
        name: machine.name || "",
        type: machine.type || "",
        status: machine.status || "active"
      })
    } else {
      setEditingMachine(null)
      setMachineForm({ name: "", type: "", status: "active" })
    }
    setMachineDialogOpen(true)
    setMachineError(null)
  }

  const handleCloseMachineDialog = () => {
    setMachineDialogOpen(false)
    setEditingMachine(null)
    setMachineForm({ name: "", type: "", status: "active" })
    setMachineError(null)
  }

  const handleSaveMachine = async () => {
    if (!machineForm.name.trim() || !machineForm.type.trim()) {
      setMachineError("Name and type are required")
      return
    }

    try {
      setMachineSubmitting(true)
      setMachineError(null)

      console.log('Editing machine:', editingMachine);
      const machineId = getMachineId(editingMachine);
      console.log('Machine ID being used:', machineId);

      const url = editingMachine
        ? `/api/machines/${machineId}`
        : '/api/machines'
      const method = editingMachine ? 'PUT' : 'POST'

      console.log('API call:', method, url);
      console.log('Request body:', {
        name: machineForm.name.trim(),
        type: machineForm.type.trim(),
        status: machineForm.status
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: machineForm.name.trim(),
          type: machineForm.type.trim(),
          status: machineForm.status
        })
      })

      const data = await response.json()
      console.log('API response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save machine')
      }

      toast.success(editingMachine ? "Machine updated" : "Machine created")
      handleCloseMachineDialog()
      fetchMachines()
    } catch (error) {
      console.error('Save machine error:', error);
      setMachineError(error instanceof Error ? error.message : "Failed to save machine")
    } finally {
      setMachineSubmitting(false)
    }
  }

  const handleDeleteMachine = async (machine: any) => {
    console.log('Deleting machine:', machine);
    const machineId = getMachineId(machine);
    console.log('Machine ID:', machineId);

    if (!machineId) {
      toast.error("Invalid machine ID");
      return;
    }

    if (!confirm(`Delete machine "${machine.name}"?`)) {
      return
    }

    try {
      const url = `/api/machines/${machineId}`;
      console.log('Delete API call:', url);
      
      const response = await fetch(url, { method: 'DELETE' })
      const data = await response.json()
      
      console.log('Delete response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete machine')
      }
      toast.success("Machine deleted")
      fetchMachines()
    } catch (error) {
      console.error('Delete machine error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to delete machine")
    }
  }

  const handleAddMaintenance = async () => {
    if (!newMaintenance.equipmentId || !newMaintenance.scheduledDate || !newMaintenance.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const selectedMachine = machineList.find(m => m._id === newMaintenance.equipmentId)

      const response = await fetch('/api/equipment-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMaintenance,
          equipmentName: selectedMachine?.name,
          createdBy: user?.name || 'Admin'
        })
      })

      if (response.ok) {
        toast.success("Maintenance record created successfully")
        setShowAddMaintenance(false)
        setNewMaintenance({
          equipmentId: "",
          maintenanceType: "preventive",
          priority: "medium",
          scheduledDate: "",
          description: "",
          assignedTo: "",
          estimatedHours: "",
          notes: ""
        })
        fetchMaintenanceRecords()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create maintenance record")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    }
  }

  const updateMaintenanceStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status }
      if (status === 'completed') {
        updates.completedDate = new Date().toISOString()
      }

      const response = await fetch(`/api/equipment-maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        toast.success("Maintenance record updated successfully")
        fetchMaintenanceRecords()
      } else {
        toast.error("Failed to update maintenance record")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    }
  }

  const getStatusChipColor = (status: string) => {
    if (status === 'completed') return 'success'
    if (status === 'in-progress') return 'warning'
    if (status === 'cancelled') return 'error'
    return 'info'
  }

  const getPriorityChipColor = (priority: string) => {
    if (priority === 'critical') return 'error'
    if (priority === 'high') return 'warning'
    if (priority === 'low') return 'default'
    return 'info'
  }

  const getOverdueRecords = () => {
    return maintenanceRecords.filter(record => {
      if (record.status === 'completed' || record.status === 'cancelled') return false
      return new Date(record.scheduledDate) < new Date()
    })
  }

  const getUpcomingRecords = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return maintenanceRecords.filter(record => {
      if (record.status !== 'scheduled') return false
      const scheduledDate = new Date(record.scheduledDate)
      return scheduledDate >= today && scheduledDate <= nextWeek
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="card-brand">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Machine Management */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Machines
          </Typography>
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenMachineDialog()}
            sx={{
              bgcolor: "var(--primary)",
              color: "var(--primary-foreground)",
              "&:hover": { bgcolor: "var(--brand-green-dark)" }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add Machine</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
          </MuiButton>
        </Box>

        {machineError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMachineError(null)}>
            {machineError}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ minWidth: 140 }}><strong>Name</strong></TableCell>
                <TableCell sx={{ minWidth: 120, display: { xs: 'none', sm: 'table-cell' } }}><strong>Type</strong></TableCell>
                <TableCell sx={{ minWidth: 100 }}><strong>Status</strong></TableCell>
                <TableCell sx={{ minWidth: 100 }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machinesLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">Loading machines...</Typography>
                  </TableCell>
                </TableRow>
              ) : machineList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No machines found. Click "Add Machine" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                machineList.map((machine) => (
                  <TableRow key={machine._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{machine.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          Type: {machine.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{machine.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={machine.status}
                        size="small"
                        color={machine.status === 'active' ? 'success' : machine.status === 'maintenance' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenMachineDialog(machine)}
                            sx={{
                              color: "var(--primary)",
                              "&:hover": {
                                bgcolor: "var(--brand-green-dark)",
                                color: "var(--primary-foreground)"
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMachine(machine)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Schedule Maintenance Button */}
      <div className="flex justify-end">
        <Dialog open={showAddMaintenance} onOpenChange={setShowAddMaintenance}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl sm:max-w-lg md:max-w-2xl overflow-visible">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Create a new maintenance record for equipment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <div className="rounded-md border border-border bg-white">
                  <select
                    value={newMaintenance.equipmentId}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, equipmentId: e.target.value })}
                    className="w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
                  >
                    <option value="">Select equipment</option>
                    {machineList.map((machine) => (
                      <option key={machine._id} value={machine._id}>
                        {machine.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Maintenance Type</Label>
                  <div className="rounded-md border border-border bg-white">
                    <select
                      value={newMaintenance.maintenanceType}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, maintenanceType: e.target.value })}
                      className="w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
                    >
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="predictive">Predictive</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <div className="rounded-md border border-border bg-white">
                    <select
                      value={newMaintenance.priority}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, priority: e.target.value })}
                      className="w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <TextField
                  id="scheduledDate"
                  type="datetime-local"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <TextField
                  id="assignedTo"
                  placeholder="Technician name"
                  value={newMaintenance.assignedTo}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, assignedTo: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <TextField
                  id="estimatedHours"
                  type="number"
                  placeholder="0"
                  value={newMaintenance.estimatedHours}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, estimatedHours: e.target.value })}
                  fullWidth
                  size="small"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance work..."
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddMaintenance} className="flex-1">
                  Schedule Maintenance
                </Button>
                <Button variant="outline" onClick={() => setShowAddMaintenance(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Maintenance Table */}
      <Box className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>Maintenance Schedule</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track and manage equipment maintenance activities
        </Typography>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ minWidth: 140 }}><strong>Equipment</strong></TableCell>
                <TableCell sx={{ minWidth: 120, display: { xs: 'none', sm: 'table-cell' } }}><strong>Type</strong></TableCell>
                <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}><strong>Priority</strong></TableCell>
                <TableCell sx={{ minWidth: 140 }}><strong>Scheduled</strong></TableCell>
                <TableCell sx={{ minWidth: 120, display: { xs: 'none', md: 'table-cell' } }}><strong>Assigned</strong></TableCell>
                <TableCell sx={{ minWidth: 100 }}><strong>Status</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No maintenance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                maintenanceRecords.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{record.equipmentName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>
                          {record.maintenanceType} • {new Date(record.scheduledDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' } }}>
                          Priority: {record.priority}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} className="capitalize">
                      {record.maintenanceType}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip
                        label={record.priority}
                        size="small"
                        color={getPriorityChipColor(record.priority) as any}
                      />
                    </TableCell>
                    <TableCell>{new Date(record.scheduledDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {record.assignedTo || '--'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status.replace('-', ' ')}
                        size="small"
                        color={getStatusChipColor(record.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {record.status === 'scheduled' && (
                          <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={() => updateMaintenanceStatus(record._id, 'in-progress')}
                            sx={{
                              color: "var(--primary)",
                              borderColor: "var(--primary)",
                              "&:hover": {
                                bgcolor: "var(--brand-green-dark)",
                                color: "var(--primary-foreground)",
                                borderColor: "var(--brand-green-dark)"
                              }
                            }}
                          >
                            Start
                          </MuiButton>
                        )}
                        {record.status === 'in-progress' && (
                          <MuiButton
                            size="small"
                            variant="outlined"
                            onClick={() => updateMaintenanceStatus(record._id, 'completed')}
                            sx={{
                              color: "var(--primary)",
                              borderColor: "var(--primary)",
                              "&:hover": {
                                bgcolor: "var(--brand-green-dark)",
                                color: "var(--primary-foreground)",
                                borderColor: "var(--brand-green-dark)"
                              }
                            }}
                          >
                            Complete
                          </MuiButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Machine Dialog */}
      <MuiDialog
        open={machineDialogOpen}
        onClose={handleCloseMachineDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <MuiDialogTitle>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</MuiDialogTitle>
        <MuiDialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Machine Name *"
              value={machineForm.name}
              onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
              fullWidth
              size="medium"
            />
            <TextField
              label="Machine Type *"
              value={machineForm.type}
              onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}
              fullWidth
              size="medium"
            />
            <FormControl fullWidth size="medium">
              <InputLabel>Status</InputLabel>
              <MuiSelect
                value={machineForm.status}
                label="Status"
                onChange={(e) => setMachineForm({ ...machineForm, status: e.target.value as string })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </MuiSelect>
            </FormControl>
          </Box>
        </MuiDialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <MuiButton onClick={handleCloseMachineDialog}>Cancel</MuiButton>
          <MuiButton
            onClick={handleSaveMachine}
            variant="contained"
            disabled={machineSubmitting || !machineForm.name.trim() || !machineForm.type.trim()}
          >
            {machineSubmitting ? 'Saving...' : (editingMachine ? 'Update' : 'Create')}
          </MuiButton>
        </DialogActions>
      </MuiDialog>
    </div>
  )
}
