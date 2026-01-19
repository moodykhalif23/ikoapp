"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LogoutIcon from "@mui/icons-material/Logout"
import PeopleIcon from "@mui/icons-material/People"
import SettingsIcon from "@mui/icons-material/Settings"
import BarChartIcon from "@mui/icons-material/BarChart"
import AddIcon from "@mui/icons-material/Add"
import GetAppIcon from "@mui/icons-material/GetApp"
import SendIcon from "@mui/icons-material/Send"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import DeleteIcon from "@mui/icons-material/Delete"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/simple-tabs"
import { Input } from "@/components/ui/input"
import UsersIcon from "@mui/icons-material/Group"
import SettingsIconComponent from "@mui/icons-material/Settings"
import SendIconComponent from "@mui/icons-material/Send"

interface AdminDashboardProps {
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

export default function AdminDashboard({ user, onLogout, reports = [] }: AdminDashboardProps) {
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "reporter", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "viewer", status: "active" },
    { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", status: "active" },
  ])

  const [machines, setMachines] = useState([
    { id: 1, name: "Machine A", status: "active", productionRate: "100 units/hour" },
    { id: 2, name: "Machine B", status: "active", productionRate: "120 units/hour" },
    { id: 3, name: "Machine C", status: "maintenance", productionRate: "110 units/hour" },
    { id: 4, name: "Machine D", status: "active", productionRate: "95 units/hour" },
    { id: 5, name: "Machine E", status: "active", productionRate: "105 units/hour" },
  ])

  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddMachine, setShowAddMachine] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "reporter" })
  const [newMachine, setNewMachine] = useState({ name: "", productionRate: "" })
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState("")
  const [activeReportTab, setActiveReportTab] = useState("overview")

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
        ],
      },
      incidentReport: { severity: "Medium", incidentType: "power outage" },
      timestamp: "2024-01-15T10:30:00Z",
    },
  ]

  const allReports = reports.length > 0 ? reports : mockReports

  const handleAddComment = (reportId: string) => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: `${Date.now()}`,
        author: user?.name || "Admin",
        text: commentText,
        timestamp: new Date().toLocaleTimeString(),
        role: "admin",
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
    setActiveReportTab("overview") // Reset to overview tab when selecting a new report
  }

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.email) {
      setEmployees((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...newEmployee,
          status: "active",
        },
      ])
      setNewEmployee({ name: "", email: "", role: "reporter" })
      setShowAddEmployee(false)
    }
  }

  const handleDeleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id))
  }

  const handleAddMachine = () => {
    if (newMachine.name && newMachine.productionRate) {
      setMachines((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...newMachine,
          status: "active",
        },
      ])
      setNewMachine({ name: "", productionRate: "" })
      setShowAddMachine(false)
    }
  }

  const handleDeleteMachine = (id: number) => {
    setMachines((prev) => prev.filter((mach) => mach.id !== id))
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
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.png" alt="IKO BRIQ" width={32} height={32} className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-base sm:text-lg font-bold text-brand-primary hidden sm:block">Admin Dashboard</h1>
            <h1 className="text-sm sm:text-lg font-bold text-brand-primary sm:hidden">Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-1 sm:gap-2 text-xs sm:text-sm touch-target">
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area - Fixed height scrollable */}
      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="reports" className="h-full flex flex-col">
          {/* Tab Navigation - Horizontal scrollable on mobile */}
          <TabsList className="w-full justify-start gap-0 sm:gap-2 h-auto bg-muted/50 border-b border-border rounded-none overflow-x-auto flex-shrink-0">
            <TabsTrigger value="reports" className="min-w-max text-xs sm:text-sm touch-target">
              <BarChartIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Report</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="min-w-max text-xs sm:text-sm touch-target">
              <UsersIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Employees</span>
              <span className="sm:hidden">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="min-w-max text-xs sm:text-sm touch-target">
              <SettingsIconComponent className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Machines</span>
              <span className="sm:hidden">Machines</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Reports Tab */}
            <TabsContent value="reports" className="m-0 h-full">
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 h-full flex flex-col">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0">
                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Total Reports
                        <BarChartIcon className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{allReports.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Active Reporters
                        <PeopleIcon className="h-4 w-4 text-accent" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">
                        {new Set(allReports.map((r) => r.reportedBy)).size}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">This month</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Avg Efficiency
                        <SettingsIcon className="h-4 w-4 text-destructive" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">
                        {(
                          allReports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) /
                          allReports.length
                        ).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Overall production</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-between">
                        Total Employees
                        <UsersIcon className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">{employees.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active users</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Reports Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 min-h-0">
                {/* Reports List */}
                <div className="lg:col-span-1 flex flex-col gap-3 min-h-0">
                  <h3 className="font-semibold text-sm sm:text-base flex-shrink-0">Recent Reports</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {allReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => handleReportSelect(report)}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all text-sm sm:text-base touch-target ${
                          selectedReport?.id === report.id
                            ? "border-brand-primary bg-brand-primary/5"
                            : "border-border hover:border-brand-primary/50"
                        }`}
                      >
                        <div className="font-medium truncate">{report.id}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{report.reportedBy}</div>
                        <div className="text-xs text-brand-secondary mt-1">{report.date}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Details */}
                {selectedReport ? (
                  <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4 min-h-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 flex-shrink-0">
                      <h3 className="font-semibold text-sm sm:text-base">Report Details</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePDFExport(selectedReport)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        <GetAppIcon sx={{ fontSize: 14, marginRight: "0.5rem" }} />
                        Export PDF
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                      <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="w-full h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 bg-muted/50 rounded-lg p-1 flex-shrink-0">
                          <TabsTrigger value="overview" className="text-xs sm:text-sm touch-target">Overview</TabsTrigger>
                          <TabsTrigger value="visuals" className="text-xs sm:text-sm touch-target">Visuals</TabsTrigger>
                          <TabsTrigger value="production" className="text-xs sm:text-sm touch-target">Production</TabsTrigger>
                          <TabsTrigger value="comments" className="text-xs sm:text-sm touch-target">Comments</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto mt-3 sm:mt-4 min-h-0 space-y-3 sm:space-y-4">
                          {/* Overview */}
                          <TabsContent value="overview" className="space-y-4 m-0">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                                <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                                <p className="font-medium text-sm sm:text-base mt-1">{selectedReport.status}</p>
                              </div>
                              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                                <span className="text-xs sm:text-sm text-muted-foreground">Date</span>
                                <p className="font-medium text-sm sm:text-base mt-1">{selectedReport.date}</p>
                              </div>
                            </div>
                            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                              <span className="text-xs sm:text-sm text-muted-foreground">Power Interruptions</span>
                              <p className="font-medium text-sm sm:text-base mt-1">
                                {selectedReport.powerInterruptions?.noInterruptions
                                  ? "No interruptions"
                                  : `${selectedReport.powerInterruptions?.duration} minutes - ${selectedReport.powerInterruptions?.affectedMachines?.join(", ")}`}
                              </p>
                            </div>
                            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                              <span className="text-xs sm:text-sm text-muted-foreground">Incident Type</span>
                              <p className="font-medium text-sm sm:text-base mt-1 capitalize">
                                {selectedReport.incidentReport?.incidentType || "None"}
                              </p>
                            </div>
                          </TabsContent>

                          {/* Site Visuals */}
                          <TabsContent value="visuals" className="space-y-3 m-0">
                            {selectedReport.siteVisuals?.media && selectedReport.siteVisuals.media.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                {selectedReport.siteVisuals.media.map((item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border group cursor-pointer touch-target"
                                  >
                                    {item.type === "image" ? (
                                      <div className="relative w-full h-full">
                                        <Image src={item.url || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <div className="flex flex-col items-center gap-2">
                                          <PlayArrowIcon sx={{ fontSize: 32, color: "var(--brand-orange)" }} />
                                          <span className="text-xs text-muted-foreground text-center px-1 truncate">{item.name}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-muted-foreground">No media uploaded</p>
                            )}
                          </TabsContent>

                          {/* Production */}
                          <TabsContent value="production" className="space-y-3 m-0">
                            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                              <span className="text-xs sm:text-sm text-muted-foreground">Overall Efficiency</span>
                              <p className="font-medium text-sm sm:text-base mt-1">{selectedReport.dailyProduction?.overallEfficiency}%</p>
                            </div>
                            {selectedReport.dailyProduction?.products?.map((product: any, idx: number) => (
                              <div key={idx} className="border border-border rounded-lg p-3 sm:p-4 space-y-2">
                                <p className="font-medium text-sm sm:text-base">{product.productName}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Quantity</span>
                                    <p className="font-medium">{product.quantity} {product.unit}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Employees</span>
                                    <p className="font-medium">{product.employees}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground">Machines</span>
                                    <p className="font-medium">{product.machinesUsed?.join(", ")}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </TabsContent>

                          {/* Comments */}
                          <TabsContent value="comments" className="flex flex-col gap-3 m-0 h-full">
                            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                              {comments[selectedReport.id]?.map((comment) => (
                                <div key={comment.id} className="border border-border rounded-lg p-3 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs sm:text-sm font-medium">{comment.author}</span>
                                    <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded">{comment.role}</span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-foreground break-words">{comment.text}</p>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-auto flex-shrink-0">
                              <Input
                                placeholder="Add comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddComment(selectedReport.id)}
                                className="text-xs sm:text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(selectedReport.id)}
                                className="px-2 sm:px-3 touch-target"
                              >
                                <SendIconComponent className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-2 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm sm:text-base">Select a report to view details</p>
                  </div>
                )}
                </div>
              </div>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees" className="m-0 h-full">
              <div className="flex flex-col h-full p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 flex-shrink-0">
                  <h3 className="font-semibold text-sm sm:text-base">Employee Management</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAddEmployee(!showAddEmployee)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <AddIcon sx={{ fontSize: 16, marginRight: "0.5rem" }} />
                    Add Employee
                  </Button>
                </div>

                {showAddEmployee && (
                  <Card className="mb-4 flex-shrink-0">
                    <CardContent className="pt-4 sm:pt-6 space-y-3">
                      <Input
                        placeholder="Name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                      <Input
                        placeholder="Email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                      <select
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-xs sm:text-sm"
                      >
                        <option value="reporter">Reporter</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddEmployee}
                          className="flex-1 text-xs sm:text-sm touch-target"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddEmployee(false)}
                          className="flex-1 text-xs sm:text-sm touch-target"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-2 sm:space-y-3">
                    {employees.map((emp) => (
                      <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-2 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                          <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
                            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded capitalize w-fit">
                              {emp.role}
                            </span>
                            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded capitalize w-fit">{emp.status}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="w-full sm:w-auto text-xs"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Machines Tab */}
            <TabsContent value="machines" className="m-0 h-full">
              <div className="flex flex-col h-full p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 flex-shrink-0">
                  <h3 className="font-semibold text-sm sm:text-base">Machine Management</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAddMachine(!showAddMachine)}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <AddIcon sx={{ fontSize: 16, marginRight: "0.5rem" }} />
                    Add Machine
                  </Button>
                </div>

                {showAddMachine && (
                  <Card className="mb-4 flex-shrink-0">
                    <CardContent className="pt-4 sm:pt-6 space-y-3">
                      <Input
                        placeholder="Machine Name"
                        value={newMachine.name}
                        onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                      <Input
                        placeholder="Production Rate (e.g., 100 units/hour)"
                        value={newMachine.productionRate}
                        onChange={(e) => setNewMachine({ ...newMachine, productionRate: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddMachine}
                          className="flex-1 text-xs sm:text-sm touch-target"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddMachine(false)}
                          className="flex-1 text-xs sm:text-sm touch-target"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="space-y-2 sm:space-y-3">
                    {machines.map((machine) => (
                      <div key={machine.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-2 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">{machine.name}</p>
                          <p className="text-xs text-muted-foreground">{machine.productionRate}</p>
                          <span
                            className={`text-xs mt-2 inline-block px-2 py-0.5 rounded capitalize ${
                              machine.status === "active"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-yellow-500/10 text-yellow-600"
                            }`}
                          >
                            {machine.status}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMachine(machine.id)}
                          className="w-full sm:w-auto text-xs"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
