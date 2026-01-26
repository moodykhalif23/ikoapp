"use client"

import { useState, useEffect } from "react"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { IMachine } from "@/lib/models"

interface PowerInterruptionFormProps {
  data: any
  onComplete: (data: any) => void
}

export default function PowerInterruptionForm({ data, onComplete }: PowerInterruptionFormProps) {
  const [noInterruptions, setNoInterruptions] = useState(data?.noInterruptions || false)
  const [machines, setMachines] = useState<IMachine[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    noInterruptions: data?.noInterruptions || false,
    occurredAt: data?.occurredAt || "",
    duration: data?.duration || "",
    affectedMachines: data?.affectedMachines || [],
    kplcMeterStart: data?.kplcMeterStart || data?.kplcMeter || "",
    kplcMeterEnd: data?.kplcMeterEnd || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch machines from database
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/machines')
        if (response.ok) {
          const machinesData = await response.json()
          setMachines(machinesData)
        } else {
          console.error('Failed to fetch machines')
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
      if (!formData.occurredAt) newErrors.occurredAt = "Time is required"
      if (!formData.duration) newErrors.duration = "Duration is required"
      if (formData.affectedMachines.length === 0) newErrors.affectedMachines = "Select at least one machine"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNoInterruptionsChange = (checked: boolean) => {
    setNoInterruptions(checked)
    setFormData({
      ...formData,
      noInterruptions: checked,
      occurredAt: "",
      duration: "",
      affectedMachines: [],
      kplcMeterStart: "",
      kplcMeterEnd: "",
    })
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <div className="bg-transparent animate-in fade-in duration-300 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Power Interruption Report</h2>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 sm:p-6 bg-primary/10 rounded-none border border-primary/20 backdrop-blur-sm">
          <Checkbox
            id="no-interruptions"
            checked={noInterruptions}
            onCheckedChange={handleNoInterruptionsChange}
            className="border-2 border-green-700 data-[state=checked]:bg-green-700 data-[state=checked]:border-green-700 mt-1 flex-shrink-0 w-5 h-5"
          />
          <label htmlFor="no-interruptions" className="text-base sm:text-lg font-semibold cursor-pointer leading-relaxed">
            No power interruptions occurred today
          </label>
        </div>

        {!noInterruptions && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="form-label-large text-foreground">Time of Interruption</label>
                <Input
                  type="time"
                  value={formData.occurredAt}
                  onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                  className={`bg-background/80 backdrop-blur-sm border-2 border-green-700 ${errors.occurredAt ? "border-red-500" : ""}`}
                />
                {errors.occurredAt && <p className="text-xs text-red-500">{errors.occurredAt}</p>}
              </div>

              <div className="space-y-2">
                <label className="form-label-large text-foreground">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={`bg-background/80 backdrop-blur-sm border-2 border-green-700 ${errors.duration ? "border-red-500" : ""}`}
                />
                {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <label className="form-label-large text-foreground">KPLC Meter Start</label>
                <Input
                  type="text"
                  placeholder="Enter start reading"
                  value={formData.kplcMeterStart}
                  onChange={(e) => setFormData({ ...formData, kplcMeterStart: e.target.value })}
                  className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label-large text-foreground">KPLC Meter End</label>
                <Input
                  type="text"
                  placeholder="Enter end reading"
                  value={formData.kplcMeterEnd}
                  onChange={(e) => setFormData({ ...formData, kplcMeterEnd: e.target.value })}
                  className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="form-label-large text-foreground">Affected Machines</label>
              {loading ? (
                <div className="flex items-center justify-center p-8 bg-muted/20 rounded-none backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading machines...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-border bg-white">
                    <select
                      value={formData.affectedMachines[0] || ""}
                      onChange={(e) => setFormData({ ...formData, affectedMachines: e.target.value ? [e.target.value] : [] })}
                      className="w-full h-12 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-white"
                    >
                      <option value="">Select machine</option>
                      {machines.map((machine) => (
                        <option key={machine._id.toString()} value={machine.name}>
                          {machine.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {errors.affectedMachines && <p className="text-xs text-red-500">{errors.affectedMachines}</p>}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="btn-large bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 py-4">
            Continue <ChevronRightIcon sx={{ fontSize: 20 }} />
          </Button>
        </div>
      </div>
    </div>
  )
}
