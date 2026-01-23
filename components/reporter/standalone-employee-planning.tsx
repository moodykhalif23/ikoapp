"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import EmployeePlanningForm from "./forms/employee-planning-form"
import { toast } from "sonner"

interface StandaloneEmployeePlanningProps {
  user: any
  reportId: string
  onBack: () => void
  onSaved?: () => void
}

export default function StandaloneEmployeePlanning({ user, reportId, onBack, onSaved }: StandaloneEmployeePlanningProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (planningData: any) => {
    setIsSubmitting(true)

    try {
      if (!reportId) {
        throw new Error("Draft report not found")
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeePlanning: planningData })
      })

      if (response.ok) {
        toast.success('Employee planning saved to draft')
        if (onSaved) onSaved()
        onBack()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save draft')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form */}
      <div>
        <div className="text-center mb-6">
          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
            <Users size={20} className="text-primary" />
            Staffing & Planning
          </h2>
        </div>
        <EmployeePlanningForm
          data={{}}
          onComplete={handleSubmit}
        />
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg max-w-sm mx-4 p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Saving Draft...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we save your planning data
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
