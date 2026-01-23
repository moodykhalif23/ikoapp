"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth/auth-page"
import RoleSelectionPage from "@/components/role-selection/role-selection-page"
import ReporterDashboard from "@/components/dashboards/reporter-dashboard"
import ViewerDashboard from "@/components/dashboards/viewer-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"auth" | "roleSelection" | "dashboardSelection" | "reporter" | "viewer" | "admin">("auth")
  const [user, setUser] = useState<any>(null)

  const routeFromUser = (userData: any) => {
    if (userData.roles && userData.roles.includes("admin")) {
      setCurrentPage("admin")
    } else if (userData.roles && userData.roles.length > 0) {
      if (userData.roles.includes("reporter")) {
        setCurrentPage("reporter")
      } else if (userData.roles.includes("viewer")) {
        setCurrentPage("viewer")
      }
    } else {
      setCurrentPage("roleSelection")
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("ikoapp:user")
    if (!storedUser) return

    try {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      routeFromUser(parsed)
    } catch {
      localStorage.removeItem("ikoapp:user")
    }
  }, [])

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    localStorage.setItem("ikoapp:user", JSON.stringify(userData))
    // Route based on user roles from database
    routeFromUser(userData)
  }

  const handleRoleSelect = async (role: "reporter" | "viewer") => {
    try {
      // Update the user's role in the database
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roles: [role] })
      })

      if (response.ok) {
        const data = await response.json()
        // Update local user state with new role
        setUser(data.user)
        localStorage.setItem("ikoapp:user", JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
    
    // Navigate to the selected dashboard
    if (role === "reporter") {
      setCurrentPage("reporter")
    } else if (role === "viewer") {
      setCurrentPage("viewer")
    }
  }

  const handleGoHome = () => {
    setCurrentPage("roleSelection")
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage("auth")
    localStorage.removeItem("ikoapp:user")
  }

  return (
    <main className="min-h-screen bg-app-standard">
      {currentPage === "auth" && <AuthPage onSuccess={handleAuthSuccess} />}
      {currentPage === "roleSelection" && (
        <RoleSelectionPage user={user} onRoleSelect={handleRoleSelect} onLogout={handleLogout} />
      )}
      {currentPage === "reporter" && (
        <ReporterDashboard user={user} onLogout={handleLogout} onGoHome={handleGoHome} />
      )}
      {currentPage === "viewer" && (
        <ViewerDashboard user={user} onLogout={handleLogout} onGoHome={handleGoHome} />
      )}
      {currentPage === "admin" && (
        <AdminDashboard user={user} onLogout={handleLogout} onGoHome={handleGoHome} />
      )}
    </main>
  )
}
