"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PowerIcon from "@mui/icons-material/Power"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface StandalonePowerInterruptionProps {
  user: any
  onBack: () => void
  onSubmit?: (data: any) => void
}

export default function StandalonePowerInterruption({ user, onBack, onSubmit }: StandalonePowerInterruptionProps) {
  const [machines, setMachines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
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

  const toggleMachine = (interruptionId: string, machine: string) => {
    setFormData({
      ...formData,
      interruptions: formData.interruptions.map(int => 
        int.id === interruptionId 
          ? {
              ...int,
              affectedMachines: int.affectedMachines.includes(machine)
                ? int.affectedMachines.filter(m => m !== machine)
                : [...int.affectedMachines, machine]
            }
          : int
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

  const handleSubmit = () => {
    if (validateForm()) {
      const completeReport = {
        ...formData,
        submittedAt: new Date().toISOString(),
      }
      setFormData(completeReport)
      setSubmitted(true)
      if (onSubmit) {
        onSubmit(completeReport)
      }
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({
      id: `PWR-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      reportedBy: user?.name,
      reportedByEmail: user?.email,
      noInterruptions: false,
      interruptions: [],
      submittedAt: null,
    })
    setNoInterruptions(false)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircleIcon sx={{ fontSize: 40, color: "#16a34a" }} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Power Interruption Report Submitted!</h2>
              <p className="text-muted-foreground mb-1">
                Report ID: <span className="font-mono font-semibold">{formData.id}</span>
              </p>
              <p className="text-sm text-muted-foreground">Admins and viewers have been notified</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can submit another power interruption report anytime
              </p>
              <div className="flex gap-2">
                <Button onClick={handleReset} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Report Another Interruption
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <PowerIcon sx={{ fontSize: 32, color: "#ea580c" }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Power Interruption Report</h1>
        </div>

        <div className="bg-transparent border-border/50">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
              <PowerIcon sx={{ fontSize: 24 }} />
              Power Interruption Details
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3 p-4 sm:p-6 bg-primary/10 rounded-lg border border-primary/20 backdrop-blur-sm">
              <Checkbox
                id="no-interruptions"
                checked={noInterruptions}
                onCheckedChange={handleNoInterruptionsChange}
                className="border-primary mt-1 flex-shrink-0"
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
                  <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-lg bg-background/40 backdrop-blur-sm">
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
                  <div key={interruption.id} className="border border-orange-200/50 bg-orange-50/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 space-y-4">
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
                      </div>

                      <div className="space-y-3">
                        <label className="text-base sm:text-lg font-semibold text-foreground">Affected Machines *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {machines.map((machine) => (
                            <div
                              key={machine}
                              className="flex items-start space-x-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors backdrop-blur-sm bg-background/40"
                            >
                              <Checkbox
                                id={`${interruption.id}-${machine}`}
                                checked={interruption.affectedMachines.includes(machine)}
                                onCheckedChange={() => toggleMachine(interruption.id, machine)}
                                className="border-primary mt-1 flex-shrink-0"
                              />
                              <label htmlFor={`${interruption.id}-${machine}`} className="text-sm cursor-pointer font-medium leading-relaxed">
                                {machine}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors[`affectedMachines_${index}`] && <p className="text-xs text-red-500">{errors[`affectedMachines_${index}`]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}