"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Add, Visibility, Power, Warning, People } from "@mui/icons-material"
import { ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import StandalonePowerInterruption from "@/components/reporter/standalone-power-interruption"
import StandaloneDailyProduction from "@/components/reporter/standalone-daily-production"
import StandaloneIncidentReport from "@/components/reporter/standalone-incident-report"
import StandaloneSiteVisuals from "@/components/reporter/standalone-site-visuals"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"
import AttendanceEntry from "@/components/reporter/attendance-entry"
import IncidentTaskBoard from "@/components/tasks/incident-task-board"

interface ReporterDashboardProps {
  user: any
  onLogout: () => void
  onGoHome?: () => void
}

export default function ReporterDashboard({ user, onLogout, onGoHome }: ReporterDashboardProps) {
  const [showPowerInterruption, setShowPowerInterruption] = useState(false)
  const [showDailyProduction, setShowDailyProduction] = useState(false)
  const [showIncidentReport, setShowIncidentReport] = useState(false)
  const [showSiteVisuals, setShowSiteVisuals] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const powerInterruptionRef = useRef<HTMLDivElement | null>(null)
  const dailyProductionRef = useRef<HTMLDivElement | null>(null)
  const incidentReportRef = useRef<HTMLDivElement | null>(null)
  const siteVisualsRef = useRef<HTMLDivElement | null>(null)
  
  // Filter states for reports page
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [draftReportId, setDraftReportId] = useState<string | null>(null)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
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
      }
    }

    if (user?.email) {
      fetchReports()
    }
  }, [user?.email])

  useEffect(() => {
    if (!user?.email || typeof window === "undefined") return
    const storedId = localStorage.getItem(`ikoapp:draftReportId:${user.email}`)
    if (storedId) {
      setDraftReportId(storedId)
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

  const persistDraftId = (reportId: string | null) => {
    if (!user?.email || typeof window === "undefined") return
    const key = `ikoapp:draftReportId:${user.email}`
    if (reportId) {
      localStorage.setItem(key, reportId)
    } else {
      localStorage.removeItem(key)
    }
  }

  const ensureDraftReport = async () => {
    if (draftReportId) {
      try {
        const existingResponse = await fetch(`/api/reports/${draftReportId}`)
        if (existingResponse.ok) {
          const existingReport = await existingResponse.json()
          if (existingReport?.status === "draft") {
            return draftReportId
          }
        }
      } catch (error) {
        console.error("Error validating draft report:", error)
      }
      setDraftReportId(null)
      persistDraftId(null)
    }
    if (!user?.email) throw new Error("User not available")
    try {
      const draftResponse = await fetch(`/api/reports?reportedByEmail=${encodeURIComponent(user.email)}&status=draft&limit=1`)
      if (draftResponse.ok) {
        const draftData = await draftResponse.json()
        const existingDraft = draftData.reports?.[0]
        if (existingDraft?.id) {
          setDraftReportId(existingDraft.id)
          persistDraftId(existingDraft.id)
          return existingDraft.id
        }
      }

      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          reportedBy: user?.name,
          reportedByEmail: user?.email
        })
      })

      if (!createResponse.ok) {
        throw new Error("Failed to create draft report")
      }

      const createdDraft = await createResponse.json()
      if (createdDraft?.id) {
        setDraftReportId(createdDraft.id)
        persistDraftId(createdDraft.id)
        return createdDraft.id
      }

      throw new Error("Draft report not created")
    } catch (error) {
      throw error
    }
  };

  const isDraftComplete = (report: any) => {
    if (!report) return false
    const powerData = report.powerInterruptions || report.powerInterruptionId || {}
    const powerNoIssues =
      powerData?.noInterruptions === true ||
      powerData?.noInterruptions === "true" ||
      powerData?.noInterruptions === "yes"
    const powerHasEntries = Array.isArray(powerData?.interruptions) && powerData.interruptions.length > 0
    const powerLegacy = !!(powerData?.occurredAt || powerData?.duration || (Array.isArray(powerData?.affectedMachines) && powerData.affectedMachines.length > 0))
    const powerComplete = powerNoIssues || powerHasEntries || powerLegacy || !!report.powerInterruptionId

    const productionData = report.dailyProduction || report.dailyProductionId
    const productionComplete =
      (Array.isArray(productionData?.products) && productionData.products.length > 0) ||
      !!report.dailyProductionId

    const incidentData = report.incidentReport || report.incidentReportId
    const incidentComplete = !!report.incidentReportId || (
      !!incidentData && (
        incidentData.hasIncident === "no" ||
        incidentData.noIncidents === true ||
        (incidentData.hasIncident === "yes" && incidentData.incidentType && incidentData.description)
      )
    )

    const visualsData = report.siteVisuals || report.siteVisualId
    const visualsComplete =
      (Array.isArray(visualsData?.media) && visualsData.media.length > 0) ||
      (Array.isArray(visualsData?.photos) && visualsData.photos.length > 0) ||
      !!report.siteVisualId

    return powerComplete && productionComplete && incidentComplete && visualsComplete
  }

  const getDraftReport = () => {
    if (!reports.length) return null
    if (draftReportId) {
      const storedReport = reports.find((report) => report.id === draftReportId)
      return storedReport?.status === "draft" ? storedReport : null
    }
    return reports.find((report) => report.status === "draft") || null
  }

  const handleViewReport = (report: any) => {
    if (!report?.id) {
      setSelectedReport(report)
      return
    }
    fetch(`/api/reports/${report.id}`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json()
          setSelectedReport(data)
        } else {
          setSelectedReport(report)
        }
      })
      .catch(() => setSelectedReport(report))
  }

  const handleBackToReports = () => {
    setSelectedReport(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset all form states when changing tabs
    setShowPowerInterruption(false)
    setShowDailyProduction(false)
    setShowIncidentReport(false)
    setShowSiteVisuals(false)
    setSelectedReport(null)
    
    // Reset filters when switching to reports tab
    if (tab === "reports") {
      setDateFilter("all")
      setStatusFilter("all")
      setSortBy("newest")
    }
  }

  // Helper function to close all forms
  const closeAllForms = () => {
    setShowPowerInterruption(false)
    setShowDailyProduction(false)
    setShowIncidentReport(false)
    setShowSiteVisuals(false)
    setSelectedReport(null)
  }

  // Modified handlers to ensure only one form shows at a time
  const handleShowPowerInterruption = () => {
    closeAllForms()
    ensureDraftReport()
      .then((draftId) => setActiveReportId(draftId))
      .then(() => {
        setShowPowerInterruption(true)
        requestAnimationFrame(() => powerInterruptionRef.current?.scrollIntoView({ behavior: "auto", block: "start" }))
      })
      .catch(() => toast.error("Unable to create draft report"))
  }

  const handleShowDailyProduction = () => {
    closeAllForms()
    ensureDraftReport()
      .then((draftId) => setActiveReportId(draftId))
      .then(() => {
        setShowDailyProduction(true)
        requestAnimationFrame(() => dailyProductionRef.current?.scrollIntoView({ behavior: "auto", block: "start" }))
      })
      .catch(() => toast.error("Unable to create draft report"))
  }

  const handleShowIncidentReport = () => {
    closeAllForms()
    ensureDraftReport()
      .then((draftId) => setActiveReportId(draftId))
      .then(() => {
        setShowIncidentReport(true)
        requestAnimationFrame(() => incidentReportRef.current?.scrollIntoView({ behavior: "auto", block: "start" }))
      })
      .catch(() => toast.error("Unable to create draft report"))
  }


  const handleShowSiteVisuals = () => {
    closeAllForms()
    ensureDraftReport()
      .then((draftId) => setActiveReportId(draftId))
      .then(() => {
        setShowSiteVisuals(true)
        requestAnimationFrame(() => siteVisualsRef.current?.scrollIntoView({ behavior: "auto", block: "start" }))
      })
      .catch(() => toast.error("Unable to create draft report"))
  }

  const handleDraftSaved = async () => {
    await refreshReports()
    toast.success("Saved to draft")
  }

  const handleSubmitDraft = async (reportId: string) => {
    try {
      const targetReport = selectedReport || reports.find((report) => report.id === reportId)
      if (!isDraftComplete(targetReport)) {
        toast.error("Complete all sections before submitting")
        return
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted' })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit report")
      }

      await refreshReports()
      if (draftReportId === reportId) {
        setDraftReportId(null)
        persistDraftId(null)
      }
      setSelectedReport(null)
      toast.success("Report submitted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report")
    }
  }

  const handleContinueDraft = async () => {
    try {
      const existingDraft = getDraftReport()
      if (existingDraft) {
        const response = await fetch(`/api/reports/${existingDraft.id}`)
        if (!response.ok) {
          setSelectedReport(existingDraft)
          return
        }
        const report = await response.json()
        setSelectedReport(report)
        return
      }

      const draftId = await ensureDraftReport()
      const response = await fetch(`/api/reports/${draftId}`)
      if (!response.ok) {
        throw new Error("Failed to load draft report")
      }
      const report = await response.json()
      setSelectedReport(report)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open draft report")
    }
  }

  const handleDeleteDraft = async () => {
    const existingDraft = getDraftReport()
    const targetId = existingDraft?.id || draftReportId
    if (!targetId) {
      toast.error("No draft report found")
      return
    }
    if (typeof window !== "undefined" && !window.confirm("Delete this draft report? This cannot be undone.")) {
      return
    }
    try {
      const response = await fetch(`/api/reports/${targetId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete draft report")
      }
      setDraftReportId(null)
      persistDraftId(null)
      setSelectedReport(null)
      setActiveReportId(null)
      closeAllForms()
      await refreshReports()
      toast.success("Draft report deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete draft report")
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
      {/* Quick Report Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={handleShowPowerInterruption}
          variant="default"
          className="h-20 flex-col gap-2 bg-primary text-primary-foreground hover:bg-(--brand-green-dark)"
        >
          <Power sx={{ fontSize: 20 }} />
          <span className="text-xs">Report Power Issues</span>
        </Button>

        <Button
          onClick={handleShowSiteVisuals}
          variant="default"
          className="h-20 flex-col gap-2 bg-primary text-primary-foreground hover:bg-(--brand-green-dark)"
        >
          <Visibility sx={{ fontSize: 20 }} />
          <span className="text-xs">Report Visuals</span>
        </Button>

        <Button
          onClick={handleShowDailyProduction}
          variant="default"
          className="h-20 flex-col gap-2 bg-primary text-primary-foreground hover:bg-(--brand-green-dark)"
        >
          <Add sx={{ fontSize: 20 }} />
          <span className="text-xs">Report Production</span>
        </Button>

        <Button
          onClick={handleShowIncidentReport}
          variant="default"
          className="h-20 flex-col gap-2 bg-primary text-primary-foreground hover:bg-(--brand-green-dark)"
        >
          <Warning sx={{ fontSize: 20 }} />
          <span className="text-xs">Report Incident</span>
        </Button>

      </div>

      {(draftReportId || getDraftReport()) && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleContinueDraft}
            className="gap-2 border-brand-subtle hover-brand"
          >
            Continue Draft
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteDraft}
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            Delete Draft
          </Button>
        </div>
      )}

      {/* Show forms within the dashboard */}
      {showPowerInterruption && (
        <div className="mb-8 scroll-mt-24" ref={powerInterruptionRef}>
          <StandalonePowerInterruption
            user={user}
            onBack={() => setShowPowerInterruption(false)}
            reportId={activeReportId || ""}
            onSaved={handleDraftSaved}
          />
        </div>
      )}

      {showDailyProduction && (
        <div className="mb-8 scroll-mt-24" ref={dailyProductionRef}>
          <StandaloneDailyProduction
            user={user}
            onBack={() => setShowDailyProduction(false)}
            reportId={activeReportId || ""}
            onSaved={handleDraftSaved}
          />
        </div>
      )}

      {showIncidentReport && (
        <div className="mb-8 scroll-mt-24" ref={incidentReportRef}>
          <StandaloneIncidentReport
            user={user}
            onBack={() => setShowIncidentReport(false)}
            reportId={activeReportId || ""}
            onSaved={handleDraftSaved}
          />
        </div>
      )}


      {showSiteVisuals && (
        <div className="mb-8 scroll-mt-24" ref={siteVisualsRef}>
          <StandaloneSiteVisuals
            user={user}
            onBack={() => setShowSiteVisuals(false)}
            reportId={activeReportId || ""}
            onSaved={handleDraftSaved}
          />
        </div>
      )}

      {selectedReport && (
        <div className="mb-8">
          <ScrollableReportView 
            report={selectedReport} 
            onBack={handleBackToReports}
            showComments={false}
            onSubmitReport={handleSubmitDraft}
            canSubmit={isDraftComplete(selectedReport)}
          />
        </div>
      )}

      {/* Reports Section - only show when no forms are active */}
      {!showPowerInterruption && !showDailyProduction && !showIncidentReport && !showSiteVisuals && !selectedReport && (
        <>
          {reports.length === 0 ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reports.map((report, index) => {
                const style = reportCardStyles[index % reportCardStyles.length]
                return (
                <Card key={report.id} className={`card-brand hover:shadow-lg transition-all duration-300 hover-brand relative overflow-hidden border ${style.card}`}>
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
                  <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
                  <CardHeader className="p-3 sm:p-4 pb-2 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-primary text-base sm:text-lg">{report.date}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Report #{report.id}</CardDescription>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded-none text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${
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
                  <CardContent className="p-3 sm:p-4 pt-2 relative z-10">
                    <div className="space-y-1.5 text-xs sm:text-sm mb-3">
                      <p>
                        <span className="font-medium text-brand-contrast">Power Interruptions:</span>{" "}
                        <span className={report.powerInterruptions?.noInterruptions === true ? "text-green-600" : "text-orange-600"}>
                          {report.powerInterruptions?.noInterruptions === true ? "None" : "Yes"}
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
                      className="w-full gap-2 bg-transparent hover:bg-primary/5 border-brand-subtle hover-brand focus-brand text-xs sm:text-sm h-9"
                    >
                      <Visibility sx={{ fontSize: 16 }} />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )})}
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
        <div className="space-y-6 mt-2">
          {/* Filters Section */}
          <Card className="card-brand card-elevated card-filter-tight mb-6">
            <CardHeader className="card-filter-header">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  Filter Reports
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
            
            {/* Always visible search bar - but for reporter dashboard, we don't have a search, so show compact info */}
            <CardContent className="pt-0">
              {/* Collapsible filter section */}
              {filtersExpanded && (
                <div className="space-y-4">
                  {/* Date Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="reporter-date-filter" className="text-xs font-medium text-muted-foreground">Date Range</label>
                      <select
                        id="reporter-date-filter"
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
                      <label htmlFor="reporter-status-filter" className="text-xs font-medium text-muted-foreground">Status</label>
                      <select
                        id="reporter-status-filter"
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
                      <label htmlFor="reporter-sort-filter" className="text-xs font-medium text-muted-foreground">Sort By</label>
                      <select
                        id="reporter-sort-filter"
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
                  
                  {/* Results Count */}
                  <div className="pt-4 border-t text-sm text-muted-foreground">
                    Showing {filteredReports.length} of {reports.length} reports
                  </div>
                </div>
              )}
              
              {/* Compact results count when collapsed */}
              {!filtersExpanded && (
                <div className="text-sm text-muted-foreground">
                  {filteredReports.length} of {reports.length} reports
                  {(dateFilter !== "all" || statusFilter !== "all" || sortBy !== "newest") && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredReports.map((report, index) => {
                const style = reportCardStyles[index % reportCardStyles.length]
                return (
                <Card key={report.id} className={`card-brand hover:shadow-lg transition-all duration-300 hover-brand relative overflow-hidden border ${style.card}`}>
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${style.bubble}`} />
                  <div className={`pointer-events-none absolute -left-12 bottom-0 h-20 w-20 rounded-full ${style.bubble2}`} />
                  <CardHeader className="p-3 sm:p-4 pb-2 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-primary text-base sm:text-lg">{report.date}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Report #{report.id}</CardDescription>
                      </div>
                      <div className={`px-1.5 py-0.5 rounded-none text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${
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
                  <CardContent className="p-3 sm:p-4 pt-2 relative z-10">
                    <div className="space-y-1.5 text-xs sm:text-sm mb-3">
                      <p>
                        <span className="font-medium text-brand-contrast">Power Interruptions:</span>{" "}
                        <span className={report.powerInterruptions?.noInterruptions === true ? "text-green-600" : "text-orange-600"}>
                          {report.powerInterruptions?.noInterruptions === true ? "None" : "Yes"}
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
                      className="w-full gap-2 bg-transparent hover:bg-primary/5 border-brand-subtle hover-brand focus-brand text-xs sm:text-sm h-9"
                    >
                      <Visibility sx={{ fontSize: 16 }} />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}

          {/* Report Detail View */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-6xl h-[calc(100vh-9rem)] sm:h-[90vh] bg-white rounded-none shadow-xl overflow-hidden">
                <ScrollableReportView 
                  report={selectedReport} 
                  onBack={handleBackToReports}
                  showComments={false}
                  onSubmitReport={handleSubmitDraft}
                  canSubmit={isDraftComplete(selectedReport)}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "dashboard" && renderReportsContent()}
      {activeTab === "tasks" && (
        <div className="space-y-6 mt-2">
          <IncidentTaskBoard user={user} scope="all" />
        </div>
      )}
      {activeTab === "attendance" && (
        <div className="space-y-6 mt-2">
          <AttendanceEntry user={user} />
        </div>
      )}

    </EnterpriseLayout>
  )
}
