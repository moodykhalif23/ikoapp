"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logout, ChevronRight, Add, Visibility, Power, ArrowBack } from "@mui/icons-material"
import Image from "next/image"
import ReportingFlow from "@/components/reporter/reporting-flow"
import ReportDetailView from "@/components/reporter/report-detail-view"
import StandalonePowerInterruption from "@/components/reporter/standalone-power-interruption"

interface ReporterDashboardProps {
  user: any
  onLogout: () => void
  onReportSubmit?: (reportData: any) => void
}

export default function ReporterDashboard({ user, onLogout, onReportSubmit }: ReporterDashboardProps) {
  const [showNewReport, setShowNewReport] = useState(false)
  const [showPowerInterruption, setShowPowerInterruption] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [localReports, setLocalReports] = useState<any[]>([])
  const [powerInterruptionReports, setPowerInterruptionReports] = useState<any[]>([])
  const reports = localReports; // Declare the reports variable

  const handleReportSubmit = (reportData: any) => {
    const reportWithMetadata = { ...reportData, id: `RPT-${Date.now()}`, createdAt: new Date() }
    setLocalReports([reportWithMetadata, ...localReports])
    if (onReportSubmit) {
      onReportSubmit(reportData)
    }
    setShowNewReport(false)
  }

  const handlePowerInterruptionSubmit = (reportData: any) => {
    const reportWithMetadata = { ...reportData, createdAt: new Date() }
    setPowerInterruptionReports([reportWithMetadata, ...powerInterruptionReports])
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-contrast mb-2">Production Reports</h1>
            <p className="text-muted-foreground">Submit and manage your production reports</p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            <Button
              onClick={() => setShowPowerInterruption(true)}
              variant="outline"
              className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
            >
              <Power sx={{ fontSize: 16 }} />
              Power Interruption
            </Button>
            <Button
              onClick={() => setShowNewReport(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Add sx={{ fontSize: 16 }} />
              New Report
            </Button>
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
      </main>
    </div>
  )
}
