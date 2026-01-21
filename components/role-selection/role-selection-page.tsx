"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BarChartIcon from "@mui/icons-material/BarChart"
import PeopleIcon from "@mui/icons-material/People"
import LogoutIcon from "@mui/icons-material/Logout"
import Image from "next/image"

interface RoleSelectionPageProps {
  user: any
  onRoleSelect: (roles: ("reporter" | "viewer")[]) => void
  onLogout: () => void
}

export default function RoleSelectionPage({ user, onRoleSelect, onLogout }: RoleSelectionPageProps) {
  const [selectedRoles, setSelectedRoles] = useState<("reporter" | "viewer")[]>([])

  const toggleRole = (role: "reporter" | "viewer") => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const handleContinue = () => {
    if (selectedRoles.length > 0) {
      onRoleSelect(selectedRoles)
    }
  }
  return (
    <div className="min-h-screen bg-app-standard">
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Select Your Access Level</h1>
          <p className="text-muted-foreground">Choose one or both access levels for the production reporting system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
          {/* Reporter Role */}
          <Card className={`group cursor-pointer hover:shadow-lg transition-all-smooth border-border/50 overflow-hidden bg-gradient-to-br from-green-100 to-green-200 ${
            selectedRoles.includes("reporter") ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <BarChartIcon sx={{ fontSize: 24, color: "var(--primary)" }} />
                </div>
                {selectedRoles.includes("reporter") && (
                  <div className="ml-auto w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
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
                onClick={() => toggleRole("reporter")}
                className={`w-full mt-6 ${
                  selectedRoles.includes("reporter")
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-primary/20 hover:bg-primary/30 text-primary border border-primary"
                }`}
              >
                {selectedRoles.includes("reporter") ? "Selected" : "Select Reporter"}
              </Button>
            </CardContent>
          </Card>

          {/* Viewer Role */}
          <Card className={`group cursor-pointer hover:shadow-lg transition-all-smooth border-border/50 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 ${
            selectedRoles.includes("viewer") ? "ring-2 ring-accent border-accent" : "hover:border-accent/50"
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                  <PeopleIcon sx={{ fontSize: 24, color: "var(--accent)" }} />
                </div>
                {selectedRoles.includes("viewer") && (
                  <div className="ml-auto w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
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
                onClick={() => toggleRole("viewer")}
                className={`w-full mt-6 ${
                  selectedRoles.includes("viewer")
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-accent/20 hover:bg-accent/30 text-accent border border-accent"
                }`}
              >
                {selectedRoles.includes("viewer") ? "Selected" : "Select Viewer"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        {selectedRoles.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={handleContinue}
              size="lg"
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue with {selectedRoles.length === 2 ? "Both Roles" : selectedRoles[0].charAt(0).toUpperCase() + selectedRoles[0].slice(1)}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
