"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logout, ChevronRight, Add, Visibility, Power, ArrowBack, Warning, People, Description } from "@mui/icons-material"
import Image from "next/image"
import ReportingFlow from "@/components/reporter/reporting-flow"
import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import StandalonePowerInterruption from "@/components/reporter/standalone-power-interruption"
import StandaloneDailyProduction from "@/components/reporter/standalone-daily-production"
import StandaloneIncidentReport from "@/components/reporter/standalone-incident-report"
import StandaloneEmployeePlanning from "@/components/reporter/standalone-employee-planning"
import StandaloneSiteVisuals from "@/components/reporter/standalone-site-visuals"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"

interface ReporterDashboardProps {
  user: any
  onLogout: () => void
  onReportSubmit?: (reportData: any) => void
  onGoHome?: () => void
}

export default function ReporterDashboard({ user, onLogout, onReportSubmit, onGoHome }: ReporterDashboardProps) {
  const [showNewReport, setShowNewReport] = useState(false)
  const [showPowerInterruption, setShowPowerInterruption] = useState(false)
  const [showDailyProduction, setShowDailyProduction] = useState(false)
  const [showIncidentReport, setShowIncidentReport] = useState(false)
  const [showEmployeePlanning, setShowEmployeePlanning] = useState(false)
  const [showSiteVisuals, setShowSiteVisuals] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Filter states for reports page
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Fetch user's reports from database
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/reports?reportedByEmail=${encodeURIComponent(user.email)}`)
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

    if (user?.email) {
      fetchReports()
    }
  }, [user?.email])

  // Refresh reports after submission
  const refreshReports = async () => {
    try {
      const response = await fetch(`/api/reports?reportedByEmail=${encodeURIComponent(user.email)}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Error refreshing reports:', error)
    }
  }

  const handleReportSubmit = async (reportData: any) => {
    // Refresh reports from database
    await refreshReports()
    if (onReportSubmit) {
      onReportSubmit(reportData)
    }
    setShowNewReport(false)
  }

  const handlePowerInterruptionSubmit = async (reportData: any) => {
    // Refresh reports from database
    await refreshReports()
    if (onReportSubmit) {
      onReportSubmit(reportData)
    }
    // Close the form and return to dashboard
    setShowPowerInterruption(false)
    setActiveTab("dashboard")
  }

  const handleFormSubmit = async (reportData: any) => {
    // Refresh reports from database
    await refreshReports()
    if (onReportSubmit) {
      onReportSubmit(reportData)
    }
    // Close all forms and return to dashboard
    setShowDailyProduction(false)
    setShowIncidentReport(false)
    setShowEmployeePlanning(false)
    setShowSiteVisuals(false)
    setActiveTab("dashboard")
  }

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
  }

  const handleBackToReports = () => {
    setSelectedReport(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset all form states when changing tabs
    setShowNewReport(false)
    setShowPowerInterruption(false)
    setShowDailyProduction(false)
    setShowIncidentReport(false)
    setShowEmployeePlanning(false)
    setShowSiteVisuals(false)
    setSelectedReport(null)
    
    // Reset filters when switching to reports tab
    if (tab === "reports") {
      setDateFilter("all")
      setStatusFilter("all")
      setSortBy("newest")
    }
  }

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    // Status filter
    if (statusFilter !== "all" && report.status !== statusFilter) {
      return false
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const reportDate = new Date(report.date || report.createdAt)
      const now = new Date()
      
      switch (dateFilter) {
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
        case "quarter":
          const currentQuarter = Math.floor(now.getMonth() / 3)
          const reportQuarter = Math.floor(reportDate.getMonth() / 3)
          if (reportQuarter !== currentQuarter || reportDate.getFullYear() !== now.getFullYear()) return false
          break
      }
    }
    
    return true
  }).sort((a, b) => {
    // Sort reports based on sortBy selection
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

  const renderReportsContent = () => (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 mt-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Production Reports</h1>
          <p className="text-muted-foreground">Submit individual reports or create a comprehensive report</p>
        </div>
      </div>

      {/* Quick Report Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Button
          onClick={() => setShowPowerInterruption(true)}
          variant="outline"
          className="h-20 flex-col gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
        >
          <Power sx={{ fontSize: 20 }} />
          <span className="text-xs">Power Issue</span>
        </Button>

        <Button
          onClick={() => setShowDailyProduction(true)}
          variant="outline"
          className="h-20 flex-col gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
        >
          <Add sx={{ fontSize: 20 }} />
          <span className="text-xs">Production</span>
        </Button>

        <Button
          onClick={() => setShowIncidentReport(true)}
          variant="outline"
          className="h-20 flex-col gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
        >
          <Warning sx={{ fontSize: 20 }} />
          <span className="text-xs">Incident</span>
        </Button>

        <Button
          onClick={() => setShowEmployeePlanning(true)}
          variant="outline"
          className="h-20 flex-col gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
        >
          <People sx={{ fontSize: 20 }} />
          <span className="text-xs">Planning</span>
        </Button>

        <Button
          onClick={() => setShowSiteVisuals(true)}
          variant="outline"
          className="h-20 flex-col gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
        >
          <Visibility sx={{ fontSize: 20 }} />
          <span className="text-xs">Visuals</span>
        </Button>

        <Button
          onClick={() => setShowNewReport(true)}
          className="h-20 flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <Description sx={{ fontSize: 20 }} />
          <span className="text-xs">Full Report</span>
        </Button>
      </div>

      {/* Show forms within the dashboard */}
      {showPowerInterruption && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowPowerInterruption(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Power Interruption Report</h2>
          </div>
          <StandalonePowerInterruption
            user={user}
            onBack={() => setShowPowerInterruption(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </div>
      )}

      {showDailyProduction && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowDailyProduction(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Daily Production Report</h2>
          </div>
          <StandaloneDailyProduction
            user={user}
            onBack={() => setShowDailyProduction(false)}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {showIncidentReport && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowIncidentReport(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Incident Report</h2>
          </div>
          <StandaloneIncidentReport
            user={user}
            onBack={() => setShowIncidentReport(false)}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {showEmployeePlanning && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowEmployeePlanning(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Employee Planning</h2>
          </div>
          <StandaloneEmployeePlanning
            user={user}
            onBack={() => setShowEmployeePlanning(false)}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {showSiteVisuals && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowSiteVisuals(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Site Visuals</h2>
          </div>
          <StandaloneSiteVisuals
            user={user}
            onBack={() => setShowSiteVisuals(false)}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {showNewReport && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowNewReport(false)}
              className="gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold text-brand-contrast">Comprehensive Report</h2>
          </div>
          <ReportingFlow onSubmit={handleReportSubmit} user={user} />
        </div>
      )}

      {selectedReport && (
        <div className="mb-8">
          <ScrollableReportView 
            report={selectedReport} 
            onBack={handleBackToReports}
            showComments={false}
          />
        </div>
      )}

      {/* Time Clock Section - only show when no forms are active */}
      {!showPowerInterruption && !showDailyProduction && !showIncidentReport && !showEmployeePlanning && !showSiteVisuals && !showNewReport && !selectedReport && (
        <div className="mb-8">
          <TimeClock user={user} onTimeEntryUpdate={() => {}} />
        </div>
      )}

      {/* Reports Section - only show when no forms are active */}
      {!showPowerInterruption && !showDailyProduction && !showIncidentReport && !showEmployeePlanning && !showSiteVisuals && !showNewReport && !selectedReport && (
        <>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-brand-contrast mb-2">Your Reports</h2>
              <p className="text-muted-foreground">Manage your submitted reports</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <Card className="card-brand card-elevated">
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-surface mb-4">
                  <ChevronRight sx={{ fontSize: 32, color: "var(--brand-green)" }} />
                </div>
                <h2 className="text-xl font-semibold text-brand-contrast mb-2">No reports yet</h2>
                <p className="text-muted-foreground mb-6">Create your first production report to get started</p>
                <Button
                  onClick={() => setShowNewReport(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Add sx={{ fontSize: 16 }} />
                  Create First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="card-brand hover:shadow-lg transition-all duration-300 hover-brand">
                  <CardHeader>
                    <CardTitle className="text-primary">{report.date}</CardTitle>
                    <CardDescription>Report #{report.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-medium text-brand-contrast">Power Interruptions:</span>{" "}
                        <span className={report.powerInterruptions?.noInterruptions ? "text-green-600" : "text-orange-600"}>
                          {report.powerInterruptions?.noInterruptions ? "None" : "Yes"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-brand-contrast">Submitted:</span>{" "}
                        <span className="text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-brand-contrast">Products:</span>{" "}
                        <span className="text-primary font-medium">
                          {report.dailyProduction?.products?.length || 0}
                        </span>
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewReport(report)}
                      variant="outline"
                      className="w-full gap-2 bg-transparent hover:bg-primary/5 border-brand-subtle hover-brand focus-brand"
                    >
                      <Visibility sx={{ fontSize: 16 }} />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
      title="Reporter Dashboard"
      subtitle="Submit and manage your production reports"
    >
      {activeTab === "reports" && (
        <div className="space-y-6 mt-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Your Reports</h1>
            <p className="text-muted-foreground">View and manage your submitted reports</p>
          </div>

          {/* Filters Section */}
          <Card className="card-brand card-elevated mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Description sx={{ fontSize: 20 }} />
                Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Date Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                    <select
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
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        statusFilter !== "all" 
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                    <select
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
                      <option value="date">Report Date</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateFilter("all")
                        setStatusFilter("all")
                        setSortBy("newest")
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
                {reports.length === 0 ? (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-surface mb-4">
                      <ChevronRight sx={{ fontSize: 32, color: "var(--brand-green)" }} />
                    </div>
                    <h2 className="text-xl font-semibold text-brand-contrast mb-2">No reports yet</h2>
                    <p className="text-muted-foreground mb-6">Create your first production report to get started</p>
                    <Button
                      onClick={() => {
                        setActiveTab("dashboard")
                        setShowNewReport(true)
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Add sx={{ fontSize: 16 }} />
                      Create First Report
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">No reports found matching your filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateFilter("all")
                        setStatusFilter("all")
                        setSortBy("newest")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="card-brand hover:shadow-lg transition-all duration-300 hover-brand">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-primary">{report.date}</CardTitle>
                        <CardDescription>Report #{report.id}</CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                        report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-medium text-brand-contrast">Power Interruptions:</span>{" "}
                        <span className={report.powerInterruptions?.noInterruptions ? "text-green-600" : "text-orange-600"}>
                          {report.powerInterruptions?.noInterruptions ? "None" : "Yes"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-brand-contrast">Submitted:</span>{" "}
                        <span className="text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-brand-contrast">Products:</span>{" "}
                        <span className="text-primary font-medium">
                          {report.dailyProduction?.products?.length || 0}
                        </span>
                      </p>
                      {report.dailyProduction?.overallEfficiency && (
                        <p>
                          <span className="font-medium text-brand-contrast">Efficiency:</span>{" "}
                          <span className="text-primary font-medium">
                            {report.dailyProduction.overallEfficiency}%
                          </span>
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleViewReport(report)}
                      variant="outline"
                      className="w-full gap-2 bg-transparent hover:bg-primary/5 border-brand-subtle hover-brand focus-brand"
                    >
                      <Visibility sx={{ fontSize: 16 }} />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Report Detail View */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-6xl h-[90vh] bg-background rounded-lg shadow-xl overflow-hidden">
                <ScrollableReportView 
                  report={selectedReport} 
                  onBack={handleBackToReports}
                  showComments={false}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "dashboard" && renderReportsContent()}
    </EnterpriseLayout>
  )
}
