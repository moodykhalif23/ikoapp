"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar
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
  // Calculate production data from reports
  const productionData = reports.slice(-6).map((report: any, index: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const date = new Date(report.createdAt || report.date)
    return {
      month: monthNames[date.getMonth()],
      reports: 1,
      incidents: report.incidentReport?.incidents?.length || 0
    }
  })

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
    if (report.incidentReport?.incidents) {
      report.incidentReport.incidents.forEach((incident: any) => {
        const type = incident.type || 'Other'
        acc[type] = (acc[type] || 0) + 1
      })
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
  const activeEmployees = timeEntries.filter((entry: any) => entry.status === 'active').length
  const totalIncidents = reports.reduce((sum: number, r: any) => sum + (r.incidentReport?.severity ? 1 : 0), 0)

  const kpis = [
    {
      title: "Total Reports",
      value: totalReports.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: BarChart3,
      description: "This month"
    },
    {
      title: "Active Employees",
      value: activeEmployees.toString(),
      change: "+2",
      changeType: "positive" as const,
      icon: Users,
      description: "Currently working"
    },
    {
      title: "Incidents",
      value: totalIncidents.toString(),
      change: "-15%",
      changeType: "negative" as const,
      icon: AlertTriangle,
      description: "This month"
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden border bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-100/60" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-slate-100/70" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-foreground">
              Production performance at a glance
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
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
              <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-emerald-50" />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-brand-contrast">
                    {kpi.title}
                  </CardTitle>
                  <div className="h-9 w-9 rounded-full bg-emerald-100/70 flex items-center justify-center">
                    <Icon size={18} className="text-emerald-700" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={kpi.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-[11px] px-2 py-0.5 rounded-none"
                  >
                    {kpi.changeType === 'positive' ? (
                      <TrendingUp size={12} className="mr-1" />
                    ) : (
                      <TrendingDown size={12} className="mr-1" />
                    )}
                    {kpi.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{kpi.description}</span>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart size={18} className="text-emerald-700" />
              Report Submission Trend
            </CardTitle>
            <CardDescription>Monthly report volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
          </CardContent>
        </Card>

        {/* Incident Distribution */}
        <Card className="card-brand card-elevated border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart size={18} className="text-emerald-700" />
              Incident Distribution
            </CardTitle>
            <CardDescription>Types of incidents reported</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={incidentTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
            <div className="flex flex-wrap gap-4 mt-4">
              {incidentTypes.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Hours */}
        <Card className="card-brand card-elevated border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={18} className="text-emerald-700" />
              Weekly Hours Overview
            </CardTitle>
            <CardDescription>Average hours worked per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="hours" fill="#059669" name="Hours Worked" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="card-brand card-elevated border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity size={18} className="text-emerald-700" />
              Key Performance Indicators
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium">Employee Attendance</p>
                  <p className="text-sm text-muted-foreground">On-time rate</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                94.2%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-purple-600" />
                <div>
                  <p className="font-medium">Productivity Score</p>
                  <p className="text-sm text-muted-foreground">vs last month</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                +5.3%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-orange-600" />
                <div>
                  <p className="font-medium">Safety Incidents</p>
                  <p className="text-sm text-muted-foreground">This quarter</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                2
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
