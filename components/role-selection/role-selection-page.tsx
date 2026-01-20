"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BarChartIcon from "@mui/icons-material/BarChart"
import PeopleIcon from "@mui/icons-material/People"
import LogoutIcon from "@mui/icons-material/Logout"
import Image from "next/image"

interface RoleSelectionPageProps {
  user: any
  onRoleSelect: (role: "reporter" | "viewer" | "admin") => void
  onLogout: () => void
}

export default function RoleSelectionPage({ user, onRoleSelect, onLogout }: RoleSelectionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="relative w-32 h-14">
            <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
              <LogoutIcon sx={{ fontSize: 16 }} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Select Your Role</h1>
          <p className="text-muted-foreground">Choose how you'd like to access the production reporting system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
          {/* Reporter Role */}
          <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all-smooth border-border/50 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <BarChartIcon sx={{ fontSize: 24, color: "var(--primary)" }} />
                </div>
              </div>
              <CardTitle className="text-primary">Reporter</CardTitle>
              <CardDescription className="text-gray-700">Submit production reports and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">
                Fill out production reports with a guided workflow including:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Power Interruptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Site Visuals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Daily Production</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Incident Reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Employee Planning</span>
                </li>
              </ul>
              <Button
                onClick={() => onRoleSelect("reporter")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                Access Reporter
              </Button>
            </CardContent>
          </Card>

          {/* Viewer Role */}
          <Card className="group cursor-pointer hover:shadow-lg hover:border-accent/50 transition-all-smooth border-border/50 overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-100">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <PeopleIcon sx={{ fontSize: 24, color: "var(--accent)" }} />
                </div>
              </div>
              <CardTitle className="text-accent">Viewer</CardTitle>
              <CardDescription className="text-gray-700">View and analyze production reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">Access and analyze submitted reports with:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Report filtering and search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Historical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Export capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Team insights</span>
                </li>
              </ul>
              <Button
                onClick={() => onRoleSelect("viewer")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-6"
              >
                Access Viewer
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
