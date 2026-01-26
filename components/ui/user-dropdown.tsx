"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Logout as LogOutIcon, 
  Person as UserIcon, 
  Settings as SettingsIcon 
} from "@mui/icons-material"

interface UserDropdownProps {
  user: any
  onLogout: () => void
  className?: string
}

export default function UserDropdown({ user, onLogout, className }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`p-0 h-auto hover:bg-transparent ${className}`}>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-[var(--brand-green-dark)] transition-colors">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user?.role || 'Role'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <UserIcon sx={{ fontSize: 16, marginRight: 1 }} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <SettingsIcon sx={{ fontSize: 16, marginRight: 1 }} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={onLogout}
        >
          <LogOutIcon sx={{ fontSize: 16, marginRight: 1 }} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
