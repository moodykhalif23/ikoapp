"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logout, ChevronRight, Add, Visibility, Power, ArrowBack, Warning, People, Description } from "@mui/icons-material"
import Image from "next/image"
import ReportingFlow from "@/components/reporter/reporting-flow"
import ReportDetailView from "@/components/reporter/report-detail-view"
import StandalonePowerInterruption from "@/components/reporter/standalone-power-interruption"
import StandaloneDailyProduction from "@/components/reporter/standalone-daily-production"
import StandaloneIncidentReport from "@/components/reporter/standalone-incident-report"
import StandaloneEmployeePlanning from "@/components/reporter/standalone-employee-planning"
import StandaloneSiteVisuals from "@/components/reporter/standalone-site-visuals"
import TimeClock from "@/components/time-tracking/time-clock"
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
  }

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
  }

  const handleBackToReports = () => {
    setSelectedReport(null)
  }

  // Show standalone power interruption form
  if (showPowerInterruption) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Power Interruption Form */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <StandalonePowerInterruption
            user={user}
            onBack={() => setShowPowerInterruption(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </main>
      </div>
    )
  }

  // Show standalone daily production form
  if (showDailyProduction) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Daily Production Form */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <StandaloneDailyProduction
            user={user}
            onBack={() => setShowDailyProduction(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </main>
      </div>
    )
  }

  // Show standalone incident report form
  if (showIncidentReport) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Incident Report Form */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <StandaloneIncidentReport
            user={user}
            onBack={() => setShowIncidentReport(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </main>
      </div>
    )
  }

  // Show standalone employee planning form
  if (showEmployeePlanning) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Employee Planning Form */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <StandaloneEmployeePlanning
            user={user}
            onBack={() => setShowEmployeePlanning(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </main>
      </div>
    )
  }

  // Show standalone site visuals form
  if (showSiteVisuals) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Site Visuals Form */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <StandaloneSiteVisuals
            user={user}
            onBack={() => setShowSiteVisuals(false)}
            onSubmit={handlePowerInterruptionSubmit}
          />
        </main>
      </div>
    )
  }

  // Show detailed report view
  if (selectedReport) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Report Detail View */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <ReportDetailView report={selectedReport} onBack={handleBackToReports} />
        </main>
      </div>
    )
  }

  if (showNewReport) {
    return (
      <div className="min-h-screen bg-app-standard">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-brand-contrast">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent border-brand-subtle hover-brand focus-brand">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Reporting Flow - Full Width on Large Screens */}
        <main className="w-full px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setShowNewReport(false)}
              className="mb-6 gap-2 hover:bg-muted"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              Back to Dashboard
            </Button>
            <ReportingFlow onSubmit={handleReportSubmit} user={user} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <EnterpriseLayout
      user={user}
      onLogout={onLogout}
      onGoHome={onGoHome}
      title="Reporter Dashboard"
      subtitle="Submit and manage your production reports"
    >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
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

        {/* Time Clock Section */}
        <div className="mb-8">
          <TimeClock user={user} onTimeEntryUpdate={() => {}} />
        </div>

        {/* Reports Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-brand-contrast mb-2">Your Reports</h2>
            <p className="text-muted-foreground">Manage your submitted reports</p>
          </div>
        </div>

        {localReports.length === 0 ? (
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
            {localReports.map((report) => (
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
    </EnterpriseLayout>
  )
}
