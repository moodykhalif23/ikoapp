"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import PowerIcon from "@mui/icons-material/Power"
import { Plus, Trash2 } from "lucide-react"

interface StandalonePowerInterruptionProps {
  user: any
  reportId: string
  onBack: () => void
  onSaved?: () => void
}

export default function StandalonePowerInterruption({ user, reportId, onBack, onSaved }: StandalonePowerInterruptionProps) {
  const [machines, setMachines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [noInterruptions, setNoInterruptions] = useState(false)
  const [formData, setFormData] = useState({
    id: `PWR-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    reportedBy: user?.name,
    reportedByEmail: user?.email,
    noInterruptions: false,
    interruptions: [] as Array<{
      id: string
      occurredAt: string
      duration: string
      kplcMeterStart: string
      kplcMeterEnd: string
      affectedMachines: string[]
    }>,
    submittedAt: null as string | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch machines from database
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/machines')
        if (response.ok) {
          const machinesData = await response.json()
          setMachines(machinesData.map((m: any) => m.name))
        }
      } catch (error) {
        console.error('Error fetching machines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMachines()
  }, [])

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
        const interruptions = Array.isArray(powerData.interruptions)
          ? powerData.interruptions.map((item: any) => ({
              ...item,
              kplcMeterStart: item.kplcMeterStart || item.kplcMeter || "",
              kplcMeterEnd: item.kplcMeterEnd || "",
            }))
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
          if (!interruption.duration) newErrors[`duration_${index}`] = "Duration is required"
          if (interruption.affectedMachines.length === 0) newErrors[`affectedMachines_${index}`] = "Select at least one machine"
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addInterruption = () => {
    const newInterruption = {
      id: `INT-${Date.now()}-${Math.random()}`,
      occurredAt: "",
      duration: "",
      kplcMeterStart: "",
      kplcMeterEnd: "",
      affectedMachines: [] as string[]
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
      interruptions: formData.interruptions.map(int => 
        int.id === interruptionId ? { ...int, [field]: value } : int
      )
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
        noInterruptions: formData.noInterruptions,
        interruptions: formData.interruptions,
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
                className="border-2 border-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700 mt-1 flex-shrink-0 w-5 h-5"
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <label className="text-base sm:text-lg font-semibold text-foreground">Duration (minutes) *</label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={interruption.duration}
                            onChange={(e) => updateInterruption(interruption.id, 'duration', e.target.value)}
                            className={`bg-background/80 backdrop-blur-sm ${errors[`duration_${index}`] ? "border-red-500" : ""}`}
                          />
                          {errors[`duration_${index}`] && <p className="text-xs text-red-500">{errors[`duration_${index}`]}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-base sm:text-lg font-semibold text-foreground">KPLC Meter Start</label>
                          <Input
                            type="text"
                            placeholder="Enter start reading"
                            value={interruption.kplcMeterStart}
                            onChange={(e) => updateInterruption(interruption.id, 'kplcMeterStart', e.target.value)}
                            className="bg-background/80 backdrop-blur-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-base sm:text-lg font-semibold text-foreground">KPLC Meter End</label>
                          <Input
                            type="text"
                            placeholder="Enter end reading"
                            value={interruption.kplcMeterEnd}
                            onChange={(e) => updateInterruption(interruption.id, 'kplcMeterEnd', e.target.value)}
                            className="bg-background/80 backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-base sm:text-lg font-semibold text-foreground">Affected Machines *</label>
                        <div className="bg-app-standard rounded-md p-[2px]">
                          <select
                            value={interruption.affectedMachines[0] || ""}
                            onChange={(e) => updateInterruption(interruption.id, 'affectedMachines', e.target.value ? [e.target.value] : [])}
                            className="w-full h-12 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-transparent"
                          >
                            <option value="">Select machine</option>
                            {machines.map((machine) => (
                              <option key={machine} value={machine}>
                                {machine}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[`affectedMachines_${index}`] && <p className="text-xs text-red-500">{errors[`affectedMachines_${index}`]}</p>}
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
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
