"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logout, ChevronRight, Add } from "@mui/icons-material"
import Image from "next/image"
import ReportingFlow from "@/components/reporter/reporting-flow"

interface ReporterDashboardProps {
  user: any
  onLogout: () => void
  onReportSubmit?: (reportData: any) => void
}

export default function ReporterDashboard({ user, onLogout, onReportSubmit }: ReporterDashboardProps) {
  const [showNewReport, setShowNewReport] = useState(false)
  const [localReports, setLocalReports] = useState<any[]>([])
  const reports = localReports; // Declare the reports variable

  const handleReportSubmit = (reportData: any) => {
    const reportWithMetadata = { ...reportData, id: Math.random(), createdAt: new Date() }
    setLocalReports([reportWithMetadata, ...localReports])
    if (onReportSubmit) {
      onReportSubmit(reportData)
    }
    setShowNewReport(false)
  }

  if (showNewReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {/* Header */}
        <header className="bg-card border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="relative w-32 h-14">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
                <Logout sx={{ fontSize: 16 }} />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Reporting Flow - Full Width on Large Screens */}
        <main className="w-full px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setShowNewReport(false)}
              className="mb-6 text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <ReportingFlow onSubmit={handleReportSubmit} user={user} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="relative w-32 h-14">
            <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Production Reports</h1>
            <p className="text-muted-foreground">Submit and manage your production reports</p>
          </div>
          <Button
            onClick={() => setShowNewReport(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 self-start md:self-auto"
          >
            <Add sx={{ fontSize: 16 }} />
            New Report
          </Button>
        </div>

        {localReports.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ChevronRight sx={{ fontSize: 32, color: "var(--muted-foreground)" }} />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No reports yet</h2>
              <p className="text-muted-foreground mb-6">Create your first production report to get started</p>
              <Button
                onClick={() => setShowNewReport(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Add sx={{ fontSize: 16 }} />
                Create First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localReports.map((report) => (
              <Card key={report.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-primary">{report.date}</CardTitle>
                  <CardDescription>Report #{report.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-foreground">Power Interruptions:</span>{" "}
                      {report.powerInterruptions?.noInterruptions ? "None" : "Yes"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Submitted:</span>{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
