"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Download, Play, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PeopleIcon from "@mui/icons-material/People"
import WarningIcon from "@mui/icons-material/Warning"
import DownloadIcon from "@mui/icons-material/Download"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SendIcon from "@mui/icons-material/Send"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"

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
  const [activeReportTab, setActiveReportTab] = useState("summary")
  const [activeTab, setActiveTab] = useState("reports")
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterReporter, setFilterReporter] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

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
  })

  // Get unique reporters for filter dropdown
  const uniqueReporters = [...new Set(allReports.map(r => r.reportedBy))].filter(Boolean)

  const handleAddComment = (reportId: string) => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: `${Date.now()}`,
        author: user?.name || "Anonymous",
        text: commentText,
        timestamp: new Date().toLocaleTimeString(),
        role: "viewer",
      }
      setComments((prev) => ({
        ...prev,
        [reportId]: [...(prev[reportId] || []), newComment],
      }))
      setCommentText("")
    }
  }

  // Reset tab when selecting a new report
  const handleReportSelect = (report: any) => {
    setSelectedReport(report)
    setActiveReportTab("summary") // Reset to summary tab when selecting a new report
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
Overall Efficiency: ${report?.dailyProduction?.overallEfficiency || "0"}%

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

  const renderReportsContent = () => (
    <>
      <div className="mb-6 sm:mb-8 mt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-contrast mb-1 sm:mb-2">Reports Dashboard</h1>
        <p className="text-xs sm:text-base text-muted-foreground">View and analyze production reports</p>
      </div>

      {/* Filters Section */}
      <Card className="card-brand card-elevated mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 20 }} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            {/* Reporter Filter */}
            <Select value={filterReporter} onValueChange={setFilterReporter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Reporters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reporters</SelectItem>
                {uniqueReporters.map(reporter => (
                  <SelectItem key={reporter} value={reporter}>{reporter}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus("all")
                setFilterReporter("all")
                setFilterDate("all")
                setSearchQuery("")
              }}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredReports.length} of {allReports.length} reports
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card 
              key={report.id} 
              className={`card-brand card-elevated cursor-pointer transition-all hover:shadow-lg ${
                selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleReportSelect(report)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold truncate">
                      Report {report.id}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {report.reportedBy}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'approved' ? 'bg-green-100 text-green-800' :
                    report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>Date: {report.date}</p>
                    {report.dailyProduction?.overallEfficiency && (
                      <p>Efficiency: {report.dailyProduction.overallEfficiency}%</p>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Products</p>
                      <p className="font-semibold">
                        {report.dailyProduction?.products?.length || 0}
                      </p>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <p className="text-muted-foreground">Incidents</p>
                      <p className="font-semibold">
                        {report.incidentReport?.incidentType !== 'None' ? '1' : '0'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePDFExport(report)
                    }}
                  >
                    <DownloadIcon sx={{ fontSize: 14, marginRight: 1 }} />
                    Export PDF
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
          <Card className="card-brand w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3 border-b">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg">Report {selectedReport.id}</CardTitle>
                <CardDescription className="text-sm">
                  Submitted by {selectedReport.reportedBy} on {selectedReport.date}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePDFExport(selectedReport)}
                  className="gap-2"
                >
                  <DownloadIcon sx={{ fontSize: 16 }} />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="w-full">
                  <TabsList className="w-full bg-muted text-xs overflow-x-auto overflow-y-hidden">
                    <TabsTrigger value="summary" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="power" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Power
                    </TabsTrigger>
                    <TabsTrigger value="production" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Production
                    </TabsTrigger>
                    <TabsTrigger value="incident" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Incident
                    </TabsTrigger>
                    <TabsTrigger value="visuals" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Visuals
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="text-xs flex-shrink-0 min-w-fit h-8">
                      Comments
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-3 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Report ID</p>
                        <p className="font-mono text-sm font-semibold">{selectedReport.id}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-semibold text-sm text-primary">{selectedReport.status}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="power" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Power Interruptions</p>
                      {selectedReport.powerInterruptions?.noInterruptions ? (
                        <p className="text-sm text-green-600">No interruptions recorded</p>
                      ) : (
                        <div className="text-sm space-y-1">
                          <p>Duration: {selectedReport.powerInterruptions?.duration} minutes</p>
                          <p>Affected Machines: {selectedReport.powerInterruptions?.affectedMachines?.join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="production" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Overall Efficiency</p>
                        <p className="text-2xl font-bold text-primary">
                          {selectedReport.dailyProduction?.overallEfficiency}%
                        </p>
                      </div>
                      {selectedReport.dailyProduction?.products &&
                        selectedReport.dailyProduction.products.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-medium text-sm">Production Details</p>
                            {selectedReport.dailyProduction.products.map((product: any, idx: number) => (
                              <div key={idx} className="border border-border/50 rounded-lg p-3 space-y-2">
                                <p className="font-medium text-sm">{product.productName}</p>
                                <div className="text-xs space-y-1 text-muted-foreground">
                                  <p>Quantity: {product.quantity} {product.unit}</p>
                                  <p>Machines: {product.machinesUsed?.join(", ")}</p>
                                  <p>Employees: {product.employees}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="incident" className="space-y-3 mt-4">
                    <div className="text-sm space-y-2">
                      <p>
                        Type:{" "}
                        <span className="font-semibold capitalize">
                          {selectedReport.incidentReport?.incidentType || "None"}
                        </span>
                      </p>
                      <p>
                        Severity:{" "}
                        <span className="font-semibold">
                          {selectedReport.incidentReport?.severity || "None reported"}
                        </span>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="visuals" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Site Visual Documentation</p>
                      {selectedReport.siteVisuals?.media && selectedReport.siteVisuals.media.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedReport.siteVisuals.media.map((file: any, idx: number) => (
                            <div
                              key={idx}
                              className="border border-border rounded-lg overflow-hidden bg-muted hover:shadow-md transition-shadow"
                            >
                              {file.type === "image" ? (
                                <>
                                  <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                    <img
                                      src={file.url || "/placeholder.svg"}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-2 border-t border-border bg-card">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">Image</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                    <PlayArrowIcon sx={{ fontSize: 32, color: "rgba(255,255,255,0.6)" }} />
                                  </div>
                                  <div className="p-2 border-t border-border bg-card">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">Video</p>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No media files uploaded
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-3 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-3 max-h-64 overflow-y-auto border-brand-subtle rounded-lg p-4 bg-brand-surface">
                        {comments[selectedReport.id]?.length > 0 ? (
                          comments[selectedReport.id].map((comment) => (
                            <div key={comment.id} className="p-3 bg-card rounded-lg border-brand-subtle">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-medium text-sm">{comment.author}</p>
                                <p className="text-xs text-muted-foreground flex-shrink-0">{comment.timestamp}</p>
                              </div>
                              <p className="text-sm text-foreground">{comment.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add your comment..."
                          value={commentText}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
                          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddComment(selectedReport.id)}
                          className="flex-1 text-sm focus-brand"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(selectedReport.id)}
                          className="px-3"
                        >
                          <SendIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )

  const renderReportsWithMetrics = () => (
    <>
      <div className="mb-6 sm:mb-8 mt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-contrast mb-1 sm:mb-2">Reports Dashboard</h1>
        <p className="text-xs sm:text-base text-muted-foreground">View and analyze production reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Reports
              <TrendingUp size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{allReports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Active Reporters
              <PeopleIcon sx={{ fontSize: 16, color: "var(--accent)" }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {new Set(allReports.map((r) => r.reportedBy)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Avg Efficiency
              <WarningIcon sx={{ fontSize: 16, color: "#ef4444" }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {(
                allReports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) /
                allReports.length
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall production</p>
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
                className={`w-full text-left p-3 rounded-lg border transition-colors touch-target ${
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
          <Card className="card-brand lg:col-span-2 card-elevated">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Report {selectedReport.id}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Submitted by {selectedReport.reportedBy} on {selectedReport.date}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePDFExport(selectedReport)}
                  className="gap-2 bg-transparent text-xs touch-target w-full sm:w-auto border-brand-subtle hover-brand focus-brand"
                >
                  <DownloadIcon sx={{ fontSize: 16 }} />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="w-full">
                <TabsList className="w-full bg-muted text-xs overflow-x-auto overflow-y-hidden">
                  <TabsTrigger value="summary" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="power" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Power
                  </TabsTrigger>
                  <TabsTrigger value="production" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Production
                  </TabsTrigger>
                  <TabsTrigger value="incident" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Incident
                  </TabsTrigger>
                  <TabsTrigger value="visuals" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Visuals
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs flex-shrink-0 min-w-fit h-8">
                    Comments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-3 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Report ID</p>
                      <p className="font-mono text-xs sm:text-sm font-semibold">{selectedReport.id}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold text-xs sm:text-sm text-primary">{selectedReport.status}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="power" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Power Interruptions</p>
                    {selectedReport.powerInterruptions?.noInterruptions ? (
                      <p className="text-sm text-green-600">No interruptions recorded</p>
                    ) : (
                      <div className="text-xs sm:text-sm space-y-1">
                        <p>Duration: {selectedReport.powerInterruptions?.duration} minutes</p>
                        <p>Affected Machines: {selectedReport.powerInterruptions?.affectedMachines?.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="production" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Overall Efficiency</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {selectedReport.dailyProduction?.overallEfficiency}%
                      </p>
                    </div>
                    {selectedReport.dailyProduction?.products &&
                      selectedReport.dailyProduction.products.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-xs sm:text-sm">Production Details</p>
                          {selectedReport.dailyProduction.products.map((product: any, idx: number) => (
                            <div key={idx} className="border border-border/50 rounded-lg p-3 space-y-2">
                              <p className="font-medium text-xs sm:text-sm">{product.productName}</p>
                              <div className="text-xs space-y-1 text-muted-foreground">
                                <p>
                                  Quantity: {product.quantity} {product.unit}
                                </p>
                                <p>Machines: {product.machinesUsed?.join(", ")}</p>
                                <p>Employees: {product.employees}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </TabsContent>

                <TabsContent value="incident" className="space-y-3 mt-4">
                  <div className="text-xs sm:text-sm space-y-2">
                    <p>
                      Type:{" "}
                      <span className="font-semibold capitalize">
                        {selectedReport.incidentReport?.incidentType || "None"}
                      </span>
                    </p>
                    <p>
                      Severity:{" "}
                      <span className="font-semibold">
                        {selectedReport.incidentReport?.severity || "None reported"}
                      </span>
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="visuals" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <p className="font-medium text-sm">Site Visual Documentation</p>
                    {selectedReport.siteVisuals?.media && selectedReport.siteVisuals.media.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {selectedReport.siteVisuals.media.map((file: any, idx: number) => (
                          <div
                            key={idx}
                            className="border border-border rounded-lg overflow-hidden bg-muted hover:shadow-md transition-shadow"
                          >
                            {file.type === "image" ? (
                              <>
                                <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                  <img
                                    src={file.url || "/placeholder.svg"}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-2 border-t border-border bg-card">
                                  <p className="text-xs font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">Image</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                  <PlayArrowIcon sx={{ fontSize: 32, color: "rgba(255,255,255,0.6)" }} />
                                </div>
                                <div className="p-2 border-t border-border bg-card">
                                  <p className="text-xs font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">Video</p>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                        No media files uploaded
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-3 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto border-brand-subtle rounded-lg p-3 sm:p-4 bg-brand-surface">
                      {comments[selectedReport.id]?.length > 0 ? (
                        comments[selectedReport.id].map((comment) => (
                          <div key={comment.id} className="p-2 sm:p-3 bg-card rounded-lg border-brand-subtle">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="font-medium text-xs sm:text-sm">{comment.author}</p>
                              <p className="text-xs text-muted-foreground flex-shrink-0">{comment.timestamp}</p>
                            </div>
                            <p className="text-xs sm:text-sm text-foreground">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add your comment..."
                        value={commentText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddComment(selectedReport.id)}
                        className="flex-1 text-xs sm:text-sm focus-brand"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(selectedReport.id)}
                        className="px-2 sm:px-3"
                      >
                        <SendIcon sx={{ fontSize: 16 }} />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Analytics</h1>
            <p className="text-muted-foreground">Production data insights and trends</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-brand card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{allReports.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
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
            <Card className="card-brand card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Avg Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {allReports.length > 0 ? (
                    allReports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) /
                    allReports.length
                  ).toFixed(1) : '0'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Production</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">Active Reporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
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
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Overview Dashboard</h1>
            <p className="text-muted-foreground">Production reporting overview and insights</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-brand card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {allReports.filter(r => {
                    const reportDate = new Date(r.createdAt)
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    return reportDate >= yesterday
                  }).length}
                </div>
                <p className="text-sm text-muted-foreground">Reports in last 24h</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">Active</div>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setActiveTab("reports")}
                  className="w-full text-sm"
                  size="sm"
                >
                  View Reports
                </Button>
                <Button 
                  onClick={() => setActiveTab("analytics")}
                  variant="outline"
                  className="w-full text-sm"
                  size="sm"
                >
                  Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Show reports with metrics when accessed from dashboard */}
          {renderReportsWithMetrics()}
        </div>
      )}
    </EnterpriseLayout>
  )
}
