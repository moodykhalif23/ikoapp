"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/ui/sidebar"
import UserDropdown from "@/components/ui/user-dropdown"
import NotificationDropdown from "@/components/ui/notification-dropdown"
import { 
  Menu as MenuIcon,
  Notifications as BellIcon,
  Home as HomeIcon,
  Logout as LogOutIcon,
  Dashboard as LayoutDashboardIcon,
  Description as FileTextIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  BarChart as BarChart3Icon
} from "@mui/icons-material"
import Image from "next/image"

interface EnterpriseLayoutProps {
  children: React.ReactNode
  user: any
  onLogout: () => void
  onGoHome?: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  title?: string
  subtitle?: string
}

export default function EnterpriseLayout({
  children,
  user,
  onLogout,
  onGoHome,
  activeTab,
  onTabChange,
  title,
  subtitle
}: EnterpriseLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Start collapsed by default

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarCollapsed(false) // Always expanded on desktop
      } else {
        setSidebarCollapsed(true) // Collapsed on mobile by default
      }
    }

    // Set initial state
    if (typeof window !== 'undefined') {
      handleResize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const userRole = user?.role || user?.roles?.[0] || 'viewer'
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.map((role: string) => role.toLowerCase()).includes("admin")
    : String(userRole).toLowerCase() === "admin"

  const tabTitleMap: Record<string, string> = {
    dashboard: "Dashboard",
    reports: "Reports",
    employees: "Employees",
    machines: "Equipment",
    attendance: "Attendance",
    analytics: "Analytics",
  }

  const headerTitle = activeTab ? (tabTitleMap[activeTab] || title || "Dashboard") : (title || "Dashboard")

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Define menu items based on user role (same as sidebar)
  const getMenuItemsForRole = (userRole: string) => {
    const baseItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboardIcon,
        badge: null,
        roles: ["admin", "reporter", "viewer"]
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileTextIcon,
        badge: null,
        roles: ["admin", "reporter", "viewer"]
      }
    ]

    const roleSpecificItems = [
      // Admin specific items
      {
        id: "employees",
        label: "Employees",
        icon: UsersIcon,
        badge: null,
        roles: ["admin"]
      },
      {
        id: "machines",
        label: "Equipment",
        icon: SettingsIcon,
        badge: null,
        roles: ["admin"]
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: UsersIcon,
        badge: null,
        roles: ["reporter"]
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3Icon,
        badge: null,
        roles: ["admin", "viewer"]
      },
      {
      }
    ]

    // Combine base items with role-specific items
    const allItems = [...baseItems, ...roleSpecificItems]
    
    // Filter items based on user role
    return allItems.filter(item => 
      item.roles.includes(userRole?.toLowerCase() || 'viewer')
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sidebar - Only visible on large screens */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content - Responsive margin and bottom padding for mobile navigation */}
      <div className={`min-h-screen transition-all duration-300 mobile-content-padding ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pb-24 sm:pb-28 lg:pb-0`}>
        {/* Top Header - Responsive */}
        <header className="sticky top-0 z-30 bg-[#F5F7FA] border-b border-border">
          {/* Mobile Header - Compact */}
          <div className="lg:hidden mobile-header-compact flex items-center justify-between">
            <div className="relative w-24 h-8">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-2">
              {onGoHome && !isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGoHome}
                  className="gap-1 px-2"
                >
                  <HomeIcon sx={{ fontSize: 16 }} />
                  <span className="text-xs font-medium">Home</span>
                </Button>
              )}
              <NotificationDropdown user={user} />
              <UserDropdown user={user} onLogout={onLogout} className="mobile-touch-target" />
            </div>
          </div>

          {/* Desktop Header - Full */}
          <div className="hidden lg:flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="block">
                <h1 className="text-2xl font-bold text-foreground">{headerTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Home Button */}
              {onGoHome && !isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGoHome}
                  className="gap-2"
                >
                  <HomeIcon sx={{ fontSize: 16 }} />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              )}



              {/* Notifications */}
              <NotificationDropdown user={user} />

              {/* User Menu */}
              <UserDropdown user={user} onLogout={onLogout} />
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable area */}
        <main className="flex-1 bg-[#F5F7FA]">
          <div className="p-1 sm:p-1 lg:p-2">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-green border-t border-brand-green/20">
        <div className="flex items-center justify-around px-1 py-2 safe-area-inset">
          {getMenuItemsForRole(userRole).slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleTabChange(item.id)}
                className={`flex-1 flex-col gap-0.5 h-12 sm:h-14 px-1 mobile-touch-target text-white ${
                  isActive
                    ? 'bg-brand-orange hover:bg-brand-orange'
                    : 'hover:bg-white/20'
                }`}
              >
                <Icon sx={{ fontSize: 16, color: 'white' }} />
                <span className="text-[10px] sm:text-xs font-medium leading-tight text-white">{item.label}</span>
              </Button>
            )
          })}
          
          {/* More menu for additional items if needed */}
          {getMenuItemsForRole(userRole).length > 4 && (
            <Button
              variant="ghost"
              className="flex-1 flex-col gap-0.5 h-12 sm:h-14 px-1 mobile-touch-target text-white hover:bg-white/20"
            >
              <MenuIcon sx={{ fontSize: 16, color: 'white' }} />
              <span className="text-[10px] sm:text-xs font-medium leading-tight text-white">More</span>
            </Button>
          )}
          
          {/* Show logout only if we have space (less than 4 main items) */}
          {getMenuItemsForRole(userRole).length <= 3 && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="flex-1 flex-col gap-0.5 h-12 sm:h-14 px-1 mobile-touch-target text-white hover:bg-white/20"
            >
              <LogOutIcon sx={{ fontSize: 16, color: 'white' }} />
              <span className="text-[10px] sm:text-xs font-medium leading-tight text-white">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
