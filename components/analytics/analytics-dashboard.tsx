"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Calendar,
  Download
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

// Mock data for demonstration
const mockProductionData = [
  { month: 'Jan', efficiency: 85, reports: 45, incidents: 3 },
  { month: 'Feb', efficiency: 88, reports: 52, incidents: 2 },
  { month: 'Mar', efficiency: 92, reports: 48, incidents: 1 },
  { month: 'Apr', efficiency: 89, reports: 55, incidents: 4 },
  { month: 'May', efficiency: 94, reports: 61, incidents: 2 },
  { month: 'Jun', efficiency: 96, reports: 58, incidents: 1 },
]

const mockTimeData = [
  { day: 'Mon', hours: 8.5, employees: 12 },
  { day: 'Tue', hours: 8.2, employees: 15 },
  { day: 'Wed', hours: 8.8, employees: 13 },
  { day: 'Thu', hours: 7.9, employees: 14 },
  { day: 'Fri', hours: 8.1, employees: 16 },
  { day: 'Sat', hours: 4.2, employees: 6 },
  { day: 'Sun', hours: 2.1, employees: 3 },
]

const mockIncidentTypes = [
  { name: 'Equipment Failure', value: 45, color: '#ef4444' },
  { name: 'Power Outage', value: 30, color: '#f97316' },
  { name: 'Safety Incident', value: 15, color: '#eab308' },
  { name: 'Quality Issue', value: 10, color: '#22c55e' },
]

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
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("efficiency")

  // Calculate KPIs
  const totalReports = reports.length
  const activeEmployees = timeEntries.filter(entry => entry.status === 'active').length
  const avgEfficiency = reports.reduce((sum, r) => sum + Number(r.dailyProduction?.overallEfficiency || 0), 0) / reports.length || 0
  const totalIncidents = reports.reduce((sum, r) => sum + (r.incidentReport?.severity ? 1 : 0), 0)

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
      title: "Avg Efficiency",
      value: `${avgEfficiency.toFixed(1)}%`,
      change: "+3.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Production efficiency"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Production insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="card-brand card-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-brand-contrast">
                    {kpi.title}
                  </CardTitle>
                  <Icon size={20} className="text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={kpi.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Efficiency Trend */}
        <Card className="card-brand card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart size={20} className="text-primary" />
              Production Efficiency Trend
            </CardTitle>
            <CardDescription>Monthly efficiency and report volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={mockProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#2d6a4f"
                  strokeWidth={2}
                  name="Efficiency %"
                />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#ff8c00"
                  strokeWidth={2}
                  name="Reports"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Distribution */}
        <Card className="card-brand card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart size={20} className="text-primary" />
              Incident Distribution
            </CardTitle>
            <CardDescription>Types of incidents reported</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={mockIncidentTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockIncidentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {mockIncidentTypes.map((item, index) => (
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
        <Card className="card-brand card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Weekly Hours Overview
            </CardTitle>
            <CardDescription>Average hours worked per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#2d6a4f" name="Hours Worked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="card-brand card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Key Performance Indicators
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="font-medium">System Health</p>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                99.9%
              </Badge>
            </div>

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

      {/* Recent Activity */}
      <Card className="card-brand card-elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "2 minutes ago", event: "Employee John Doe clocked in", type: "time" },
              { time: "15 minutes ago", event: "New production report submitted", type: "report" },
              { time: "1 hour ago", event: "Equipment maintenance completed", type: "maintenance" },
              { time: "2 hours ago", event: "Safety incident reported", type: "incident" },
              { time: "4 hours ago", event: "New employee registered", type: "user" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'time' ? 'bg-green-500' :
                  activity.type === 'report' ? 'bg-blue-500' :
                  activity.type === 'maintenance' ? 'bg-purple-500' :
                  activity.type === 'incident' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}