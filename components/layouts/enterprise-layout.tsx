"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/ui/sidebar"
import { Menu, Bell, Search, Home } from "lucide-react"
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
        setSidebarCollapsed(false) // Expand on desktop
      } else {
        setSidebarCollapsed(true) // Collapse on mobile
      }
    }

    // Set initial state
    if (typeof window !== 'undefined') {
      handleResize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-app-standard flex">
      {/* Sidebar - Responsive positioning */}
      <div className={`${
        sidebarCollapsed 
          ? 'fixed left-0 top-0 h-full z-40 lg:relative lg:z-auto' 
          : 'fixed left-0 top-0 h-full z-40 lg:relative lg:z-auto'
      }`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          user={user}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content - No margin on large screens */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Fixed positioning */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden text-foreground hover:bg-muted"
              >
                <Menu size={20} />
              </Button>

              <div className="hidden lg:block">
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
                  <Home size={16} />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              )}

              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden mt-4">
            <h1 className="text-xl font-bold text-foreground">{title || 'Dashboard'}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </header>

        {/* Page Content - Scrollable area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}