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
  Schedule as ClockIcon, 
  People as UsersIcon, 
  Settings as SettingsIcon, 
  BarChart as BarChart3Icon, 
  Warning as AlertTriangleIcon 
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
      // Reporter specific items
      {
        id: "time-tracking",
        label: "Time Tracking",
        icon: ClockIcon,
        badge: null,
        roles: ["admin", "reporter"]
      },
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
        id: "analytics",
        label: "Analytics",
        icon: BarChart3Icon,
        badge: null,
        roles: ["admin", "viewer"]
      },
      {
        id: "alerts",
        label: "Alerts",
        icon: AlertTriangleIcon,
        badge: null,
        roles: ["admin"]
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
    <div className="min-h-screen bg-app-standard">
      {/* Sidebar - Only visible on large screens */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          user={user}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content - Responsive margin */}
      <div className={`min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pb-16 lg:pb-0`}>
        {/* Top Header - Responsive */}
        <header className="sticky top-0 z-30 bg-card border-b border-border backdrop-blur-sm">
          {/* Mobile Header - Compact */}
          <div className="lg:hidden mobile-header-compact flex items-center justify-between">
            <div className="relative w-24 h-8">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
            <UserDropdown user={user} onLogout={onLogout} className="mobile-touch-target" />
          </div>

          {/* Desktop Header - Full */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="block">
                <h1 className="text-2xl font-bold text-foreground">{title || 'Dashboard'}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Home Button */}
              {onGoHome && (
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
        <main className="flex-1">
          <div className="p-3 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav">
        <div className="flex items-center justify-around px-1 py-1 safe-area-inset">
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange?.(item.id)}
                className={`flex-1 flex-col gap-1 h-14 px-1 bottom-nav-button mobile-touch-target ${
                  isActive ? 'active' : ''
                } ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon sx={{ fontSize: 18 }} />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </Button>
            )
          })}
          
          {/* More menu for additional items if needed */}
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').length > 4 && (
            <Button
              variant="ghost"
              className="flex-1 flex-col gap-1 h-14 px-1 bottom-nav-button mobile-touch-target text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <MenuIcon sx={{ fontSize: 18 }} />
              <span className="text-xs font-medium leading-tight">More</span>
            </Button>
          )}
          
          {/* Show logout only if we have space (less than 4 main items) */}
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').length <= 3 && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="flex-1 flex-col gap-1 h-14 px-1 bottom-nav-button mobile-touch-target text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOutIcon sx={{ fontSize: 18 }} />
              <span className="text-xs font-medium leading-tight">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}