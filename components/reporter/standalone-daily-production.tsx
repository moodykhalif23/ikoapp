"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import DailyProductionForm from "./forms/daily-production-form"
import { toast } from "sonner"

interface StandaloneDailyProductionProps {
  user: any
  onBack: () => void
  onSubmit?: (data: any) => void
}

export default function StandaloneDailyProduction({ user, onBack, onSubmit }: StandaloneDailyProductionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (productionData: any) => {
    setIsSubmitting(true)

    try {
      const reportData = {
        id: `RPT-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        reportedBy: user?.name,
        reportedByEmail: user?.email,
        dailyProduction: productionData,
        status: 'submitted'
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        toast.success('Daily production report submitted successfully!')
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
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Daily Production Report
        </h1>
      </div>

      {/* Form */}
      <div>
        <div className="text-center mb-6">
          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
            <Save size={20} className="text-primary" />
            Production Data Entry
          </h2>
        </div>
        <DailyProductionForm
          data={{}}
          onComplete={handleSubmit}
        />
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="card-brand card-elevated max-w-sm mx-4">
            <CardContent className="text-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Submitting Report...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we save your production data
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}