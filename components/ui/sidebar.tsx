"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Clock,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react"
import Image from "next/image"

interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  user?: any
  onLogout?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({
  activeTab = "reports",
  onTabChange,
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      badge: "12"
    },
    {
      id: "time-tracking",
      label: "Time Tracking",
      icon: Clock,
      badge: "3"
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      badge: null
    },
    {
      id: "machines",
      label: "Equipment",
      icon: Settings,
      badge: "2"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: AlertTriangle,
      badge: "5"
    }
  ]

  return (
    <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="relative w-24 h-8">
              <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange?.(item.id)}
              className={`w-full justify-start gap-3 h-10 px-3 text-left transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className="h-5 px-2 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-sidebar-accent-foreground truncate">
                {user?.role || 'Role'}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full mt-3 gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
}