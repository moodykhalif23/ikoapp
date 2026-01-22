"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, TrendingUp, Users, AlertTriangle, Download, Play, Send, Settings, UserPlus, Trash2, Upload, FileText } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import PeopleIcon from "@mui/icons-material/People"
import WarningIcon from "@mui/icons-material/Warning"
import GetAppIcon from "@mui/icons-material/GetApp"
import DownloadIcon from "@mui/icons-material/Download"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SendIcon from "@mui/icons-material/Send"
import SettingsIcon from "@mui/icons-material/Settings"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import TimeTrackingDashboard from "@/components/time-tracking/time-tracking-dashboard"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"
import EquipmentDashboard from "@/components/equipment/equipment-dashboard"
import ScrollableReportView from "@/components/reporter/scrollable-report-view"
import EnterpriseLayout from "@/components/layouts/enterprise-layout"

interface AdminDashboardProps {
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

export default function AdminDashboard({ user, onLogout, reports: propReports = [], onGoHome }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState("")

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
      } finally {
        setLoading(false)
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

  return (
    <EnterpriseLayout
      user={user}
      onLogout={onLogout}
      onGoHome={onGoHome}
      title="Admin Dashboard"
      subtitle="Manage reports, employees, and system settings"
    >
        <div className="mb-6 sm:mb-8 mt-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
          <p className="text-xs sm:text-base text-muted-foreground">Manage reports, employees, and system settings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        {/* Reports Section */}
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <Card className="card-brand lg:col-span-1 card-elevated">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Reports</CardTitle>
                <CardDescription className="text-xs sm:text-sm">All submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 sm:max-h-none overflow-y-auto">
                {reports.map((report) => (
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
              <div className="lg:col-span-2">
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
        </div>
          {/* Employees Tab */}
    </EnterpriseLayout>
  )
}
