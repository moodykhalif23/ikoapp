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

interface AttendanceEntryProps {
  user: any
}

interface Employee {
  _id: string
  name: string
  employeeId: string
}

interface AttendanceRecord {
  _id: string
  employeeId: string
  employeeName: string
  date: string
  shiftType: "morning" | "afternoon" | "night"
  signInTime: string
  signOutTime?: string
}

interface RowState {
  recordId?: string
  shiftType: "morning" | "afternoon" | "night"
  signInTime: string
  signOutTime: string
}

export default function AttendanceEntry({ user }: AttendanceEntryProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAll, setSavingAll] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [rowState, setRowState] = useState<Record<string, RowState>>({})

  useEffect(() => {
    fetchEmployees()
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
        shiftType: record?.shiftType || "morning",
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
        ...(prev[employeeId] || { shiftType: "morning", signInTime: "", signOutTime: "" }),
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
              const row = rowState[employee._id] || { shiftType: "morning", signInTime: "", signOutTime: "" }
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
                        <MenuItem value="morning">Morning</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
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
                  const row = rowState[employee._id] || { shiftType: "morning", signInTime: "", signOutTime: "" }
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
                            <MenuItem value="morning">Morning</MenuItem>
                            <MenuItem value="afternoon">Afternoon</MenuItem>
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
          sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
        >
          {submittingReport ? "Submitting..." : "Submit Attendance"}
        </Button>
      </Box>
    </Box>
  )
}
