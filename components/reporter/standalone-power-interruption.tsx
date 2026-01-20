"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PowerIcon from "@mui/icons-material/Power"
import { ArrowLeft } from "lucide-react"

interface StandalonePowerInterruptionProps {
  user: any
  onBack: () => void
  onSubmit?: (data: any) => void
}

const MACHINES = ["Machine A", "Machine B", "Machine C", "Machine D", "Machine E"]

export default function StandalonePowerInterruption({ user, onBack, onSubmit }: StandalonePowerInterruptionProps) {
  const [submitted, setSubmitted] = useState(false)
  const [noInterruptions, setNoInterruptions] = useState(false)
  const [formData, setFormData] = useState({
    id: `PWR-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    reportedBy: user?.name,
    reportedByEmail: user?.email,
    noInterruptions: false,
    occurredAt: "",
    duration: "",
    affectedMachines: [] as string[],
    cause: "",
    notes: "",
    submittedAt: null as string | null,
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
      cause: "",
      notes: "",
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
      occurredAt: "",
      duration: "",
      affectedMachines: [],
      cause: "",
      notes: "",
      submittedAt: null,
    })
    setNoInterruptions(false)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <PowerIcon sx={{ fontSize: 32, color: "#ea580c" }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Power Interruption Report</h1>
          <p className="text-muted-foreground">
            Report power interruptions as they occur - no need to wait for the daily report
          </p>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            This is a standalone power interruption report. You can submit this anytime an interruption occurs, 
            independent of your daily production reports.
          </AlertDescription>
        </Alert>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <PowerIcon sx={{ fontSize: 20 }} />
              Power Interruption Details
            </CardTitle>
            <CardDescription>
              Report Date: {new Date(formData.date).toLocaleDateString()} | Reporter: {user?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Checkbox
                id="no-interruptions"
                checked={noInterruptions}
                onCheckedChange={handleNoInterruptionsChange}
                className="border-primary"
              />
              <label htmlFor="no-interruptions" className="text-sm font-medium cursor-pointer">
                No power interruptions to report at this time
              </label>
            </div>

            {!noInterruptions && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time of Interruption *</label>
                    <Input
                      type="time"
                      value={formData.occurredAt}
                      onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
                      className={errors.occurredAt ? "border-red-500" : ""}
                    />
                    {errors.occurredAt && <p className="text-xs text-red-500">{errors.occurredAt}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (minutes) *</label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Affected Machines *</label>
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
                        <label htmlFor={machine} className="text-sm cursor-pointer font-medium">
                          {machine}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.affectedMachines && <p className="text-xs text-red-500">{errors.affectedMachines}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cause (optional)</label>
                  <Input
                    placeholder="What caused the interruption? (e.g., grid failure, maintenance, equipment fault)"
                    value={formData.cause}
                    onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Notes (optional)</label>
                  <Textarea
                    placeholder="Any additional details about the interruption, impact, or recovery actions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="resize-none"
                    rows={4}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}