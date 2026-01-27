"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import PowerIcon from "@mui/icons-material/Power"
import StopIcon from "@mui/icons-material/Stop"
import { Plus, Trash2 } from "lucide-react"

interface StandalonePowerInterruptionProps {
  user: any
  reportId: string
  onBack: () => void
  onSaved?: () => void
}

interface PowerInterruption {
  id: string
  occurredAt: string
  duration: number
  kplcReferenceNumber: string
  timerActive: boolean
  timerStartTime: number | null
}

interface ActiveTimer {
  interruptionId: string
  startTime: number
  reportId: string
}

export default function StandalonePowerInterruption({ user, reportId, onBack, onSaved }: StandalonePowerInterruptionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [noInterruptions, setNoInterruptions] = useState(false)
  const [formData, setFormData] = useState({
    id: `PWR-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    reportedBy: user?.name,
    reportedByEmail: user?.email,
    noInterruptions: false,
    interruptions: [] as PowerInterruption[],
    submittedAt: null as string | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [timerDisplay, setTimerDisplay] = useState<Record<string, string>>({})

  // Get active timer from localStorage
  const getActiveTimerFromStorage = (): ActiveTimer | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(`pwr-timer-${reportId}`)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // Save active timer to localStorage
  const saveActiveTimerToStorage = (interruptionId: string, startTime: number) => {
    if (typeof window === 'undefined') return
    try {
      const timer: ActiveTimer = {
        interruptionId,
        startTime,
        reportId
      }
      localStorage.setItem(`pwr-timer-${reportId}`, JSON.stringify(timer))
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Clear active timer from localStorage
  const clearActiveTimerFromStorage = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(`pwr-timer-${reportId}`)
    } catch {
      // Silent fail for localStorage errors
    }
  }

  // Timer effect - runs every second and uses localStorage for persistence
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData((prev) => {
        const updated = { ...prev }
        updated.interruptions = updated.interruptions.map((interruption) => {
          if (interruption.timerActive && interruption.timerStartTime) {
            const elapsed = Math.floor((Date.now() - interruption.timerStartTime) / 1000)
            setTimerDisplay((prevDisplay) => ({
              ...prevDisplay,
              [interruption.id]: formatTime(elapsed)
            }))
            return { ...interruption, duration: elapsed }
          }
          return interruption
        })
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const stopTimer = (interruptionId: string) => {
    setFormData((prev) => ({
      ...prev,
      interruptions: prev.interruptions.map((int) =>
        int.id === interruptionId
          ? { ...int, timerActive: false }
          : int
      )
    }))
    // Clear timer from localStorage when stopped
    clearActiveTimerFromStorage()
  }

  useEffect(() => {
    if (!reportId) return
    let isMounted = true
    fetch(`/api/reports/${reportId}`)
      .then(async (response) => {
        if (!response.ok) return null
        return response.json()
      })
      .then((report) => {
        if (!isMounted || !report) return
        const powerData = report.powerInterruptions || {}
        const activeTimer = getActiveTimerFromStorage()
        const interruptions = Array.isArray(powerData.interruptions)
          ? powerData.interruptions.map((item: any) => {
              const baseInterruption = {
                ...item,
                timerActive: false,
                timerStartTime: null,
                duration: item.duration || 0
              }
              // Restore active timer if it matches this interruption
              if (activeTimer && activeTimer.interruptionId === item.id && activeTimer.reportId === reportId) {
                return {
                  ...baseInterruption,
                  timerActive: true,
                  timerStartTime: activeTimer.startTime
                }
              }
              return baseInterruption
            })
          : []
        setNoInterruptions(!!powerData.noInterruptions)
        setFormData((prev) => ({
          ...prev,
          date: report.date || prev.date,
          reportedBy: report.reportedBy || prev.reportedBy,
          reportedByEmail: report.reportedByEmail || prev.reportedByEmail,
          noInterruptions: !!powerData.noInterruptions,
          interruptions,
          submittedAt: powerData.submittedAt || prev.submittedAt
        }))
      })
      .catch(() => null)
    return () => {
      isMounted = false
    }
  }, [reportId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.noInterruptions) {
      if (formData.interruptions.length === 0) {
        newErrors.interruptions = "Add at least one interruption or check 'No interruptions'"
      } else {
        formData.interruptions.forEach((interruption, index) => {
          if (!interruption.occurredAt) newErrors[`occurredAt_${index}`] = "Time is required"
          if (interruption.duration === 0) newErrors[`duration_${index}`] = "Duration cannot be zero"
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addInterruption = () => {
    const newInterruption: PowerInterruption = {
      id: `INT-${Date.now()}-${Math.random()}`,
      occurredAt: "",
      duration: 0,
      kplcReferenceNumber: "",
      timerActive: false,
      timerStartTime: null
    }
    setFormData({
      ...formData,
      interruptions: [...formData.interruptions, newInterruption]
    })
  }

  const removeInterruption = (interruptionId: string) => {
    setFormData({
      ...formData,
      interruptions: formData.interruptions.filter(int => int.id !== interruptionId)
    })
  }

  const updateInterruption = (interruptionId: string, field: string, value: any) => {
    setFormData({
      ...formData,
      interruptions: formData.interruptions.map(int => {
        if (int.id === interruptionId) {
          const updated = { ...int, [field]: value }
          // Auto-start timer when time of interruption is entered
          if (field === 'occurredAt' && value && !int.timerActive) {
            const now = Date.now()
            updated.timerActive = true
            updated.timerStartTime = now
            // Save timer to localStorage for persistence across navigation
            saveActiveTimerToStorage(interruptionId, now)
          }
          return updated
        }
        return int
      })
    })
  }

  const handleNoInterruptionsChange = (checked: boolean) => {
    setNoInterruptions(checked)
    setFormData({
      ...formData,
      noInterruptions: checked,
      interruptions: [],
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    if (!reportId) {
      setErrors((prev) => ({ ...prev, submit: "Draft report not found" }))
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        noInterruptions: formData.noInterruptions === true,
        interruptions: formData.noInterruptions ? [] : formData.interruptions.map((interruption) => ({
          id: interruption.id,
          occurredAt: interruption.occurredAt,
          duration: interruption.duration,
          kplcReferenceNumber: interruption.kplcReferenceNumber
        }))
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ powerInterruptions: payload })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save draft")
      }

      // Clear timer from localStorage after successful save
      clearActiveTimerFromStorage()

      if (onSaved) onSaved()
      onBack()
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Failed to save draft"
      }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
              <PowerIcon sx={{ fontSize: 24 }} />
              Power Interruption Details
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3 p-4 sm:p-6 rounded-none border-2 border-green-700 backdrop-blur-sm">
              <Checkbox
                id="no-interruptions"
                checked={noInterruptions}
                onCheckedChange={handleNoInterruptionsChange}
                className="border-2 border-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700 mt-1 shrink-0 w-5 h-5"
              />
              <label htmlFor="no-interruptions" className="text-base sm:text-lg font-semibold cursor-pointer leading-relaxed">
                No power interruptions to report at this time
              </label>
            </div>

            {!noInterruptions && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Power Interruptions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInterruption}
                    className="gap-2 bg-background/80 backdrop-blur-sm"
                  >
                    <Plus size={16} />
                    Add Interruption
                  </Button>
                </div>

                {errors.interruptions && <p className="text-xs text-red-500 mb-4">{errors.interruptions}</p>}

                {formData.interruptions.length === 0 && (
                  <div className="text-center py-8 border-2 border-green-700 rounded-none bg-background/40 backdrop-blur-sm">
                    <PowerIcon sx={{ fontSize: 32, color: "#ea580c" }} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">No interruptions added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addInterruption}
                      className="gap-2 bg-background/80 backdrop-blur-sm"
                    >
                      <Plus size={16} />
                      Add First Interruption
                    </Button>
                  </div>
                )}

                {formData.interruptions.map((interruption, index) => (
                  <div key={interruption.id} className="border-2 border-green-700 bg-orange-50/20 backdrop-blur-sm rounded-none p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-semibold text-orange-800">
                        Interruption #{index + 1}
                      </h4>
                      {formData.interruptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInterruption(interruption.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-base sm:text-lg font-semibold text-foreground">Time of Interruption *</label>
                          <Input
                            type="time"
                            value={interruption.occurredAt}
                            onChange={(e) => updateInterruption(interruption.id, 'occurredAt', e.target.value)}
                            className={`bg-background/80 backdrop-blur-sm ${errors[`occurredAt_${index}`] ? "border-red-500" : ""}`}
                          />
                          {errors[`occurredAt_${index}`] && <p className="text-xs text-red-500">{errors[`occurredAt_${index}`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-base sm:text-lg font-semibold text-foreground">KPLC Reference Number</label>
                          <Input
                            type="text"
                            placeholder="Enter KPLC reference number"
                            value={interruption.kplcReferenceNumber}
                            onChange={(e) => updateInterruption(interruption.id, 'kplcReferenceNumber', e.target.value)}
                            className="bg-background/80 backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      {/* Timer Section */}
                      <div className="space-y-3 p-4 border border-orange-300 bg-orange-50/50 rounded-none">
                        <label className="text-base sm:text-lg font-semibold text-foreground">Duration Timer</label>
                        
                        <div className="flex items-center justify-between p-4 bg-white border border-orange-200 rounded-none">
                          <div className="text-3xl font-mono font-bold text-orange-800">
                            {timerDisplay[interruption.id] || "00:00:00"}
                          </div>
                          <div className="flex gap-2">
                            {interruption.timerActive && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => stopTimer(interruption.id)}
                                variant="destructive"
                                className="p-2"
                                aria-label="Stop"
                              >
                                <StopIcon sx={{ fontSize: 18 }} />
                              </Button>
                            )}
                          </div>
                        </div>
                        {errors[`duration_${index}`] && <p className="text-xs text-red-500">{errors[`duration_${index}`]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {errors.submit && (
              <p className="text-xs text-red-500 mt-2">{errors.submit}</p>
            )}
            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-(--brand-green-dark) text-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
