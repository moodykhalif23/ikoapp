"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

interface AnalyticsDashboardProps {
  reports?: any[]
  timeEntries?: any[]
  users?: any[]
}

export default function AnalyticsDashboard({
  reports = [],
  timeEntries = [],
  users = []
}: AnalyticsDashboardProps) {
  const now = new Date()
  const rangeDays = 30
  const rangeStart = new Date(now)
  rangeStart.setDate(rangeStart.getDate() - rangeDays)
  const prevRangeStart = new Date(rangeStart)
  prevRangeStart.setDate(prevRangeStart.getDate() - rangeDays)

  const inRange = (value?: string | Date) => {
    if (!value) return false
    const date = new Date(value)
    return date >= rangeStart && date < now
  }

  const inPrevRange = (value?: string | Date) => {
    if (!value) return false
    const date = new Date(value)
    return date >= prevRangeStart && date < rangeStart
  }

  const getReportDate = (report: any) => report.createdAt || report.date

  // Calculate production data from reports
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const productionData = (() => {
    const buckets = new Map<string, { month: string; reports: number; incidents: number }>()
    const sorted = [...reports].sort((a, b) => new Date(getReportDate(a)).getTime() - new Date(getReportDate(b)).getTime())
    sorted.forEach((report) => {
      const date = new Date(getReportDate(report))
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const monthLabel = monthNames[date.getMonth()]
      const incidents = Array.isArray(report.incidentReport?.incidents)
        ? report.incidentReport.incidents.length
        : report.incidentReport?.incidentType && report.incidentReport.incidentType !== "None"
          ? 1
          : report.incidentReport?.hasIncident === "yes"
            ? 1
            : 0
      const existing = buckets.get(key)
      if (existing) {
        existing.reports += 1
        existing.incidents += incidents
      } else {
        buckets.set(key, { month: monthLabel, reports: 1, incidents })
      }
    })
    return Array.from(buckets.values()).slice(-6)
  })()

  // Calculate time data from time entries
  const timeData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
    const dayEntries = timeEntries.filter((entry: any) => {
      const entryDate = new Date(entry.clockInTime)
      return entryDate.toLocaleDateString('en-US', { weekday: 'short' }) === day
    })
    return {
      day,
      hours: dayEntries.reduce((sum: number, entry: any) => sum + (entry.hoursWorked || 0), 0),
      employees: dayEntries.length
    }
  })

  // Calculate incident types from reports
  const incidentCounts = reports.reduce((acc: Record<string, number>, report: any) => {
    const incidentReport = report.incidentReport
    if (!incidentReport) return acc

    if (Array.isArray(incidentReport.incidents) && incidentReport.incidents.length > 0) {
      incidentReport.incidents.forEach((incident: any) => {
        const type = incident.type || incidentReport.incidentType || "Other"
        acc[type] = (acc[type] || 0) + 1
      })
      return acc
    }

    const type = incidentReport.incidentType
    if (type && type !== "None") {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }

    if (incidentReport.hasIncident === "yes") {
      const fallbackType = incidentReport.severity || "Incident"
      acc[fallbackType] = (acc[fallbackType] || 0) + 1
    }

    return acc
  }, {} as Record<string, number>)

  const incidentTypes = Object.entries(incidentCounts).map(([name, value], index) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
    return {
      name,
      value,
      color: colors[index % colors.length]
    }
  })

  // Calculate KPIs
  const totalReports = reports.length
  const reportsInRange = reports.filter((report) => inRange(getReportDate(report))).length
  const reportsPrevRange = reports.filter((report) => inPrevRange(getReportDate(report))).length

  const totalIncidents = reports.reduce((sum: number, report: any) => {
    const incidentReport = report.incidentReport
    if (!incidentReport) return sum
    if (Array.isArray(incidentReport.incidents) && incidentReport.incidents.length > 0) {
      return sum + incidentReport.incidents.length
    }
    if (incidentReport.incidentType && incidentReport.incidentType !== "None") {
      return sum + 1
    }
    if (incidentReport.hasIncident === "yes") {
      return sum + 1
    }
    return sum
  }, 0)

  const incidentsInRange = reports.reduce((sum: number, report: any) => {
    if (!inRange(getReportDate(report))) return sum
    const incidentReport = report.incidentReport
    if (!incidentReport) return sum
    if (Array.isArray(incidentReport.incidents) && incidentReport.incidents.length > 0) {
      return sum + incidentReport.incidents.length
    }
    if (incidentReport.incidentType && incidentReport.incidentType !== "None") {
      return sum + 1
    }
    if (incidentReport.hasIncident === "yes") {
      return sum + 1
    }
    return sum
  }, 0)

  const incidentsPrevRange = reports.reduce((sum: number, report: any) => {
    if (!inPrevRange(getReportDate(report))) return sum
    const incidentReport = report.incidentReport
    if (!incidentReport) return sum
    if (Array.isArray(incidentReport.incidents) && incidentReport.incidents.length > 0) {
      return sum + incidentReport.incidents.length
    }
    if (incidentReport.incidentType && incidentReport.incidentType !== "None") {
      return sum + 1
    }
    if (incidentReport.hasIncident === "yes") {
      return sum + 1
    }
    return sum
  }, 0)

  const hasTimeEntries = timeEntries.length > 0
  const activeTitle = hasTimeEntries ? "Active Employees" : "Active Reporters"
  const activeDescription = hasTimeEntries ? "Currently working" : "Reports in last 30 days"
  const activeEmployees = hasTimeEntries
    ? timeEntries.filter((entry: any) => entry.status === "active").length
    : new Set(
        reports
          .filter((report) => inRange(getReportDate(report)))
          .map((report: any) => report.reportedBy)
          .filter(Boolean),
      ).size
  const activePrev = hasTimeEntries
    ? new Set(
        timeEntries
          .filter((entry: any) => inPrevRange(entry.clockInTime))
          .map((entry: any) => entry.employeeId || entry.employeeName)
          .filter(Boolean),
      ).size
    : new Set(
        reports
          .filter((report) => inPrevRange(getReportDate(report)))
          .map((report: any) => report.reportedBy)
          .filter(Boolean),
      ).size

  const formatChange = (current: number, previous: number) => {
    if (!previous) return { label: "N/A", type: "neutral" as const }
    const delta = ((current - previous) / previous) * 100
    const label = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`
    return { label, type: delta >= 0 ? ("positive" as const) : ("negative" as const) }
  }

  const reportChange = formatChange(reportsInRange, reportsPrevRange)
  const activeChange = formatChange(activeEmployees, activePrev)
  const incidentChange = formatChange(incidentsInRange, incidentsPrevRange)

  const timeEntriesInRange = timeEntries.filter((entry: any) => inRange(entry.clockInTime))
  const avgHours =
    timeEntriesInRange.length > 0
      ? timeEntriesInRange.reduce((sum: number, entry: any) => sum + (entry.hoursWorked || 0), 0) /
        timeEntriesInRange.length
      : null
  const reportsPerDay = rangeDays ? reportsInRange / rangeDays : null
  const incidentRate = reportsInRange ? incidentsInRange / reportsInRange : null

  const kpis = [
    {
      title: "Total Reports",
      value: totalReports.toString(),
      change: reportChange.label,
      changeType: reportChange.type,
      icon: BarChart3,
      description: "This month"
    },
    {
      title: activeTitle,
      value: activeEmployees.toString(),
      change: activeChange.label,
      changeType: activeChange.type,
      icon: Users,
      description: activeDescription
    },
    {
      title: "Incidents",
      value: totalIncidents.toString(),
      change: incidentChange.label,
      changeType: incidentChange.type,
      icon: AlertTriangle,
      description: "This month"
    }
  ]

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden border bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/40 dark:border-emerald-900/40 p-4 sm:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-48 sm:w-48 rounded-full bg-emerald-100/60 dark:bg-emerald-900/30" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-slate-100/70 dark:bg-slate-800/40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-foreground">
              Production performance at a glance
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Track reports, workforce activity, and incident patterns with quick, data-rich snapshots.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="card-brand card-elevated relative overflow-hidden border">
              <div className="absolute right-0 top-0 h-12 w-12 sm:h-16 sm:w-16 rounded-bl-full bg-emerald-50" />
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-5 pt-3 sm:pt-4 relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-brand-contrast">
                    {kpi.title}
                  </CardTitle>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-emerald-100/70 flex items-center justify-center">
                    <Icon size={16} className="text-emerald-700" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative px-3 sm:px-5 pb-3 sm:pb-4">
                <div className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      kpi.changeType === "positive"
                        ? "default"
                        : kpi.changeType === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-none"
                  >
                    {kpi.changeType === "positive" ? (
                      <TrendingUp size={12} className="mr-1" />
                    ) : kpi.changeType === "negative" ? (
                      <TrendingDown size={12} className="mr-1" />
                    ) : null}
                    {kpi.change}
                  </Badge>
                  <span className="text-[11px] sm:text-xs text-muted-foreground">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Production Efficiency Trend */}
        <Card className="card-brand card-elevated border">
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <LineChart size={16} className="text-emerald-700" />
              Report Submission Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly report volume</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-52 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#047857"
                    strokeWidth={2.5}
                    name="Reports"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Distribution */}
        <Card className="card-brand card-elevated border">
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <PieChart size={16} className="text-emerald-700" />
              Incident Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Types of incidents reported</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-52 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={incidentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {incidentTypes.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Hours */}
        <Card className="card-brand card-elevated border">
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock size={16} className="text-emerald-700" />
              Weekly Hours Overview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Average hours worked per day</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="h-52 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#059669" name="Hours Worked" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="card-brand card-elevated border">
          <CardHeader className="pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity size={16} className="text-emerald-700" />
              Key Performance Indicators
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm sm:text-base font-medium">Avg Hours / Shift</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last 30 days</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[11px] sm:text-xs">
                {avgHours !== null ? `${avgHours.toFixed(1)}h` : "N/A"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-purple-600" />
                <div>
                  <p className="text-sm sm:text-base font-medium">Reports / Day</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last 30 days</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-[11px] sm:text-xs">
                {reportsPerDay !== null ? reportsPerDay.toFixed(2) : "N/A"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-orange-600" />
                <div>
                  <p className="text-sm sm:text-base font-medium">Incident Rate</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Per report (30 days)</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] sm:text-xs">
                {incidentRate !== null ? incidentRate.toFixed(2) : "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
