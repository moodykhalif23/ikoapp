"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Alert,
  Chip,
  InputAdornment
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AttendanceEntryProps {
  user: any
}

interface Employee {
  _id: string
  name: string
  employeeId: string
}

type ShiftType = "day" | "night"

interface AttendanceRecord {
  _id: string
  employeeId: string
  employeeName: string
  date: string
  shiftType: ShiftType
  signInTime: string
  signOutTime?: string
  createdBy?: string
  createdAt?: string
}

interface RowState {
  recordId?: string
  shiftType: ShiftType
  signInTime: string
  signOutTime: string
}

export default function AttendanceEntry({ user }: AttendanceEntryProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  const normalizeShiftType = (value?: string): ShiftType => {
    return value === "night" ? "night" : "day"
  }

  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAll, setSavingAll] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  
  // Filter states for attendance records
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [shiftFilter, setShiftFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    fetchEmployees()
    fetchAttendanceHistory()
  }, [])

  useEffect(() => {
    fetchAttendance(selectedDate)
  }, [selectedDate])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data)
      }
    } catch (err) {
      setError("Failed to fetch employees")
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch("/api/attendance")
      const data = await response.json()
      if (data.success) {
        setAttendanceRecords(data.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch attendance history")
    }
  }

  const fetchAttendance = async (date: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/attendance?date=${encodeURIComponent(date)}`)
      const data = await response.json()
      if (data.success) {
        setRecords(data.data)
      } else {
        setError("Failed to fetch attendance")
      }
    } catch (err) {
      setError("Failed to fetch attendance")
    } finally {
      setLoading(false)
    }
  }

  const recordsByEmployee = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    records.forEach((record) => {
      map.set(String(record.employeeId), record)
    })
    return map
  }, [records])

  useEffect(() => {
    const nextState: Record<string, RowState> = {}
    employees.forEach((employee) => {
      const record = recordsByEmployee.get(employee._id)
      nextState[employee._id] = {
        recordId: record?._id,
        shiftType: normalizeShiftType(record?.shiftType),
        signInTime: record?.signInTime || "",
        signOutTime: record?.signOutTime || ""
      }
    })
    setRowState(nextState)
  }, [employees, recordsByEmployee])

  const updateRow = (employeeId: string, updates: Partial<RowState>) => {
    setRowState((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || { shiftType: "day", signInTime: "", signOutTime: "" }),
        ...updates
      }
    }))
  }

  const buildEntries = () => {
    const entries = employees
      .map((employee) => {
        const row = rowState[employee._id]
        if (!row) return null
        if (!row.signInTime && !row.signOutTime) return null
        if (!row.signInTime && row.signOutTime) {
          throw new Error(`Sign-in time required for ${employee.name}`)
        }
        return {
          employeeId: employee._id,
          employeeName: employee.name,
          shiftType: row.shiftType,
          signInTime: row.signInTime,
          signOutTime: row.signOutTime || ""
        }
      })
      .filter(Boolean)

    return entries as Array<{
      employeeId: string
      employeeName: string
      shiftType: RowState["shiftType"]
      signInTime: string
      signOutTime: string
    }>
  }

  const saveAllEntries = async () => {
    try {
      setSavingAll(true)
      setError(null)

      const entries = buildEntries()
      if (entries.length === 0) {
        setError("Enter at least one attendance row before saving.")
        return null
      }

      const savePromises = entries.map(async (entry) => {
        const currentRow = rowState[entry.employeeId]
        const url = currentRow?.recordId ? `/api/attendance/${currentRow.recordId}` : "/api/attendance"
        const method = currentRow?.recordId ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: entry.employeeId,
            date: selectedDate,
            shiftType: entry.shiftType,
            signInTime: entry.signInTime,
            signOutTime: entry.signOutTime || undefined,
            createdBy: user?.name || "Reporter"
          })
        })

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || `Failed to save ${entry.employeeName}`)
        }
      })

      await Promise.all(savePromises)
      setSuccess("Attendance saved")
      await fetchAttendance(selectedDate)
      await fetchAttendanceHistory()
      return entries
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance")
      return null
    } finally {
      setSavingAll(false)
    }
  }


  const handleSubmitAttendance = async () => {
    try {
      setSubmittingReport(true)
      setError(null)

      const entries = await saveAllEntries()
      if (!entries || entries.length === 0) {
        setError("Enter attendance before submitting.")
        return
      }

      await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceDate: selectedDate,
          reporterName: user?.name || "Reporter"
        })
      })

      setSuccess("Attendance submitted")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit attendance")
    } finally {
      setSubmittingReport(false)
    }
  }

  const renderStatusChip = (row: RowState) => {
    if (row.signOutTime) {
      return <Chip label="Signed Out" size="small" color="success" />
    }
    if (row.signInTime) {
      return <Chip label="Signed In" size="small" color="info" />
    }
    return <Chip label="Not Signed" size="small" />
  }

  // Filter attendance records based on current filters
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    // Shift filter
    if (shiftFilter !== "all" && record.shiftType !== shiftFilter) {
      return false
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const recordDate = new Date(record.date || record.createdAt || new Date())
      const now = new Date()
      
      switch (dateFilter) {
        case "today":
          if (recordDate.toDateString() !== now.toDateString()) return false
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (recordDate < weekAgo) return false
          break
        case "month":
          if (recordDate.getMonth() !== now.getMonth() || recordDate.getFullYear() !== now.getFullYear()) return false
          break
        case "quarter":
          const currentQuarter = Math.floor(now.getMonth() / 3)
          const reportQuarter = Math.floor(recordDate.getMonth() / 3)
          if (reportQuarter !== currentQuarter || recordDate.getFullYear() !== now.getFullYear()) return false
          break
      }
    }
    
    return true
  }).sort((a, b) => {
    // Sort records based on sortBy selection
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt || new Date()).getTime() - new Date(b.createdAt || new Date()).getTime()
      case "date":
        return new Date(a.date || a.createdAt || new Date()).getTime() - new Date(b.date || b.createdAt || new Date()).getTime()
      case "newest":
      default:
        return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime()
    }
  })

  const reportCardStyles = [
    {
      card: "bg-gradient-to-br from-sky-50 via-white to-emerald-50 border-sky-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/40 dark:border-emerald-900/40",
      bubble: "bg-sky-100/70 dark:bg-sky-900/40",
      bubble2: "bg-emerald-100/60 dark:bg-emerald-900/30"
    },
    {
      card: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-cyan-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/40 dark:border-blue-900/40",
      bubble: "bg-cyan-100/70 dark:bg-cyan-900/40",
      bubble2: "bg-blue-100/60 dark:bg-blue-900/30"
    },
    {
      card: "bg-gradient-to-br from-teal-50 via-white to-indigo-50 border-teal-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40 dark:border-indigo-900/40",
      bubble: "bg-teal-100/70 dark:bg-teal-900/40",
      bubble2: "bg-indigo-100/60 dark:bg-indigo-900/30"
    },
    {
      card: "bg-gradient-to-br from-sky-50 via-white to-teal-50 border-sky-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-teal-950/40 dark:border-teal-900/40",
      bubble: "bg-sky-100/60 dark:bg-sky-900/40",
      bubble2: "bg-teal-100/60 dark:bg-teal-900/30"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Filters Section - moved to top */}
      <Card className="card-brand card-elevated card-filter-tight">
        <CardHeader className="card-filter-header">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              Filter Attendance Records
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="gap-2"
            >
              {filtersExpanded ? (
                <>
                  <ChevronUp size={16} />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Collapsible filter section */}
          {filtersExpanded && (
            <div className="space-y-4">
              {/* Date Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label htmlFor="selected-date" className="text-xs font-medium text-muted-foreground">Selected Date</label>
                  <TextField
                    id="selected-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "100%" }}
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="attendance-date-filter" className="text-xs font-medium text-muted-foreground">Date Range</label>
                  <select
                    id="attendance-date-filter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      dateFilter !== "all" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="attendance-shift-filter" className="text-xs font-medium text-muted-foreground">Shift</label>
                  <select
                    id="attendance-shift-filter"
                    value={shiftFilter}
                    onChange={(e) => setShiftFilter(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      shiftFilter !== "all" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="all">All Shifts</option>
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="attendance-sort-filter" className="text-xs font-medium text-muted-foreground">Sort By</label>
                  <select
                    id="attendance-sort-filter"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      sortBy !== "newest" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="date">Attendance Date</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateFilter("all")
                      setShiftFilter("all")
                      setSortBy("newest")
                      setSelectedDate(new Date().toISOString().split("T")[0])
                    }}
                    className="text-sm w-full h-10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                Showing {filteredAttendanceRecords.length} of {attendanceRecords.length} attendance records
              </div>
            </div>
          )}
          
          {/* Compact results count when collapsed */}
          {!filtersExpanded && (
            <div className="text-sm text-muted-foreground">
              {filteredAttendanceRecords.length} of {attendanceRecords.length} attendance records
              {(dateFilter !== "all" || shiftFilter !== "all" || sortBy !== "newest") && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-none">
                  Filtered
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History Grid */}
      {filteredAttendanceRecords.length === 0 ? (
        <Card className="card-brand card-elevated">
          <CardContent className="text-center py-8">
            <Typography variant="body2" color="text.secondary">
              No attendance records found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAttendanceRecords.map((record, index) => {
            const style = reportCardStyles[index % reportCardStyles.length]
            return (
              <Card key={record._id} className={`card-brand hover:shadow-lg transition-all duration-300 hover-brand relative overflow-hidden border ${style.card}`}>
                <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
                <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
                <CardHeader className="p-3 sm:p-4 pb-2 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-primary text-base sm:text-lg">{record.date}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{record.employeeName}</CardDescription>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded-none text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${
                      record.shiftType === 'day' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {record.shiftType}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-2 relative z-10">
                  <div className="space-y-1.5 text-xs sm:text-sm mb-3">
                    <p>
                      <span className="font-medium text-brand-contrast">Sign In:</span>{" "}
                      <span className="text-muted-foreground">
                        {record.signInTime || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-brand-contrast">Sign Out:</span>{" "}
                      <span className="text-muted-foreground">
                        {record.signOutTime || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-brand-contrast">Recorded:</span>{" "}
                      <span className="text-muted-foreground">
                        {new Date(record.createdAt || new Date()).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Current Day Attendance Entry */}
      <Box className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 } }}>
        {savingAll && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Typography variant="caption" color="text.secondary">
              Saving...
            </Typography>
          </Box>
        )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {isSmall ? (
        <Box className="space-y-3">
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading attendance...</Typography>
          ) : employees.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No employees found. Add employees first.
            </Typography>
          ) : (
            employees.map((employee) => {
              const row = rowState[employee._id] || { shiftType: "day", signInTime: "", signOutTime: "" }
              return (
                <Box key={employee._id} className="card-brand card-elevated p-3 space-y-3">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">{employee.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{employee.employeeId}</Typography>
                  </Box>
                  <Box className="space-y-2">
                    <FormControl fullWidth size="small">
                      <InputLabel>Shift</InputLabel>
                      <Select
                        value={row.shiftType}
                        label="Shift"
                        onChange={(e) => updateRow(employee._id, { shiftType: e.target.value as RowState["shiftType"] })}
                      >
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="night">Night</MenuItem>
                      </Select>
                    </FormControl>
                    <Box className="grid grid-cols-2 gap-2">
                      <Box>
                        <Typography variant="caption" color="text.secondary">Sign In</Typography>
                        <TextField
                          type="time"
                          value={row.signInTime}
                          onChange={(e) => updateRow(employee._id, { signInTime: e.target.value })}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Clock size={16} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Sign Out</Typography>
                        <TextField
                          type="time"
                          value={row.signOutTime}
                          onChange={(e) => updateRow(employee._id, { signOutTime: e.target.value })}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Clock size={16} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {renderStatusChip(row)}
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ minWidth: 180 }}><strong>Employee</strong></TableCell>
                <TableCell sx={{ minWidth: 140 }}><strong>Shift</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Sign In</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Sign Out</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">Loading attendance...</Typography>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No employees found. Add employees first.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => {
                  const row = rowState[employee._id] || { shiftType: "day", signInTime: "", signOutTime: "" }
                  return (
                    <TableRow key={employee._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{employee.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{employee.employeeId}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel>Shift</InputLabel>
                          <Select
                            value={row.shiftType}
                            label="Shift"
                            onChange={(e) => updateRow(employee._id, { shiftType: e.target.value as RowState["shiftType"] })}
                          >
                            <MenuItem value="day">Day</MenuItem>
                            <MenuItem value="night">Night</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={row.signInTime}
                          onChange={(e) => updateRow(employee._id, { signInTime: e.target.value })}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Clock size={16} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={row.signOutTime}
                          onChange={(e) => updateRow(employee._id, { signOutTime: e.target.value })}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Clock size={16} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(row)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="default"
          onClick={handleSubmitAttendance}
          disabled={submittingReport}
          className="bg-primary hover:bg-brand-green-dark text-primary-foreground"
        >
          {submittingReport ? "Submitting..." : "Submit Attendance"}
        </Button>
      </Box>
    </Box>
    </div>
  )
}
