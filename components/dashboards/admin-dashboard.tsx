"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Settings, UserPlus, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import PeopleIcon from "@mui/icons-material/People"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ChevronDown, ChevronUp } from "lucide-react"
import EquipmentDashboard from "@/components/equipment/equipment-dashboard"
import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"
import EmployeeManagement from "@/components/employee/employee-management"
import AttendanceReportsView from "@/components/attendance/attendance-reports-view"
import { printReportElement } from "@/lib/report-print"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"

interface AdminDashboardProps {
  user: any
  onLogout: () => void
  onGoHome?: () => void
}

interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
  role: string
}

export default function AdminDashboard({ user, onLogout, onGoHome }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [activeTab, setActiveTab] = useState("dashboard")
  const [employeeCount, setEmployeeCount] = useState(0)
  const [activeMachineCount, setActiveMachineCount] = useState(0)
  const [attendanceFocusDate, setAttendanceFocusDate] = useState<string | null>(null)
  
  // Filter states for reports page
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterReporter, setFilterReporter] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [reportsView, setReportsView] = useState<"production" | "attendance">("production")
  const reportCardStyles = [
    { card: "bg-gradient-to-br from-sky-50 via-white to-emerald-50 border-sky-100/70", bubble: "bg-sky-100/70", bubble2: "bg-emerald-100/60" },
    { card: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 border-cyan-100/70", bubble: "bg-cyan-100/70", bubble2: "bg-blue-100/60" },
    { card: "bg-gradient-to-br from-teal-50 via-white to-indigo-50 border-teal-100/70", bubble: "bg-teal-100/70", bubble2: "bg-indigo-100/60" },
    { card: "bg-gradient-to-br from-sky-50 via-white to-teal-50 border-sky-100/70", bubble: "bg-sky-100/60", bubble2: "bg-teal-100/60" }
  ]

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [reportsResponse, employeesResponse, machinesResponse] = await Promise.all([
          fetch('/api/reports?limit=100'),
          fetch('/api/employees'),
          fetch('/api/machines?all=true')
        ])

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          const nonDraftReports = Array.isArray(reportsData.reports)
            ? reportsData.reports.filter((report: any) => report.status !== 'draft')
            : []
          setReports(nonDraftReports)
        }

        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json()
          setEmployeeCount(Array.isArray(employeesData.data) ? employeesData.data.length : 0)
        }

        if (machinesResponse.ok) {
          const machinesData = await machinesResponse.json()
          const machines = Array.isArray(machinesData) ? machinesData : []
          setActiveMachineCount(machines.filter((machine) => machine.status === 'active').length)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    }

    fetchReports()
  }, [])

  const handleAddComment = (reportId: string, comment: string) => {
    const submit = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: user?.name || 'Admin',
            role: 'admin',
            text: comment,
            timestamp: new Date().toLocaleTimeString()
          })
        })
        if (response.ok) {
          const data = await response.json()
          setComments((prev) => ({
            ...prev,
            [reportId]: [...(prev[reportId] || []), data.comment],
          }))
        }
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    }
    submit()
  }

  // Reset when selecting a new report
  const handleReportSelect = (report: any) => {
    setSelectedReport(report)
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/reports/${report.id}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments((prev) => ({ ...prev, [report.id]: data.comments || [] }))
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    fetchComments()
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset selected report when changing tabs
    if (tab !== "reports") {
      setSelectedReport(null)
    }
  }

  const handleNotificationTarget = async (target: any) => {
    if (!target) return

    if (target.type === "report" && target.reportId) {
      setActiveTab("reports")
      setReportsView("production")
      setAttendanceFocusDate(null)

      const existing = reports.find((report) => report.id === target.reportId)
      if (existing) {
        setSelectedReport(existing)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("ikoapp:notificationTarget")
        }
        return
      }

      try {
        const response = await fetch(`/api/reports/${target.reportId}`)
        if (response.ok) {
          const report = await response.json()
          setSelectedReport(report)
        }
      } catch (error) {
        console.error("Error fetching report from notification:", error)
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("ikoapp:notificationTarget")
      }
      return
    }

    if (target.type === "attendance" && target.attendanceDate) {
      setSelectedReport(null)
      setActiveTab("reports")
      setReportsView("attendance")
      setAttendanceFocusDate(target.attendanceDate)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("ikoapp:notificationTarget")
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("ikoapp:notificationTarget")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        handleNotificationTarget(parsed)
      } catch {
        window.localStorage.removeItem("ikoapp:notificationTarget")
      }
    }

    const listener = (event: Event) => {
      const custom = event as CustomEvent
      handleNotificationTarget(custom.detail)
    }
    window.addEventListener("ikoapp:notification-target", listener as EventListener)
    return () => window.removeEventListener("ikoapp:notification-target", listener as EventListener)
  }, [reports])

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    // Status filter
    if (filterStatus !== "all" && report.status !== filterStatus) {
      return false
    }
    
    // Reporter filter
    if (filterReporter !== "all" && report.reportedBy !== filterReporter) {
      return false
    }
    
    // Date filter
    if (filterDate !== "all") {
      const reportDate = new Date(report.date || report.createdAt)
      const now = new Date()
      
      switch (filterDate) {
        case "today":
          if (reportDate.toDateString() !== now.toDateString()) return false
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (reportDate < weekAgo) return false
          break
        case "month":
          if (reportDate.getMonth() !== now.getMonth() || reportDate.getFullYear() !== now.getFullYear()) return false
          break
      }
    }
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        report.id?.toLowerCase().includes(query) ||
        report.reportedBy?.toLowerCase().includes(query) ||
        report.status?.toLowerCase().includes(query)
      )
    }
    
    return true
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Get unique reporters for filter dropdown
  const uniqueReporters = [...new Set(reports.map(r => r.reportedBy))].filter(Boolean)

  const handlePDFExport = (report: any, element: HTMLElement | null) => {
    if (!element) return
    printReportElement(element, `Report-${report?.id || "export"}`)
  }

  const renderDashboardContent = () => (
    <>
      <div className="mb-3 sm:mb-4 mt-1 sm:mt-2">
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <Card className="card-brand card-elevated" sx={{ p: { xs: 1, sm: 2.5 }, gap: { xs: 0.5, sm: 1.5 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Reports
              <TrendingUp size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold text-foreground">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated" sx={{ p: { xs: 1, sm: 2.5 }, gap: { xs: 0.5, sm: 1.5 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Employees
              <PeopleIcon sx={{ fontSize: 16, color: "var(--accent)" }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold text-foreground">
              {employeeCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total employees</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated" sx={{ p: { xs: 1, sm: 2.5 }, gap: { xs: 0.5, sm: 1.5 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Active Equipment
              <Settings size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold text-foreground">
              {activeMachineCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active machines</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated" sx={{ p: { xs: 1, sm: 2.5 }, gap: { xs: 0.5, sm: 1.5 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Submitted Reports
              <Users size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg font-bold text-foreground">
              {reports.filter(r => r.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-4 sm:pb-6">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10"
              variant="outline"
              onClick={() => setActiveTab("reports")}
            >
              <Download size={14} className="mr-2" />
              Reports
            </Button>
            <Button
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10"
              variant="outline"
              onClick={() => setActiveTab("employees")}
            >
              <UserPlus size={14} className="mr-2" />
              Employees
            </Button>
            <Button
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10"
              variant="outline"
              onClick={() => setActiveTab("machines")}
            >
              <Settings size={14} className="mr-2" />
              Equipment
            </Button>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {reports
                .filter((report) => report.status !== 'draft')
                .sort((a, b) => {
                  const aTime = new Date(a.submittedAt || a.createdAt).getTime()
                  const bTime = new Date(b.submittedAt || b.createdAt).getTime()
                  return bTime - aTime
                })
                .slice(0, 3)
                .map((report, index) => {
                  const submittedAt = new Date(report.submittedAt || report.createdAt)
                  const statusLabel = report.status === 'submitted' ? 'submitted' : report.status
                  return (
                    <div key={report.id || index} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-none shrink-0"></div>
                      <span className="line-clamp-2">
                        Report {report.id} {statusLabel} by {report.reportedBy} • {submittedAt.toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
              {reports.filter((report) => report.status !== 'draft').length === 0 && (
                <div className="text-xs sm:text-sm text-muted-foreground">No recent report submissions</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Database</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-none"></div>
                  <span className="text-xs sm:text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">API Services</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-none"></div>
                  <span className="text-xs sm:text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Storage</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-none"></div>
                  <span className="text-xs sm:text-sm text-yellow-600">75% Used</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderReportsContent = () => (
    <>
      <div className="mb-3 sm:mb-4 mt-1 sm:mt-2">
      </div>

      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <Button
          variant={reportsView === "production" ? "default" : "outline"}
          onClick={() => setReportsView("production")}
          className="text-xs sm:text-sm"
        >
          Production Reports
        </Button>
        <Button
          variant={reportsView === "attendance" ? "default" : "outline"}
          onClick={() => {
            setSelectedReport(null)
            setReportsView("attendance")
          }}
          className="text-xs sm:text-sm"
        >
          Attendance
        </Button>
      </div>

      {reportsView === "attendance" ? (
        <AttendanceReportsView initialDate={attendanceFocusDate} />
      ) : (
        <>
      {/* Filters Section */}
      <Card className="card-brand card-elevated card-filter-tight mb-4 sm:mb-6">
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
        
        {/* Always visible search bar */}
        <CardContent className="pt-0">
          <div className="relative">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-sm"
            />
            <SearchIcon sx={{ fontSize: 16 }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          
          {/* Collapsible filter section */}
          {filtersExpanded && (
            <div className="space-y-4 mt-4">
              {/* Filter dropdowns in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-1">
                  <label htmlFor="admin-report-status" className="text-xs font-medium text-muted-foreground">Status</label>
                  <select
                    id="admin-report-status"
                    aria-label="Report status filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      filterStatus !== "all" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="all">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="reviewed">Reviewed</option>
        <option value="approved">Approved</option>
                  </select>
                </div>

                {/* Reporter Filter */}
                <div className="space-y-1">
                  <label htmlFor="admin-report-reporter" className="text-xs font-medium text-muted-foreground">Reporter</label>
                  <select
                    id="admin-report-reporter"
                    aria-label="Report reporter filter"
                    value={filterReporter}
                    onChange={(e) => setFilterReporter(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      filterReporter !== "all" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="all">All Reporters</option>
                    {uniqueReporters.map(reporter => (
                      <option key={reporter} value={reporter}>{reporter}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div className="space-y-1">
                  <label htmlFor="admin-report-date" className="text-xs font-medium text-muted-foreground">Date Range</label>
                  <select
                    id="admin-report-date"
                    aria-label="Report date range filter"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                      filterDate !== "all" 
                        ? "bg-green-50 text-green-800" 
                        : "bg-background"
                    }`}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterStatus("all")
                      setFilterReporter("all")
                      setFilterDate("all")
                      setSearchQuery("")
                    }}
                    className="text-sm w-full h-10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="pt-4 border-t text-sm text-muted-foreground">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
            </div>
          )}
          
          {/* Compact results count when collapsed */}
          {!filtersExpanded && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredReports.length} of {reports.length} reports
              {(filterStatus !== "all" || filterReporter !== "all" || filterDate !== "all" || searchQuery) && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-none">
                  Filtered
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card className="card-brand card-elevated">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No reports found matching your filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus("all")
                setFilterReporter("all")
                setFilterDate("all")
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredReports.map((report, index) => {
            const style = reportCardStyles[index % reportCardStyles.length]
            return (
            <Card 
              key={report.id} 
              className={`card-brand card-elevated card-report-compact cursor-pointer transition-all hover:shadow-lg min-h-[220px] flex flex-col relative overflow-hidden border ${style.card} ${
                selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleReportSelect(report)}
            >
              <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
              <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
              <CardHeader className="p-3 sm:p-4 pb-1 flex-shrink-0 card-report-header relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-semibold line-clamp-1">
                      Report {report.id}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-1">
                      By {report.reportedBy}
                    </CardDescription>
                  </div>
                  {report.status !== 'submitted' && (
                    <div className={`px-1.5 py-0.5 rounded-none text-[10px] font-medium whitespace-nowrap flex-shrink-0 ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-2 flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <p className="line-clamp-1">
                      <span className="font-medium">Date:</span> {report.date}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-[10px] sm:text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Products:</span>{" "}
                      {report.dailyProduction?.products?.length || 0}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Incidents:</span>{" "}
                      {report.incidentReport?.incidentType && report.incidentReport.incidentType !== 'None' ? '1' : '0'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-[10px] sm:text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReportSelect(report)
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 14, marginRight: 1 }} />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}

      {/* Report Detail Modal/Panel */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl h-[90vh] bg-white rounded-none shadow-xl overflow-hidden">
            <ScrollableReportView 
              report={selectedReport} 
              onBack={() => setSelectedReport(null)}
              onPDFExport={handlePDFExport}
              showComments={true}
              user={user}
              comments={comments}
              onAddComment={handleAddComment}
            />
          </div>
        </div>
      )}
        </>
      )}
    </>
  )

  return (
    <EnterpriseLayout
      user={user}
      onLogout={onLogout}
      onGoHome={onGoHome}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title="Admin Dashboard"
      subtitle="Manage reports, employees, and system settings"
    >
      {activeTab === "dashboard" && renderDashboardContent()}
      {activeTab === "reports" && renderReportsContent()}
      {activeTab === "analytics" && (
        <div className="space-y-6 mt-2">
          <AnalyticsDashboard reports={reports} />
        </div>
      )}
      {activeTab === "employees" && (
        <div className="space-y-6 mt-2">
          <EmployeeManagement />
        </div>
      )}
      {activeTab === "machines" && (
        <div className="space-y-6 mt-2">
          <div className="mb-4">
          </div>
          <EquipmentDashboard />
        </div>
      )}
      {activeTab === "alerts" && (
        <div className="space-y-6 mt-2">
          <div className="mb-4">
            {/* Placeholder for alerts management */}
          </div>
          <div className="text-center py-8">
          </div>
        </div>
      )}
    </EnterpriseLayout>
  )
}
