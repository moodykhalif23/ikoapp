"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PowerInterruptionForm from "./forms/power-interruption-form"
import SiteVisualsForm from "./forms/site-visuals-form"
import DailyProductionForm from "./forms/daily-production-form"
import IncidentReportForm from "./forms/incident-report-form"
import EmployeePlanningForm from "./forms/employee-planning-form"
import Check from "@mui/icons-material/Check"
import { toast } from "sonner" // Import Check component

interface ReportingFlowProps {
  onSubmit: (data: any) => void
  user: any
}

export default function ReportingFlow({ onSubmit, user }: ReportingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [reportData, setReportData] = useState({
    id: "",
    date: new Date().toISOString().split("T")[0],
    reportedBy: user?.name,
    reportedByEmail: user?.email,
    powerInterruptions: {},
    siteVisuals: {},
    dailyProduction: {},
    incidentReport: {},
    employeePlanning: {},
    submittedAt: null as string | null,
  })

  // Create report on component mount
  useEffect(() => {
    const createReport = async () => {
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: reportData.date,
            reportedBy: user?.name,
            reportedByEmail: user?.email
          })
        })

        if (response.ok) {
          const report = await response.json()
          setReportId(report.id)
          setReportData(prev => ({ ...prev, id: report.id }))
        } else {
          toast.error('Failed to create report')
        }
      } catch (error) {
        console.error('Error creating report:', error)
        toast.error('Failed to create report')
      }
    }

    if (user?.email && !reportId) {
      createReport()
    }
  }, [user?.email, reportId, reportData.date])

  const steps = [
    { id: 0, name: "Power Interruption", description: "Report any power interruptions" },
    { id: 1, name: "Site Visuals", description: "Add site photos and visual documentation" },
    { id: 2, name: "Daily Production", description: "Enter daily production data" },
    { id: 3, name: "Incident Report", description: "Document any incidents" },
    { id: 4, name: "Employee Planning", description: "Employee allocation and planning" },
  ]

  const handleStepComplete = async (stepData: any) => {
    if (!reportId) {
      toast.error('Report not created yet. Please try again.')
      return
    }

    setIsLoading(true)

    try {
      const endpoints = [
        '/power-interruption',
        '/site-visuals',
        '/daily-production',
        '/incident-report',
        '/employee-planning'
      ]

      const response = await fetch(`/api/reports/${reportId}${endpoints[currentStep]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData)
      })

      if (response.ok) {
        const stepKeys = ["powerInterruptions", "siteVisuals", "dailyProduction", "incidentReport", "employeePlanning"]
        setReportData({
          ...reportData,
          [stepKeys[currentStep]]: stepData,
        })

        // Mark step as completed
        setCompletedSteps(prev => new Set([...prev, currentStep]))

        // Auto-advance to next step if not the last one
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1)
        }

        toast.success(`${steps[currentStep].name} saved successfully!`)
      } else {
        const error = await response.json()
        toast.error(`Failed to save ${steps[currentStep].name}: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving step:', error)
      toast.error(`Failed to save ${steps[currentStep].name}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!reportId) {
      toast.error('Report not created yet. Please try again.')
      return
    }

    // Check if all steps are completed
    if (completedSteps.size < steps.length) {
      toast.error('Please complete all steps before submitting the report.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          submittedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        const completeReport = {
          ...reportData,
          submittedAt: new Date().toISOString(),
        }
        setReportData(completeReport)
        setSubmitted(true)
        onSubmit(completeReport)
        toast.success('Report submitted successfully!')
      } else {
        const error = await response.json()
        toast.error(`Failed to submit report: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setSubmitted(false)
    setReportData({
      id: `RPT-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      reportedBy: user?.name,
      reportedByEmail: user?.email,
      powerInterruptions: {},
      siteVisuals: {},
      dailyProduction: {},
      incidentReport: {},
      employeePlanning: {},
      submittedAt: null,
    })
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow going back to completed steps or current step
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex)
    } else {
      toast.error('Please complete the current step before proceeding to the next one.')
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-96 px-4 sm:px-6">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon sx={{ fontSize: 40, color: "#16a34a" }} />
            </div>
          </div>
          <div>
            <h2 className="text-xxlarge text-foreground mb-4">Report Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-1">
              Report ID: <span className="font-mono font-semibold">{reportData.id}</span>
            </p>
            <p className="text-sm text-muted-foreground">Admins and viewers have been notified</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You can view your reports in the Reports section of your dashboard
            </p>
            <Button onClick={handleReset} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full touch-target btn-large">
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-4 py-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <button
              onClick={() => handleStepClick(index)}
              disabled={index > currentStep && !completedSteps.has(index)}
              className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all mb-2 touch-target ${
                completedSteps.has(index)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-lg"
                  : index === currentStep
                    ? "bg-accent text-accent-foreground ring-2 ring-accent/50 cursor-pointer shadow-md"
                    : index < currentStep || completedSteps.has(index)
                      ? "bg-primary/70 text-primary-foreground hover:bg-primary/80 cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {completedSteps.has(index) ? <Check className="w-5 h-5" /> : index + 1}
            </button>
            <span className={`text-xs sm:text-xs font-medium text-center max-w-[60px] sm:max-w-[80px] truncate ${
              index <= currentStep || completedSteps.has(index)
                ? "text-foreground cursor-pointer hover:text-primary"
                : "text-muted-foreground"
            }`} onClick={() => handleStepClick(index)}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="relative">
        {currentStep === 0 && (
          <PowerInterruptionForm data={reportData.powerInterruptions} onComplete={handleStepComplete} />
        )}
        {currentStep === 1 && <SiteVisualsForm data={reportData.siteVisuals} onComplete={handleStepComplete} />}
        {currentStep === 2 && <DailyProductionForm data={reportData.dailyProduction} onComplete={handleStepComplete} />}
        {currentStep === 3 && <IncidentReportForm data={reportData.incidentReport} onComplete={handleStepComplete} />}
        {currentStep === 4 && (
          <EmployeePlanningForm
            data={reportData.employeePlanning}
            onComplete={handleStepComplete}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 justify-between pt-6 border-t border-border/50">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className="px-6 sm:px-6 bg-transparent touch-target"
            size="lg"
          >
            Back
          </Button>
          {currentStep === steps.length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={!completedSteps.has(currentStep) || isLoading}
              className="px-6 sm:px-6 bg-primary hover:bg-primary/90 touch-target btn-large"
              size="lg"
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          )}
        </div>
        <div className="text-sm sm:text-sm text-muted-foreground flex items-center justify-center gap-2 py-2 sm:py-0">
          Step {currentStep + 1} of {steps.length}
          {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
        </div>
      </div>
    </div>
  )
}
