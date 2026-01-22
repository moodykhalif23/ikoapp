"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  Settings,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react"
import { toast } from "sonner"

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

export default function EquipmentDashboard({ machines = [], user }: EquipmentDashboardProps) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showAddMaintenance, setShowAddMaintenance] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)

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
  }, [])

  useEffect(() => {
    filterRecords()
  }, [maintenanceRecords, searchTerm, statusFilter, priorityFilter])

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

  const filterRecords = () => {
    let filtered = [...maintenanceRecords]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.assignedTo && record.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(record => record.priority === priorityFilter)
    }

    setFilteredRecords(filtered)
  }

  const handleAddMaintenance = async () => {
    if (!newMaintenance.equipmentId || !newMaintenance.scheduledDate || !newMaintenance.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const selectedMachine = machines.find(m => m._id === newMaintenance.equipmentId)

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      'in-progress': { variant: "default" as const, color: "bg-yellow-100 text-yellow-800" },
      completed: { variant: "secondary" as const, color: "bg-green-100 text-green-800" },
      cancelled: { variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge className={`capitalize ${config.color}`}>{status.replace('-', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return <Badge className={`capitalize ${priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium}`}>{priority}</Badge>
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
      {/* Filters Section */}
      <Card className="card-brand card-elevated mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search - Full width on top */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search maintenance records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Filter dropdowns in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                    statusFilter !== "all" 
                      ? "bg-green-50 text-green-800" 
                      : "bg-background"
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                    priorityFilter !== "all" 
                      ? "bg-green-50 text-green-800" 
                      : "bg-background"
                  }`}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Equipment Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Equipment</label>
                <select
                  value=""
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                >
                  <option value="">All Equipment</option>
                  {machines.map(machine => (
                    <option key={machine._id} value={machine.name}>{machine.name}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all")
                    setPriorityFilter("all")
                    setSearchTerm("")
                  }}
                  className="text-sm w-full h-10"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {maintenanceRecords.length} maintenance records
          </div>
        </CardContent>
      </Card>

      {/* Schedule Maintenance Button */}
      <div className="flex justify-end mb-6">
        <Dialog open={showAddMaintenance} onOpenChange={setShowAddMaintenance}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Create a new maintenance record for equipment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <Select value={newMaintenance.equipmentId} onValueChange={(value) => setNewMaintenance({...newMaintenance, equipmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine._id} value={machine._id}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Maintenance Type</Label>
                  <Select value={newMaintenance.maintenanceType} onValueChange={(value) => setNewMaintenance({...newMaintenance, maintenanceType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="predictive">Predictive</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newMaintenance.priority} onValueChange={(value) => setNewMaintenance({...newMaintenance, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Technician name"
                  value={newMaintenance.assignedTo}
                  onChange={(e) => setNewMaintenance({...newMaintenance, assignedTo: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  placeholder="0"
                  value={newMaintenance.estimatedHours}
                  onChange={(e) => setNewMaintenance({...newMaintenance, estimatedHours: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance work..."
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Equipment
              <Settings size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{machines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active machines</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Scheduled Maintenance
              <Calendar size={16} className="text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {maintenanceRecords.filter(r => r.status === 'scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming tasks</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Overdue
              <AlertTriangle size={16} className="text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getOverdueRecords().length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              This Week
              <Clock size={16} className="text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getUpcomingRecords().length}</div>
            <p className="text-xs text-muted-foreground mt-1">Due this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Table */}
      <Card className="card-brand card-elevated">
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>Track and manage equipment maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No maintenance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.equipmentName}</TableCell>
                      <TableCell className="capitalize">{record.maintenanceType}</TableCell>
                      <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {new Date(record.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.assignedTo || '--'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {record.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMaintenanceStatus(record._id, 'in-progress')}
                              className="text-xs"
                            >
                              Start
                            </Button>
                          )}
                          {record.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMaintenanceStatus(record._id, 'completed')}
                              className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}