"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface PowerInterruptionFormProps {
  data: any
  onComplete: (data: any) => void
}

const MACHINES = ["Machine A", "Machine B", "Machine C", "Machine D", "Machine E"]

export default function PowerInterruptionForm({ data, onComplete }: PowerInterruptionFormProps) {
  const [noInterruptions, setNoInterruptions] = useState(data?.noInterruptions || false)
  const [formData, setFormData] = useState({
    noInterruptions: data?.noInterruptions || false,
    occurredAt: data?.occurredAt || "",
    duration: data?.duration || "",
    affectedMachines: data?.affectedMachines || [],
    kplcMeter: data?.kplcMeter || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const toggleMachine = (machine: string) => {
    setFormData({
      ...formData,
      affectedMachines: formData.affectedMachines.includes(machine)
        ? formData.affectedMachines.filter((m: string) => m !== machine)
        : [...formData.affectedMachines, machine],
    })
  }

  const handleNoInterruptionsChange = (checked: boolean) => {
    setNoInterruptions(checked)
    setFormData({
      ...formData,
      noInterruptions: checked,
      occurredAt: "",
      duration: "",
      affectedMachines: [],
      kplcMeter: "",
    })
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <Card className="border-border/50 animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-primary">Power Interruption Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <Checkbox
            id="no-interruptions"
            checked={noInterruptions}
            onCheckedChange={handleNoInterruptionsChange}
            className="border-primary"
          />
          <label htmlFor="no-interruptions" className="text-sm font-medium cursor-pointer ml-2">
            No power interruptions occurred today
          </label>
        </div>

        {!noInterruptions && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time of Interruption</label>
                <Input
                  type="time"
                  value={formData.occurredAt}
                  onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                  className={errors.occurredAt ? "border-red-500" : ""}
                />
                {errors.occurredAt && <p className="text-xs text-red-500">{errors.occurredAt}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">KPLC Meter Reading</label>
                <Input
                  type="number"
                  placeholder="Enter meter reading"
                  value={formData.kplcMeter}
                  onChange={(e) => setFormData({ ...formData, kplcMeter: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Affected Machines</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MACHINES.map((machine) => (
                  <div
                    key={machine}
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={machine}
                      checked={formData.affectedMachines.includes(machine)}
                      onCheckedChange={() => toggleMachine(machine)}
                      className="border-primary"
                    />
                    <label htmlFor={machine} className="text-sm cursor-pointer font-medium ml-2">
                      {machine}
                    </label>
                  </div>
                ))}
              </div>
              {errors.affectedMachines && <p className="text-xs text-red-500">{errors.affectedMachines}</p>}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
