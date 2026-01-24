"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Download, Play, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import PeopleIcon from "@mui/icons-material/People"
import WarningIcon from "@mui/icons-material/Warning"
import DownloadIcon from "@mui/icons-material/Download"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SendIcon from "@mui/icons-material/Send"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ChevronDown, ChevronUp } from "lucide-react"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"
import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import AttendanceReportsView from "@/components/attendance/attendance-reports-view"

interface ViewerDashboardProps {
  user: any
  onLogout: () => void
  reports?: any[]
  onGoHome?: () => void
}

interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
  role: string
}

export default function ViewerDashboard({ user, onLogout, reports: propReports = [], onGoHome }: ViewerDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState("")
  const [activeTab, setActiveTab] = useState("reports")
  const [reportsView, setReportsView] = useState<"production" | "attendance">("production")
  const [attendanceFocusDate, setAttendanceFocusDate] = useState<string | null>(null)
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterReporter, setFilterReporter] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Fetch all submitted reports from database
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports?status=submitted&limit=50')
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports)
        } else {
          console.error('Failed to fetch reports')
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Use reports from database, or empty array if loading
  const allReports = reports

  // Filter reports based on current filters
  const filteredReports = allReports.filter(report => {
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
  const uniqueReporters = [...new Set(allReports.map(r => r.reportedBy))].filter(Boolean)

  const handleAddComment = (reportId: string, comment: string) => {
    const submit = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: user?.name || 'Viewer',
            role: 'viewer',
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

  const handlePDFExport = (report: any) => {
    // Safely extract power interruption details
    const powerInterruptionText =
      report?.powerInterruptions?.noInterruptions === true
        ? "✓ No interruptions recorded"
        : `Duration: ${report?.powerInterruptions?.duration || "N/A"} minutes\nAffected Machines: ${
            Array.isArray(report?.powerInterruptions?.affectedMachines)
              ? report.powerInterruptions.affectedMachines.join(", ")
              : "N/A"
          }`

    // Safely extract products
    const productsText =
      Array.isArray(report?.dailyProduction?.products) && report.dailyProduction.products.length > 0
        ? report.dailyProduction.products
            .map(
              (p: any) =>
                `\nProduct Name: ${p?.productName || "N/A"}
Quantity Produced: ${p?.quantity || "0"} ${p?.unit || "units"}
Machines Used: ${Array.isArray(p?.machinesUsed) ? p.machinesUsed.join(", ") : "N/A"}
Employees Assigned: ${p?.employees || "0"}`,
            )
            .join("\n")
        : "No products recorded"

    const docContent = `
╔════════════════════════════════════════════════════════════════════╗
║                    IKO BRIQ - PRODUCTION REPORT                    ║
║                  Brand: Energy & Growth Solutions                  ║
║              Professional Production Reporting System              ║
╚════════════════════════════════════════════════════════════════════╝

REPORT INFORMATION
==================
Report ID: ${report?.id || "N/A"}
Date: ${report?.date || "N/A"}
Reported By: ${report?.reportedBy || "N/A"}
Status: ${report?.status || "N/A"}
Submitted: ${report?.timestamp || new Date().toLocaleString()}

POWER INTERRUPTIONS
===================
${powerInterruptionText}

DAILY PRODUCTION
================
${productsText}

INCIDENT REPORT
===============
Incident Type: ${report?.incidentReport?.incidentType || "None"}
Severity: ${report?.incidentReport?.severity || "None reported"}

DOCUMENT INFORMATION
====================
This document is a PDF export of the production report.
Images and video files are not included in this export.
For full media documentation, please access the web dashboard.

Generated by IKO BRIQ Reporting System
${new Date().toLocaleString()}

For more information, visit the IKO BRIQ Production Reporting Portal.
    `.trim()

    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(docContent)}`)
    element.setAttribute("download", `Report-${report?.id || "export"}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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

  const renderReportsContent = () => (
    <>
      <div className="mb-2 sm:mb-4 mt-2" />

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
          <Card className="card-brand card-elevated card-filter-tight mb-6">
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
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                          filterStatus !== "all" 
                            ? "bg-green-50 text-green-800" 
                            : "bg-background"
                        }`}
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>

                    {/* Reporter Filter */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Reporter</label>
                      <select
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
                      <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                      <select
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
                    Showing {filteredReports.length} of {allReports.length} reports
                  </div>
                </div>
              )}
              
              {/* Compact results count when collapsed */}
              {!filtersExpanded && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {filteredReports.length} of {allReports.length} reports
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
          {filteredReports.length === 0 ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id} 
                  className={`card-brand card-elevated card-report-compact cursor-pointer transition-all hover:shadow-lg min-h-[260px] flex flex-col ${
                    selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleReportSelect(report)}
                >
                  <CardHeader className="pb-2 flex-shrink-0 card-report-header">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold line-clamp-1">
                          Report {report.id}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1 line-clamp-1">
                          By {report.reportedBy}
                        </CardDescription>
                      </div>
                  {report.status !== 'submitted' && (
                    <div className={`px-2 py-1 rounded-none text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </div>
                  )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="line-clamp-1">
                          <span className="font-medium">Date:</span> {report.date}
                        </p>
                      </div>
                      
                  {/* Quick Stats */}
                  <div className="space-y-1 text-xs">
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

                <div className="mt-3 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
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
              ))}
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

  const renderReportsWithMetrics = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Reports
              <TrendingUp size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{allReports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Active Reporters
              <PeopleIcon sx={{ fontSize: 16, color: "var(--accent)" }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {new Set(allReports.map((r) => r.reportedBy)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Reports
              <WarningIcon sx={{ fontSize: 16, color: "#ef4444" }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {allReports.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Submitted reports</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <Card className="card-brand lg:col-span-1 card-elevated">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Reports</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 sm:max-h-none overflow-y-auto">
            {allReports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleReportSelect(report)}
                className={`w-full text-left p-3 rounded-none border transition-colors touch-target ${
                  selectedReport?.id === report.id
                    ? "bg-primary/10 border-primary"
                    : "border-brand-subtle hover-brand backdrop-blur-sm"
                }`}
              >
                <p className="font-medium text-xs sm:text-sm">{report.id}</p>
                <p className="text-xs text-muted-foreground">{report.reportedBy}</p>
                <p className="text-xs text-muted-foreground">{report.date}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Report Detail */}
        {selectedReport && (
          <div className="card-brand lg:col-span-2 card-elevated rounded-none overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
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
        )}
      </div>
    </>
  )

  return (
    <EnterpriseLayout
      user={user}
      onLogout={onLogout}
      onGoHome={onGoHome}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      title="Viewer Dashboard"
      subtitle="View and analyze production reports"
    >
      {activeTab === "reports" && renderReportsContent()}
      {activeTab === "analytics" && (
        <div className="space-y-6 mt-2">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-1">Analytics</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{allReports.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {allReports.filter(r => {
                    const reportDate = new Date(r.createdAt)
                    const thisMonth = new Date()
                    return reportDate.getMonth() === thisMonth.getMonth() && 
                           reportDate.getFullYear() === thisMonth.getFullYear()
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Reports</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Avg Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {allReports.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total reports</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated" sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Active Reporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {new Set(allReports.map((r) => r.reportedBy)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Contributors</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Detailed analytics charts coming soon...</p>
          </div>
        </div>
      )}
      {activeTab === "dashboard" && (
        <div className="space-y-6 mt-2">
          <div className="mb-2 sm:mb-4" />
          
          {/* Show reports with metrics when accessed from dashboard */}
          {renderReportsWithMetrics()}
        </div>
      )}
    </EnterpriseLayout>
  )
}
