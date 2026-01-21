"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/ui/sidebar"
import { Menu, Bell, Search, Home, LogOut, LayoutDashboard, FileText, Clock, Users, Settings, BarChart3, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
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
        icon: LayoutDashboard,
        badge: null,
        roles: ["admin", "reporter", "viewer"]
      },
      {
        id: "reports",
        label: "Reports",
        icon: FileText,
        badge: null,
        roles: ["admin", "reporter", "viewer"]
      }
    ]

    const roleSpecificItems = [
      // Reporter specific items
      {
        id: "time-tracking",
        label: "Time Tracking",
        icon: Clock,
        badge: null,
        roles: ["admin", "reporter"]
      },
      // Admin specific items
      {
        id: "employees",
        label: "Employees",
        icon: Users,
        badge: null,
        roles: ["admin"]
      },
      {
        id: "machines",
        label: "Equipment",
        icon: Settings,
        badge: null,
        roles: ["admin"]
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        badge: null,
        roles: ["admin", "viewer"]
      },
      {
        id: "alerts",
        label: "Alerts",
        icon: AlertTriangle,
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
      <div className={`min-h-screen transition-all duration-300 lg:${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } pb-20 lg:pb-0`}>
        {/* Top Header - Responsive */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="block">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title || 'Dashboard'}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Home Button */}
              {onGoHome && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGoHome}
                  className="gap-2"
                >
                  <Home size={16} />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              )}

              {/* Search - Hidden on mobile */}
              <div className="hidden md:block relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search..."
                  className="w-72 pl-12 h-10 text-base"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                {/* Mobile logout button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="lg:hidden p-2"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden mt-4">
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </header>

        {/* Page Content - Scrollable area */}
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav">
        <div className="flex items-center justify-around px-1 py-2 safe-area-inset">
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange?.(item.id)}
                className={`flex-1 flex-col gap-1 h-16 px-1 bottom-nav-button ${
                  isActive ? 'active' : ''
                } ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </Button>
            )
          })}
          
          {/* More menu for additional items if needed */}
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').length > 4 && (
            <Button
              variant="ghost"
              className="flex-1 flex-col gap-1 h-16 px-1 bottom-nav-button text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Menu size={20} />
              <span className="text-xs font-medium leading-tight">More</span>
            </Button>
          )}
          
          {/* Show logout only if we have space (less than 4 main items) */}
          {getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer').length <= 3 && (
            <Button
              variant="ghost"
              onClick={onLogout}
              className="flex-1 flex-col gap-1 h-16 px-1 bottom-nav-button text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut size={20} />
              <span className="text-xs font-medium leading-tight">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}