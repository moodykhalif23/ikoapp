"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, TrendingUp, Users, AlertTriangle, Download, Play, Send } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import PeopleIcon from "@mui/icons-material/People"
import WarningIcon from "@mui/icons-material/Warning"
import DownloadIcon from "@mui/icons-material/Download"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SendIcon from "@mui/icons-material/Send" 

interface ViewerDashboardProps {
  user: any
  onLogout: () => void
  reports?: any[]
}

interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
  role: string
}

export default function ViewerDashboard({ user, onLogout, reports = [] }: ViewerDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState("")
  const [activeReportTab, setActiveReportTab] = useState("summary")

  const mockReports = [
    {
      id: "RPT-1704067200000",
      date: "2024-01-15",
      reportedBy: "John Doe",
      status: "Complete",
      powerInterruptions: { noInterruptions: false, duration: "45", affectedMachines: ["Machine A", "Machine B"] },
      siteVisuals: {
        media: [
          { type: "image", name: "Site Overview.jpg", url: "/industrial-site.jpg" },
          { type: "image", name: "Equipment.jpg", url: "/intricate-machinery.png" },
          { type: "video", name: "Production.mp4", url: "/video-production-team.png" },
        ],
      },
      dailyProduction: {
        overallEfficiency: "92.5",
        products: [
          {
            productName: "Widget A",
            quantity: "150",
            unit: "kg",
            machinesUsed: ["Machine A", "Machine B"],
            employees: 5,
          },
          { productName: "Widget B", quantity: "200", unit: "kg", machinesUsed: ["Machine C"], employees: 3 },
        ],
      },
      incidentReport: { severity: "Medium", incidentType: "power outage" },
    },
    {
      id: "RPT-1704153600000",
      date: "2024-01-14",
      reportedBy: "Jane Smith",
      status: "Complete",
      powerInterruptions: { noInterruptions: true },
      siteVisuals: { media: [] },
      dailyProduction: { overallEfficiency: "88.0" },
    },
  ]

  const allReports = reports.length > 0 ? reports : mockReports

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

  return (
    <div className="min-h-screen bg-app-standard">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm card-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="relative w-24 h-10 sm:w-32 sm:h-14 flex-shrink-0">
            <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-brand-contrast truncate">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-1 sm:gap-2 backdrop-blur-sm touch-target text-xs sm:text-sm border-brand-subtle hover-brand focus-brand"
              style={{ background: 'rgba(255, 255, 255, 0.8)' }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
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
      </main>
    </div>
  )
}
