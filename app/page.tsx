"use client"

import { useState } from "react"
import AuthPage from "@/components/auth/auth-page"
import RoleSelectionPage from "@/components/role-selection/role-selection-page"
import ReporterDashboard from "@/components/dashboards/reporter-dashboard"
import ViewerDashboard from "@/components/dashboards/viewer-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"auth" | "roleSelection" | "dashboardSelection" | "reporter" | "viewer" | "admin">("auth")
  const [user, setUser] = useState<any>(null)
  const [submittedReports, setSubmittedReports] = useState<any[]>([])

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    // Route based on user roles from database
    if (userData.roles && userData.roles.includes("admin")) {
      setCurrentPage("admin")
    } else if (userData.roles && userData.roles.length > 0) {
      // If user has roles assigned, show dashboard selection if multiple roles, or go directly to dashboard
      if (userData.roles.length === 1) {
        if (userData.roles.includes("reporter")) {
          setCurrentPage("reporter")
        } else if (userData.roles.includes("viewer")) {
          setCurrentPage("viewer")
        }
      } else {
        // Multiple roles - show dashboard selection
        setCurrentPage("dashboardSelection")
      }
    } else {
      // If user has no roles assigned, show role selection
      setCurrentPage("roleSelection")
    }
  }

  const handleRoleSelect = async (roles: ("reporter" | "viewer")[]) => {
    try {
      // Update the user's roles in the database
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roles })
      })

      if (response.ok) {
        const data = await response.json()
        // Update local user state with new roles
        setUser(data.user)
        
        // Navigate based on selected roles
        if (roles.length === 1) {
          if (roles.includes("reporter")) {
            setCurrentPage("reporter")
          } else if (roles.includes("viewer")) {
            setCurrentPage("viewer")
          }
        } else {
          // Multiple roles - show dashboard selection
          setCurrentPage("dashboardSelection")
        }
      } else {
        console.error('Failed to update user roles')
        // Still navigate for now, but in production you'd want to handle this error
        if (roles.length === 1) {
          if (roles.includes("reporter")) {
            setCurrentPage("reporter")
          } else if (roles.includes("viewer")) {
            setCurrentPage("viewer")
          }
        } else {
          setCurrentPage("dashboardSelection")
        }
      }
    } catch (error) {
      console.error('Error updating roles:', error)
      // Still navigate for now, but in production you'd want to handle this error
      if (roles.length === 1) {
        if (roles.includes("reporter")) {
          setCurrentPage("reporter")
        } else if (roles.includes("viewer")) {
          setCurrentPage("viewer")
        }
      } else {
        setCurrentPage("dashboardSelection")
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
