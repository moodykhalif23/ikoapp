"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

interface EmployeePlanningFormProps {
  data: any
  onComplete: (data: any) => void
  onSubmit: () => void
}

export default function EmployeePlanningForm({ data, onComplete, onSubmit }: EmployeePlanningFormProps) {
  const [formData, setFormData] = useState({
    employeesPresent: data?.employeesPresent || "",
    employeesAbsent: data?.employeesAbsent || "",
    plannedShifts: data?.plannedShifts || "",
    notes: data?.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeesPresent) newErrors.employeesPresent = "Number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData)
      // Small delay to show completion animation
      setTimeout(onSubmit, 500)
    }
  }

  return (
    <Card className="border-border/50 animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-primary">Employee Planning</CardTitle>
        <CardDescription>Document today's employee allocation and planning</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employees Present</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.employeesPresent}
              onChange={(e) => setFormData({ ...formData, employeesPresent: e.target.value })}
              className={errors.employeesPresent ? "border-red-500" : ""}
            />
            {errors.employeesPresent && <p className="text-xs text-red-500">{errors.employeesPresent}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employees Absent</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.employeesAbsent}
              onChange={(e) => setFormData({ ...formData, employeesAbsent: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Planned Shifts</label>
          <select
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.plannedShifts}
            onChange={(e) => setFormData({ ...formData, plannedShifts: e.target.value })}
          >
            <option value="">Select shift configuration</option>
            <option value="single">Single Shift</option>
            <option value="double">Double Shift</option>
            <option value="triple">Triple Shift</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Any employee planning notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Report Summary</p>
          <ul className="text-sm space-y-1 text-foreground">
            <li>✓ All 5 sections will be completed</li>
            <li>✓ Report ready for submission</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onComplete} className="flex-1 bg-transparent">
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Check className="w-4 h-4" />
            Submit Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
