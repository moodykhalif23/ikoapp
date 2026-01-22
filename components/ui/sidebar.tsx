"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Clock,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight
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
  // Define menu items based on user role
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

  const menuItems = getMenuItemsForRole(user?.role || user?.roles?.[0] || 'viewer')

  return (
    <div className={`sidebar-no-scroll bg-brand-green border-r border-brand-green/20 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col sidebar-force-white`}>
      {/* Header */}
      <div className="p-4 border-b border-brand-green/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Logo - hidden when collapsed on mobile, always visible on large screens */}
          <div className={`relative w-32 h-10 ${collapsed ? 'hidden lg:block' : 'block'}`}>
            <Image src="/logo.png" alt="IKO BRIQ Logo" fill className="object-contain" />
          </div>
          {/* Toggle button - hidden on large screens */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-8 w-8 sidebar-force-white sidebar-item-hover toggle-button-mobile-only"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange?.(item.id)}
              className={`w-full justify-start gap-3 h-12 px-3 text-left sidebar-force-white ${
                isActive
                  ? 'sidebar-item-active'
                  : 'sidebar-item-hover'
              }`}
            >
              <Icon size={20} className="flex-shrink-0 sidebar-force-white" />
              {/* Labels and badges - hidden when collapsed on mobile, always visible on large screens */}
              <div className={`flex items-center justify-between flex-1 ${collapsed ? 'hidden lg:flex' : 'flex'}`}>
                <span className="text-sm font-medium sidebar-force-white">{item.label}</span>
                {item.badge && (
                  <Badge
                    className={`h-6 px-2 text-xs font-medium sidebar-force-white ${
                      isActive 
                        ? 'badge-visible-active' 
                        : 'badge-visible'
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Button>
          )
        })}
      </nav>


    </div>
  )
}