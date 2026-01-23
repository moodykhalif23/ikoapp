"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import IncidentReportForm from "./forms/incident-report-form"
import { toast } from "sonner"

interface StandaloneIncidentReportProps {
  user: any
  onBack: () => void
  onSubmit?: (data: any) => void
}

export default function StandaloneIncidentReport({ user, onBack, onSubmit }: StandaloneIncidentReportProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (incidentData: any) => {
    setIsSubmitting(true)

    try {
      const reportData = {
        id: `INC-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        reportedBy: user?.name,
        reportedByEmail: user?.email,
        incidentReport: incidentData,
        status: 'submitted'
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        toast.success('Incident report submitted successfully!')
        if (onSubmit) {
          onSubmit(reportData)
        }
        onBack()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit report')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
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
            <AlertTriangle size={20} className="text-orange-500" />
            Incident Details
          </h2>
        </div>
        <IncidentReportForm
          data={{}}
          onComplete={handleSubmit}
        />
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg max-w-sm mx-4 p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Submitting Report...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we save your incident report
            </p>
          </div>
        </div>
      )}
    </div>
  )
}