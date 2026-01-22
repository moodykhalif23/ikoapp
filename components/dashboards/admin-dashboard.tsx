"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Settings, UserPlus, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import PeopleIcon from "@mui/icons-material/People"
import WarningIcon from "@mui/icons-material/Warning"
import DownloadIcon from "@mui/icons-material/Download"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import EquipmentDashboard from "@/components/equipment/equipment-dashboard"
import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"

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
  
  // Filter states for reports page
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterReporter, setFilterReporter] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsResponse = await fetch('/api/reports?limit=100')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData.reports)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    }

    fetchReports()
  }, [])

  const handleAddComment = (reportId: string, comment: string) => {
    const newComment: Comment = {
      id: `${Date.now()}`,
      author: user?.name || "Admin",
      text: comment,
      timestamp: new Date().toLocaleTimeString(),
      role: "admin",
    }
    setComments((prev) => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), newComment],
    }))
  }

  // Reset when selecting a new report
  const handleReportSelect = (report: any) => {
    setSelectedReport(report)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset selected report when changing tabs
    if (tab !== "reports") {
      setSelectedReport(null)
    }
  }

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
  })

  // Get unique reporters for filter dropdown
  const uniqueReporters = [...new Set(reports.map(r => r.reportedBy))].filter(Boolean)

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
║                    Brand: Energy & Growth Solutions               ║
╚════════════════════════════════════════════════════════════════════╝

REPORT INFORMATION
==================
Report ID: ${report?.id || "N/A"}
Date: ${report?.date || "N/A"}
Reported By: ${report?.reportedBy || "N/A"}
Status: ${report?.status || "N/A"}
Submitted: ${report?.timestamp || "N/A"}

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

DOCUMENT NOTES
==============
This document is a PDF export of the production report.
Images and video files are not included in this export.
For full media documentation, please access the web dashboard.

Generated by IKO BRIQ Reporting System
${new Date().toLocaleString()}
    `.trim()

    const link = document.createElement("a")
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(docContent)}`
    link.download = `Report-${report?.id || "export"}.txt`
    link.click()
  }

  const renderDashboardContent = () => (
    <>
      <div className="mb-4 sm:mb-6 mt-4 sm:mt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
        <p className="text-xs sm:text-base text-muted-foreground">Manage reports, employees, and system settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Total Reports
              <TrendingUp size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{reports.length}</div>
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
              {new Set(reports.map((r) => r.reportedBy)).size}
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
              {reports.length > 0 ? (
                reports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) /
                reports.length
              ).toFixed(1) : '0.0'}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall production</p>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
              Submitted Reports
              <Users size={16} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {reports.filter(r => r.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-4 sm:pb-6">
        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10" variant="outline">
              <UserPlus size={14} className="mr-2" />
              Add New User
            </Button>
            <Button className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10" variant="outline">
              <Settings size={14} className="mr-2" />
              System Settings
            </Button>
            <Button className="w-full justify-start text-xs sm:text-sm h-8 sm:h-10" variant="outline">
              <Download size={14} className="mr-2" />
              Export Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="line-clamp-2">New report submitted by John Doe</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="line-clamp-2">User role updated for Jane Smith</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="line-clamp-2">Equipment maintenance scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-brand card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Database</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">API Services</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm">Storage</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
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
      <div className="mb-4 sm:mb-6 mt-4 sm:mt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-contrast mb-1 sm:mb-2">Reports Management</h1>
        <p className="text-xs sm:text-base text-muted-foreground">View, manage and analyze production reports</p>
      </div>

      {/* Filters Section */}
      <Card className="card-brand card-elevated mb-4 sm:mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 20 }} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search - Full width on top */}
            <div className="relative">
              <SearchIcon sx={{ fontSize: 16 }} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
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
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-4 sm:pb-6">
          {filteredReports.map((report) => (
            <Card 
              key={report.id} 
              className={`card-brand card-elevated cursor-pointer transition-all hover:shadow-lg min-h-[280px] flex flex-col ${
                selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleReportSelect(report)}
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      Report {report.id}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 line-clamp-1">
                      By {report.reportedBy}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'approved' ? 'bg-green-100 text-green-800' :
                    report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 flex-1">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="line-clamp-1">
                      <span className="font-medium">Date:</span> {report.date}
                    </p>
                    {report.dailyProduction?.overallEfficiency && (
                      <p className="line-clamp-1">
                        <span className="font-medium">Efficiency:</span> {report.dailyProduction.overallEfficiency}%
                      </p>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-muted-foreground mb-1">Products</p>
                      <p className="font-semibold text-lg">
                        {report.dailyProduction?.products?.length || 0}
                      </p>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                      <p className="text-muted-foreground mb-1">Incidents</p>
                      <p className="font-semibold text-lg">
                        {report.incidentReport?.incidentType && report.incidentReport.incidentType !== 'None' ? '1' : '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
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
          <div className="w-full max-w-6xl max-h-[90vh] bg-background rounded-lg shadow-xl overflow-hidden">
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
                <div className="text-2xl font-bold text-foreground">{reports.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="card-brand card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-brand-contrast">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {reports.filter(r => {
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
                  {reports.length > 0 ? (
                    reports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) /
                    reports.length
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
                  {new Set(reports.map((r) => r.reportedBy)).size}
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
      {activeTab === "employees" && (
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Employee Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Employee management interface coming soon...</p>
          </div>
        </div>
      )}
      {activeTab === "machines" && (
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Equipment Management</h1>
            <p className="text-muted-foreground">Monitor and manage production equipment</p>
          </div>
          <EquipmentDashboard />
        </div>
      )}
      {activeTab === "alerts" && (
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">System Alerts</h1>
            <p className="text-muted-foreground">Monitor system notifications and alerts</p>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Alert management interface coming soon...</p>
          </div>
        </div>
      )}
    </EnterpriseLayout>
  )
}
