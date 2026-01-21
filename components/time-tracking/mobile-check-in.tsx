"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, MapPin, User, Calendar, Timer, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface MobileCheckInProps {
  user: any
  onTimeEntryUpdate?: () => void
}

export default function MobileCheckIn({ user, onTimeEntryUpdate }: MobileCheckInProps) {
  const [loading, setLoading] = useState(false)
  const [activeEntry, setActiveEntry] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState("")
  const [shiftType, setShiftType] = useState("morning")

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
          location
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
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        setActiveEntry(null)
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
    <div className="min-h-screen bg-app-standard p-4 safe-area-inset">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Time Clock</h1>
        <p className="text-muted-foreground">Tap to clock in/out</p>
      </div>

      {/* Current Time Display */}
      <Card className="card-brand card-elevated mb-6">
        <CardContent className="text-center py-8">
          <div className="text-4xl font-mono font-bold text-primary mb-2">
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
        </CardContent>
      </Card>

      {/* Active Session Status */}
      {activeEntry && (
        <Card className="card-brand card-elevated mb-6 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700 dark:text-green-400">Currently Working</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeEntry.shiftType}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-mono text-lg font-medium">
                  {new Date(activeEntry.clockInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-mono text-lg font-medium text-green-700 dark:text-green-400">
                  {formatDuration(activeEntry.clockInTime)}
                </div>
              </div>
            </div>

            {activeEntry.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{activeEntry.location}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clock In Options */}
      {!activeEntry && (
        <Card className="card-brand card-elevated mb-6">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shift Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'morning', label: 'Morning' },
                  { value: 'afternoon', label: 'Afternoon' },
                  { value: 'night', label: 'Night' },
                  { value: 'overtime', label: 'Overtime' }
                ].map((shift) => (
                  <button
                    key={shift.value}
                    onClick={() => setShiftType(shift.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors touch-target ${
                      shiftType === shift.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {shift.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location (optional)</label>
              <input
                type="text"
                placeholder="e.g., Production Line A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background focus:border-primary focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <Button
        onClick={activeEntry ? handleClockOut : handleClockIn}
        disabled={loading}
        className={`w-full text-xl py-8 gap-4 rounded-2xl shadow-lg ${
          activeEntry
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {loading ? (
          <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
        ) : activeEntry ? (
          <>
            <LogOut className="w-6 h-6" />
            Clock Out
          </>
        ) : (
          <>
            <LogIn className="w-6 h-6" />
            Clock In
          </>
        )}
      </Button>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Card className="card-brand">
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {/* This would be fetched from API */}
              --
            </div>
            <div className="text-xs text-muted-foreground">Today's Hours</div>
          </CardContent>
        </Card>
        <Card className="card-brand">
          <CardContent className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {/* This would be fetched from API */}
              --
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Success Animation */}
      {activeEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="card-brand card-elevated max-w-sm mx-4">
            <CardContent className="text-center p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Clocked In Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                You started working at {new Date(activeEntry.clockInTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <Button
                onClick={() => {/* Close modal */}}
                className="w-full"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}