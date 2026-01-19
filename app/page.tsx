"use client"

import { useState } from "react"
import AuthPage from "@/components/auth/auth-page"
import RoleSelectionPage from "@/components/role-selection/role-selection-page"
import ReporterDashboard from "@/components/dashboards/reporter-dashboard"
import ViewerDashboard from "@/components/dashboards/viewer-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"auth" | "roleSelection" | "reporter" | "viewer" | "admin">("auth")
  const [user, setUser] = useState<any>(null)
  const [submittedReports, setSubmittedReports] = useState<any[]>([])

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    // Check if user email matches admin pattern (for demo: admin@example.com)
    if (userData.email === "admin@example.com") {
      setCurrentPage("admin")
    } else {
      setCurrentPage("roleSelection")
    }
  }

  const handleRoleSelect = (role: "reporter" | "viewer" | "admin") => {
    if (role === "reporter") {
      setCurrentPage("reporter")
    } else if (role === "viewer") {
      setCurrentPage("viewer")
    } else if (role === "admin") {
      setCurrentPage("admin")
    }
  }

  const handleReportSubmit = (reportData: any) => {
    const newReport = {
      ...reportData,
      timestamp: new Date().toISOString(),
    }
    setSubmittedReports([newReport, ...submittedReports])
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage("auth")
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f7f4 0%, #fff8f0 100%)' }}>
      {currentPage === "auth" && <AuthPage onSuccess={handleAuthSuccess} />}
      {currentPage === "roleSelection" && (
        <RoleSelectionPage user={user} onRoleSelect={handleRoleSelect} onLogout={handleLogout} />
      )}
      {currentPage === "reporter" && (
        <ReporterDashboard user={user} onLogout={handleLogout} onReportSubmit={handleReportSubmit} />
      )}
      {currentPage === "viewer" && (
        <ViewerDashboard user={user} onLogout={handleLogout} reports={submittedReports} />
      )}
      {currentPage === "admin" && (
        <AdminDashboard user={user} onLogout={handleLogout} reports={submittedReports} />
      )}
    </main>
  )
}
