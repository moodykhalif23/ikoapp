"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
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
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ExpandMore, ExpandLess } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

interface AttendanceRecord {
  _id: string
  employeeId: string
  employeeName: string
  date: string
  shiftType: "day" | "night"
  signInTime: string
  signOutTime?: string
  createdBy?: string
  createdAt?: string
}

interface AttendanceReportsViewProps {
  initialDate?: string | null
}

export default function AttendanceReportsView({ initialDate }: AttendanceReportsViewProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  )
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
    }
  ]

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

  useEffect(() => {
    if (initialDate && initialDate !== selectedDate) {
      setSelectedDate(initialDate)
    }
  }, [initialDate, selectedDate])

  useEffect(() => {
    if (initialDate) {
      setShowReport(true)
    }
  }, [initialDate])

  const normalizeShiftType = (value?: string) => {
    return value === "night" ? "night" : "day"
  }

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return records.filter((record) => {
      const normalizedShift = normalizeShiftType(record.shiftType)
      if (shiftFilter !== "all" && normalizedShift !== shiftFilter) {
        return false
      }
      if (query) {
        return (
          record.employeeName?.toLowerCase().includes(query) ||
          record.employeeId?.toLowerCase().includes(query) ||
          normalizedShift.includes(query) ||
          record.signInTime?.toLowerCase().includes(query) ||
          record.signOutTime?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [records, searchQuery, shiftFilter])

  const summary = useMemo(() => {
    const uniqueEmployees = new Set(filteredRecords.map((record) => record.employeeId)).size
    const submittedAt = filteredRecords.length
      ? new Date(
          Math.max(
            ...filteredRecords.map((record) =>
              record.createdAt ? new Date(record.createdAt).getTime() : 0,
            ),
          ),
        )
      : null
    return { uniqueEmployees, submittedAt, total: filteredRecords.length }
  }, [filteredRecords])

  const reportId = selectedDate ? `ATT-${selectedDate.replace(/-/g, "")}` : "ATT-NA"
  const formatDate = (value: string | Date | null) => {
    if (!value) return "N/A"
    const date = typeof value === "string" ? new Date(value) : value
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-brand card-elevated card-filter-tight">
        <CardHeader className="card-filter-header">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FilterListIcon sx={{ fontSize: 20 }} />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="gap-2"
            >
              {filtersExpanded ? (
                <>
                  <ExpandLess sx={{ fontSize: 16 }} />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <ExpandMore sx={{ fontSize: 16 }} />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Input
              placeholder="Search attendance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-sm"
            />
            <SearchIcon sx={{ fontSize: 16 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          {filtersExpanded && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "100%" }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Shift</label>
                  <select
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
                  <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                  <Button
                    variant="outline"
                    onClick={() => fetchRecords(selectedDate)}
                    className="text-sm w-full h-10"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setShiftFilter("all")
                      setSelectedDate(new Date().toISOString().split("T")[0])
                    }}
                    className="text-sm w-full h-10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                {loading ? "Loading..." : `Showing ${summary.total} records`}
              </div>
            </div>
          )}

          {!filtersExpanded && (
            <div className="mt-2 text-sm text-muted-foreground">
              {loading ? "Loading..." : `${summary.total} records`}
              {(shiftFilter !== "all" || searchQuery) && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-none">
                  Filtered
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <Card className={`card-brand card-elevated card-report-compact relative overflow-hidden border ${reportCardStyles[0].card}`}>
          <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${reportCardStyles[0].bubble}`} />
          <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${reportCardStyles[0].bubble2}`} />
          <CardHeader className="pb-2 card-report-header relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold">{selectedDate}</CardTitle>
                <p className="text-sm text-muted-foreground">Report #{reportId}</p>
              </div>
              <div className="px-2 py-1 rounded-none text-xs font-medium whitespace-nowrap bg-green-100 text-green-800">
                Attendance
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-brand-contrast">Attendance:</span>{" "}
                <span className="text-primary font-medium">{summary.uniqueEmployees}</span>
              </p>
              <p>
                <span className="font-medium text-brand-contrast">Submitted:</span>{" "}
                <span className="text-muted-foreground">{formatDate(summary.submittedAt)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="text-xs sm:text-sm"
          onClick={() => setShowReport(true)}
        >
          View Attendance Report
        </Button>
      </div>

      {showReport && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowReport(false)
            }
          }}
        >
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-none shadow-xl overflow-hidden mb-16">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Attendance Report</p>
                <h3 className="text-base sm:text-lg font-semibold">{selectedDate}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowReport(false)}>
                Close
              </Button>
            </div>

            <div className="h-[calc(85vh-72px)] overflow-y-auto p-4 sm:p-6 pb-8">
              {isSmall ? (
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading attendance...</div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No attendance records for this date.</div>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const style = reportCardStyles[index % reportCardStyles.length]
                      return (
                      <div key={record._id} className={`card-brand card-elevated p-3 space-y-2 relative overflow-hidden border ${style.card}`}>
                        <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
                        <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{record.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{normalizeShiftType(record.shiftType)}</p>
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
                    )})
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
                      ) : filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">No attendance records for this date.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((record) => (
                          <TableRow key={record._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">{record.employeeName}</Typography>
                            </TableCell>
                            <TableCell>{normalizeShiftType(record.shiftType)}</TableCell>
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
          </div>
        </div>
      )}
    </div>
  )
}
