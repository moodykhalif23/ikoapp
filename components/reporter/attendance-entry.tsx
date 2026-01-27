"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
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
  Chip
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { ChevronDown, ChevronUp } from "lucide-react"

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
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false)

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
      const recordDate = new Date(record.date || record.createdAt)
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
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "date":
        return new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
    <Box className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={2}>
        <Typography variant="h5" component="h1" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          Attendance Entry
        </Typography>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <TextField
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          {savingAll && (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: { xs: "flex-start", sm: "center" }, px: 1 }}>
              Saving...
            </Typography>
          )}
        </Box>
      </Box>

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
          variant="contained"
          onClick={handleSubmitAttendance}
          disabled={submittingReport}
          sx={{
            bgcolor: "var(--primary)",
            color: "var(--primary-foreground)",
            "&:hover": { bgcolor: "var(--brand-green-dark)" }
          }}
        >
          {submittingReport ? "Submitting..." : "Submit Attendance"}
        </Button>
      </Box>

      {/* Attendance History Section */}
      <Box className="card-brand card-elevated mt-6" sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={2}>
          <Typography variant="h6" component="h2" sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
            Attendance History
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowAttendanceHistory(!showAttendanceHistory)}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {showAttendanceHistory ? "Hide History" : "Show History"}
          </Button>
        </Box>

        {showAttendanceHistory && (
          <>
            {/* Filters Section */}
            <Box className="card-brand card-elevated card-filter-tight mb-4" sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Filter Attendance Records
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  sx={{ gap: 1 }}
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
              </Box>
              
              {/* Collapsible filter section */}
              {filtersExpanded && (
                <Box sx={{ mt: 2 }}>
                  {/* Date Filter */}
                  <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={2}>
                    <Box>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Date Range</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          sx={{
                            border: "2px solid #15803d",
                            backgroundColor: dateFilter !== "all" ? "#f0fdf4" : "background.paper",
                            color: dateFilter !== "all" ? "#166534" : "text.primary",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" }
                          }}
                        >
                          <MenuItem value="all">All Time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                          <MenuItem value="quarter">This Quarter</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Shift</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={shiftFilter}
                          onChange={(e) => setShiftFilter(e.target.value)}
                          sx={{
                            border: "2px solid #15803d",
                            backgroundColor: shiftFilter !== "all" ? "#f0fdf4" : "background.paper",
                            color: shiftFilter !== "all" ? "#166534" : "text.primary",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" }
                          }}
                        >
                          <MenuItem value="all">All Shifts</MenuItem>
                          <MenuItem value="day">Day</MenuItem>
                          <MenuItem value="night">Night</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Sort By</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          sx={{
                            border: "2px solid #15803d",
                            backgroundColor: sortBy !== "newest" ? "#f0fdf4" : "background.paper",
                            color: sortBy !== "newest" ? "#166534" : "text.primary",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" }
                          }}
                        >
                          <MenuItem value="newest">Newest First</MenuItem>
                          <MenuItem value="oldest">Oldest First</MenuItem>
                          <MenuItem value="date">Attendance Date</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>Actions</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setDateFilter("all")
                          setShiftFilter("all")
                          setSortBy("newest")
                        }}
                        sx={{ width: "100%", height: "40px", fontSize: "0.875rem" }}
                      >
                        Clear Filters
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Results Count */}
                  <Box sx={{ pt: 2, mt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Showing {filteredAttendanceRecords.length} of {attendanceRecords.length} attendance records
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Compact results count when collapsed */}
              {!filtersExpanded && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                  {filteredAttendanceRecords.length} of {attendanceRecords.length} attendance records
                  {(dateFilter !== "all" || shiftFilter !== "all" || sortBy !== "newest") && (
                    <Chip 
                      label="Filtered" 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        fontSize: "0.75rem", 
                        backgroundColor: "#f0fdf4", 
                        color: "#166534",
                        height: "20px"
                      }} 
                    />
                  )}
                </Typography>
              )}
            </Box>

            {/* Attendance Records Grid */}
            {filteredAttendanceRecords.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No attendance records found.
              </Typography>
            ) : (
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={2}>
                {filteredAttendanceRecords.map((record, index) => {
                  const style = reportCardStyles[index % reportCardStyles.length]
                  return (
                    <Box key={record._id} className={`card-brand hover:shadow-lg transition-all duration-300 hover-brand relative overflow-hidden border ${style.card}`} sx={{ p: 2 }}>
                      <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
                      <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
                      <Box sx={{ position: "relative", zIndex: 10 }}>
                        <Box display="flex" alignItems="start" justifyContent="space-between" gap={1} mb={1}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "primary.main" }}>
                              {record.date}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                              {record.employeeName}
                            </Typography>
                          </Box>
                          <Chip 
                            label={record.shiftType} 
                            size="small" 
                            sx={{ 
                              fontSize: "0.625rem", 
                              height: "20px",
                              backgroundColor: record.shiftType === 'day' ? "#dbeafe" : "#f3e8ff",
                              color: record.shiftType === 'day' ? "#1e40af" : "#7c3aed"
                            }} 
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                            <span style={{ fontWeight: 500, color: "var(--brand-contrast)" }}>Sign In:</span>{" "}
                            <span style={{ color: "var(--muted-foreground)" }}>
                              {record.signInTime || "N/A"}
                            </span>
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                            <span style={{ fontWeight: 500, color: "var(--brand-contrast)" }}>Sign Out:</span>{" "}
                            <span style={{ color: "var(--muted-foreground)" }}>
                              {record.signOutTime || "N/A"}
                            </span>
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                            <span style={{ fontWeight: 500, color: "var(--brand-contrast)" }}>Recorded:</span>{" "}
                            <span style={{ color: "var(--muted-foreground)" }}>
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
