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
    // Route based on user role from database
    if (userData.role === "admin") {
      setCurrentPage("admin")
    } else if (userData.role === "reporter") {
      setCurrentPage("reporter")
    } else if (userData.role === "viewer") {
      setCurrentPage("viewer")
    } else {
      // If user has no role assigned, show role selection
      setCurrentPage("roleSelection")
    }
  }

  const handleRoleSelect = async (role: "reporter" | "viewer" | "admin") => {
    try {
      // Update the user's role in the database
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role })
      })

      if (response.ok) {
        const data = await response.json()
        // Update local user state with new role
        setUser(data.user)
        
        // Navigate to appropriate dashboard
        if (role === "reporter") {
          setCurrentPage("reporter")
        } else if (role === "viewer") {
          setCurrentPage("viewer")
        } else if (role === "admin") {
          setCurrentPage("admin")
        }
      } else {
        console.error('Failed to update user role')
        // Still navigate for now, but in production you'd want to handle this error
        if (role === "reporter") {
          setCurrentPage("reporter")
        } else if (role === "viewer") {
          setCurrentPage("viewer")
        } else if (role === "admin") {
          setCurrentPage("admin")
        }
      }
    } catch (error) {
      console.error('Error updating role:', error)
      // Still navigate for now, but in production you'd want to handle this error
      if (role === "reporter") {
        setCurrentPage("reporter")
      } else if (role === "viewer") {
        setCurrentPage("viewer")
      } else if (role === "admin") {
        setCurrentPage("admin")
      }
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
    <main className="min-h-screen bg-app-standard">
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
