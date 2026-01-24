"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

interface AttendanceRecord {
  _id: string
  employeeId: string
  employeeName: string
  date: string
  shiftType: "morning" | "afternoon" | "night"
  signInTime: string
  signOutTime?: string
  createdBy?: string
}

export default function AttendanceReportsView() {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  const fetchRecords = async (date: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/attendance?date=${encodeURIComponent(date)}`)
      const data = await response.json()
      if (data.success) {
        setRecords(data.data || [])
      } else {
        setError("Failed to load attendance records")
      }
    } catch (err) {
      setError("Failed to load attendance records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(selectedDate)
  }, [selectedDate])

  const summary = useMemo(() => {
    const total = records.length
    const signedOut = records.filter((record) => record.signOutTime).length
    const signedInOnly = records.filter((record) => record.signInTime && !record.signOutTime).length
    return { total, signedOut, signedInOnly }
  }, [records])

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-brand card-elevated card-filter-tight">
        <CardHeader className="card-filter-header">
          <CardTitle className="text-base sm:text-lg">Attendance Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "stretch", sm: "center" }}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { xs: "100%", sm: 240 } }}
            />
            <Button
              variant="outline"
              onClick={() => fetchRecords(selectedDate)}
              className="text-xs sm:text-sm"
            >
              Refresh
            </Button>
            <Typography variant="caption" color="text.secondary">
              {loading ? "Loading..." : `${summary.total} records`}
            </Typography>
          </Box>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{summary.total}</div>
                <p className="text-xs text-muted-foreground mt-1">For selected date</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast">Signed Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{summary.signedOut}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed shifts</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast">Signed In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{summary.signedInOnly}</div>
                <p className="text-xs text-muted-foreground mt-1">No sign-out yet</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {isSmall ? (
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading attendance...</div>
          ) : records.length === 0 ? (
            <div className="text-sm text-muted-foreground">No attendance records for this date.</div>
          ) : (
            records.map((record) => (
              <div key={record._id} className="card-brand card-elevated p-3 space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{record.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{record.shiftType}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Sign In</p>
                    <p className="text-foreground">{record.signInTime || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sign Out</p>
                    <p className="text-foreground">{record.signOutTime || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <TableContainer component={Paper} elevation={2} square sx={{ overflowX: "auto", borderRadius: 0 }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Shift</strong></TableCell>
                <TableCell><strong>Sign In</strong></TableCell>
                <TableCell><strong>Sign Out</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">Loading attendance...</Typography>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No attendance records for this date.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{record.employeeName}</Typography>
                    </TableCell>
                    <TableCell>{record.shiftType}</TableCell>
                    <TableCell>{record.signInTime || "N/A"}</TableCell>
                    <TableCell>{record.signOutTime || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
