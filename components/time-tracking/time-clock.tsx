"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, MapPin, User, Calendar, Timer } from "lucide-react"
import { toast } from "sonner"

interface TimeClockProps {
  user: any
  onTimeEntryUpdate?: () => void
}

interface ActiveTimeEntry {
  _id: string
  clockInTime: string
  shiftType: string
  location?: string
  notes?: string
}

export default function TimeClock({ user, onTimeEntryUpdate }: TimeClockProps) {
  const [loading, setLoading] = useState(false)
  const [activeEntry, setActiveEntry] = useState<ActiveTimeEntry | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState("")
  const [shiftType, setShiftType] = useState("morning")
  const [notes, setNotes] = useState("")

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check for active time entry on component mount
  useEffect(() => {
    checkActiveEntry()
  }, [user])

  const checkActiveEntry = async () => {
    // Don't make API call if user._id is not available
    if (!user?._id) {
      return
    }
    
    try {
      const response = await fetch(`/api/time-tracking?employeeId=${user._id}&status=active`)
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setActiveEntry(data.data[0])
        }
      }
    } catch (error) {
      console.error('Error checking active entry:', error)
    }
  }

  const handleClockIn = async () => {
    // Validate user data before making API call
    if (!user?._id || !user?.name || !user?.email) {
      toast({
        title: "Error",
        description: "User information is missing. Please refresh and try again.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user._id,
          employeeName: user.name,
          employeeEmail: user.email,
          shiftType,
          location,
          notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveEntry(data.data)
        toast.success('Clocked in successfully!')
        if (onTimeEntryUpdate) onTimeEntryUpdate()
      } else {
        toast.error(data.error || 'Failed to clock in')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!activeEntry) return

    setLoading(true)
    try {
      const response = await fetch(`/api/time-tracking/${activeEntry._id}/clock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveEntry(null)
        setNotes("")
        toast.success('Clocked out successfully!')
        if (onTimeEntryUpdate) onTimeEntryUpdate()
      } else {
        toast.error(data.error || 'Failed to clock out')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className="card-brand card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Time Clock
        </CardTitle>
        <CardDescription>
          Track your work hours and attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center p-6 bg-muted/50 rounded-lg border">
          <div className="text-3xl font-mono font-bold text-primary mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Active Session Display */}
        {activeEntry && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700 dark:text-green-400">Currently Clocked In</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeEntry.shiftType}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Clock In:</span>
                <div className="font-mono font-medium">
                  {new Date(activeEntry.clockInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <div className="font-mono font-medium text-green-700 dark:text-green-400">
                  {formatDuration(activeEntry.clockInTime)}
                </div>
              </div>
            </div>

            {activeEntry.location && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-2">{activeEntry.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Clock In Form */}
        {!activeEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Shift Type
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production Line A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none"
              />
            </div>
          </div>
        )}

        {/* Clock Out Notes */}
        {activeEntry && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Clock Out Notes (optional)</label>
            <textarea
              placeholder="End of shift notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background resize-none"
            />
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={activeEntry ? handleClockOut : handleClockIn}
          disabled={loading}
          className={`w-full text-lg py-6 gap-3 ${
            activeEntry
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : activeEntry ? (
            <>
              <LogOut className="w-5 h-5" />
              Clock Out
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Clock In
            </>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {/* This would be fetched from API */}
              --
            </div>
            <div className="text-xs text-muted-foreground">Today's Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {/* This would be fetched from API */}
              --
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}