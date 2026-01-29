"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import IncidentReportForm from "./forms/incident-report-form"
import { toast } from "sonner"

interface StandaloneIncidentReportProps {
  user: any
  reportId: string
  onBack: () => void
  onSaved?: () => void
}

export default function StandaloneIncidentReport({ user, reportId, onBack, onSaved }: StandaloneIncidentReportProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<any>({})

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
        const incidentData = report.incidentReportId || report.incidentReport || {}
        setInitialData(incidentData)
      })
      .catch(() => null)
    return () => {
      isMounted = false
    }
  }, [reportId])

  const handleSubmit = async (incidentData: any) => {
    setIsSubmitting(true)

    try {
      if (!reportId) {
        throw new Error("Draft report not found")
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentReport: incidentData })
      })

      if (response.ok) {
        toast.success('Incident report saved to draft')
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
            <AlertTriangle size={20} className="text-orange-500" />
            Incident Details
          </h2>
        </div>
        <IncidentReportForm data={initialData} onComplete={handleSubmit} />
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg max-w-sm mx-4 p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Saving Draft...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we save your incident report
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
