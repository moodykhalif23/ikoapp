"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Search,
  UserCheck,
  UserX,
  Timer
} from "lucide-react"

interface TimeTrackingDashboardProps {
  users?: any[]
}

interface TimeEntry {
  _id: string
  employeeName: string
  employeeEmail: string
  clockInTime: string
  clockOutTime?: string
  shiftType: string
  location?: string
  status: 'active' | 'completed'
  totalHours?: number
  notes?: string
}

export default function TimeTrackingDashboard({ users = [] }: TimeTrackingDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [timeEntries, searchTerm, statusFilter, shiftFilter, dateFilter])

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-tracking?limit=100')
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.data)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...timeEntries]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => entry.status === statusFilter)
    }

    // Shift filter
    if (shiftFilter !== "all") {
      filtered = filtered.filter(entry => entry.shiftType === shiftFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter(entry =>
        new Date(entry.clockInTime) >= today
      )
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry =>
        new Date(entry.clockInTime) >= weekAgo
      )
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(entry =>
        new Date(entry.clockInTime) >= monthAgo
      )
    }

    setFilteredEntries(filtered)
  }

  const getActiveEmployees = () => {
    return timeEntries.filter(entry => entry.status === 'active').length
  }

  const getTotalHoursToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return timeEntries
      .filter(entry => {
        const clockInDate = new Date(entry.clockInTime)
        return clockInDate >= today && entry.status === 'completed'
      })
      .reduce((total, entry) => total + (entry.totalHours || 0), 0)
      .toFixed(1)
  }

  const formatDuration = (hours?: number) => {
    if (!hours) return '--'
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Employee Name', 'Email', 'Clock In', 'Clock Out', 'Shift Type', 'Status', 'Total Hours', 'Location', 'Notes'],
      ...filteredEntries.map(entry => [
        entry.employeeName,
        entry.employeeEmail,
        formatDateTime(entry.clockInTime),
        entry.clockOutTime ? formatDateTime(entry.clockOutTime) : '--',
        entry.shiftType,
        entry.status,
        formatDuration(entry.totalHours),
        entry.location || '',
        entry.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-tracking-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Active Employees
              <UserCheck size={16} className="text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getActiveEmployees()}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently clocked in</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Today's Hours
              <Clock size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getTotalHoursToday()}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total logged today</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Entries
              <TrendingUp size={16} className="text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{timeEntries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time entries</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-contrast flex items-center justify-between">
              Staff Count
              <Users size={16} className="text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Table */}
      <Card className="card-brand card-elevated">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Time Tracking Records</CardTitle>
              <CardDescription>Detailed view of employee attendance and hours</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="overtime">Overtime</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No time entries found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{entry.employeeEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {entry.shiftType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatDateTime(entry.clockInTime)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.clockOutTime ? formatDateTime(entry.clockOutTime) : '--'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {formatDuration(entry.totalHours)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.status === 'active' ? 'default' : 'secondary'}
                          className={entry.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {entry.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.location || '--'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Showing {filteredEntries.length} of {timeEntries.length} entries
              </span>
              {filteredEntries.length > 0 && (
                <span className="font-medium">
                  Total Hours: {
                    filteredEntries
                      .filter(entry => entry.status === 'completed')
                      .reduce((total, entry) => total + (entry.totalHours || 0), 0)
                      .toFixed(1)
                  }h
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}