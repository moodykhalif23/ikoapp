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
  const [activeReportTab, setActiveReportTab] = useState("summary")
  const [activeMainTab, setActiveMainTab] = useState("reports")

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all reports
        const reportsResponse = await fetch('/api/reports?limit=100')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData.reports)
        }

        // Fetch all users
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        // Fetch all machines
        const machinesResponse = await fetch('/api/machines')
        if (machinesResponse.ok) {
          const machinesData = await machinesResponse.json()
          setMachines(machinesData)
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddMachine, setShowAddMachine] = useState(false)
  const [showImportEmployees, setShowImportEmployees] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "reporter",
    employeeType: "permanent",
    employeeId: "",
    department: "",
    phone: "",
    hireDate: ""
  })
  const [newMachine, setNewMachine] = useState({ name: "", productionRate: "" })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  const allReports = reports

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
    setActiveReportTab("summary")
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
      alert("Name and email are required")
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          password: 'temp123!', // Temporary password - should be changed by employee
          role: newEmployee.role,
          employeeType: newEmployee.employeeType,
          employeeId: newEmployee.employeeId || undefined,
          department: newEmployee.department || undefined,
          phone: newEmployee.phone || undefined,
          hireDate: newEmployee.hireDate ? new Date(newEmployee.hireDate) : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh employees list
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        setNewEmployee({
          name: "",
          email: "",
          role: "reporter",
          employeeType: "permanent",
          employeeId: "",
          department: "",
          phone: "",
          hireDate: ""
        })
        setShowAddEmployee(false)
        alert(`Employee ${newEmployee.name} added successfully. They should change their password on first login.`)
      } else {
        alert(data.error || 'Failed to add employee')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const handleImportEmployees = async () => {
    if (!importFile) {
      alert("Please select a CSV file")
      return
    }

    setImportLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh employees list
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        setShowImportEmployees(false)
        setImportFile(null)
        alert(data.message)
        if (data.data.errors && data.data.errors.length > 0) {
          console.log('Import errors:', data.data.errors)
        }
      } else {
        alert(data.error || 'Failed to import employees')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setImportLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Refresh users list
          const usersResponse = await fetch('/api/users')
          if (usersResponse.ok) {
            const usersData = await usersResponse.json()
            setUsers(usersData)
          }
        } else {
          alert('Failed to delete employee')
        }
      } catch (error) {
        alert('Network error. Please try again.')
      }
    }
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
    <EnterpriseLayout
      user={user}
      onLogout={onLogout}
      onGoHome={onGoHome}
      activeTab={activeMainTab}
      onTabChange={setActiveMainTab}
      title="Admin Dashboard"
      subtitle="Manage reports, employees, and system settings"
    >
        <div className="mb-6 sm:mb-8">
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

          <Card className="card-brand card-elevated">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast flex items-center justify-between">
                Total Employees
                <Users size={16} className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="w-full bg-muted text-xs mb-6 overflow-y-hidden">
            <TabsTrigger value="reports" className="text-xs flex-shrink-0 min-w-fit h-8">
              Reports
            </TabsTrigger>
            <TabsTrigger value="time-tracking" className="text-xs flex-shrink-0 min-w-fit h-8">
              Time Tracking
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-xs flex-shrink-0 min-w-fit h-8">
              Employees
            </TabsTrigger>
            <TabsTrigger value="machines" className="text-xs flex-shrink-0 min-w-fit h-8">
              Machines
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs flex-shrink-0 min-w-fit h-8">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs flex-shrink-0 min-w-fit h-8">
              Equipment
            </TabsTrigger>
          </TabsList>

          {/* Time Tracking Tab */}
          <TabsContent value="time-tracking" className="space-y-6">
            <TimeTrackingDashboard users={users} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
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
          </TabsContent>
          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="card-brand card-brand-dark card-elevated">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Employee Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage system users and their roles</CardDescription>
                </div>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Button
                    size="sm"
                    onClick={() => setShowAddEmployee(!showAddEmployee)}
                    className="gap-2 bg-transparent text-xs touch-target border-brand-subtle hover-brand focus-brand"
                  >
                    <UserPlus size={16} />
                    Add Employee
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowImportEmployees(!showImportEmployees)}
                    className="gap-2 text-xs touch-target border-brand-subtle hover-brand focus-brand"
                  >
                    <Upload size={16} />
                    Import CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddEmployee && (
                  <div className="p-4 border-brand-subtle rounded-lg bg-brand-surface space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Employee Name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-subtle rounded-md bg-background text-xs sm:text-sm focus-brand"
                      >
                        <option value="reporter">Reporter</option>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select
                        value={newEmployee.employeeType}
                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeType: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-subtle rounded-md bg-background text-xs sm:text-sm focus-brand"
                      >
                        <option value="permanent">Permanent</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Employee ID (optional)"
                        value={newEmployee.employeeId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                      <Input
                        placeholder="Department (optional)"
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Phone (optional)"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                      <Input
                        type="date"
                        placeholder="Hire Date (optional)"
                        value={newEmployee.hireDate}
                        onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                        className="text-xs sm:text-sm focus-brand"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddEmployee}
                        className="flex-1 text-xs sm:text-sm touch-target"
                      >
                        Add Employee
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddEmployee(false)}
                        className="flex-1 text-xs sm:text-sm touch-target border-brand-subtle hover-brand focus-brand"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {showImportEmployees && (
                  <div className="p-4 border-brand-subtle rounded-lg bg-brand-surface space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Import Employees from CSV</h4>
                      <p className="text-xs text-muted-foreground">
                        CSV should have headers: name, email, role (optional), employeeType (optional), employeeId (optional), department (optional), phone (optional), hireDate (optional)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="w-full text-xs sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {importFile && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText size={14} />
                          {importFile.name}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleImportEmployees}
                        disabled={!importFile || importLoading}
                        className="flex-1 text-xs sm:text-sm touch-target"
                      >
                        {importLoading ? 'Importing...' : 'Import Employees'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowImportEmployees(false)
                          setImportFile(null)
                        }}
                        className="flex-1 text-xs sm:text-sm touch-target border-brand-subtle hover-brand focus-brand"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {users.map((emp) => (
                    <div key={emp._id} className="p-3 sm:p-4 border-brand-subtle rounded-lg bg-card hover:shadow-md transition-shadow hover-brand">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-xs sm:text-sm truncate">{emp.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                              emp.employeeType === 'casual'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {emp.employeeType}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-2">{emp.email}</p>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Role:</span>
                              <span className="ml-1 capitalize bg-primary/10 text-primary px-1 py-0.5 rounded">
                                {emp.role}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <span className="ml-1 capitalize bg-green-100 text-green-700 px-1 py-0.5 rounded">
                                {emp.status}
                              </span>
                            </div>
                            {emp.employeeId && (
                              <div>
                                <span className="text-muted-foreground">ID:</span>
                                <span className="ml-1">{emp.employeeId}</span>
                              </div>
                            )}
                            {emp.department && (
                              <div>
                                <span className="text-muted-foreground">Dept:</span>
                                <span className="ml-1">{emp.department}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="gap-2 text-xs touch-target w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={16} />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Machines Tab */}
          <TabsContent value="machines" className="space-y-6">
            <Card className="card-brand card-brand-dark card-elevated">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">Machine Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monitor and manage production equipment</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddMachine(!showAddMachine)}
                  className="gap-2 bg-transparent text-xs touch-target w-full sm:w-auto border-brand-subtle hover-brand focus-brand"
                >
                  <Settings size={16} />
                  Add Machine
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddMachine && (
                  <div className="p-4 border-brand-subtle rounded-lg bg-brand-surface space-y-3">
                    <Input
                      placeholder="Machine Name"
                      value={newMachine.name}
                      onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                      className="text-xs sm:text-sm focus-brand"
                    />
                    <Input
                      placeholder="Production Rate (e.g., 100 units/hour)"
                      value={newMachine.productionRate}
                      onChange={(e) => setNewMachine({ ...newMachine, productionRate: e.target.value })}
                      className="text-xs sm:text-sm focus-brand"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddMachine}
                        className="flex-1 text-xs sm:text-sm touch-target"
                      >
                        Add Machine
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddMachine(false)}
                        className="flex-1 text-xs sm:text-sm touch-target border-brand-subtle hover-brand focus-brand"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {machines.map((machine) => (
                    <div key={machine.id} className="p-3 sm:p-4 border-brand-subtle rounded-lg bg-card hover:shadow-md transition-shadow hover-brand">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                          variant="outline"
                          onClick={() => handleDeleteMachine(machine.id)}
                          className="gap-2 text-xs touch-target w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={16} />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard
              reports={allReports}
              timeEntries={[]} // Will be populated from API
              users={users}
            />
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <EquipmentDashboard machines={machines} user={user} />
          </TabsContent>
        </Tabs>
    </EnterpriseLayout>
  )
}
