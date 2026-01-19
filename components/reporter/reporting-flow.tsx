"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PowerInterruptionForm from "./forms/power-interruption-form"
import SiteVisualsForm from "./forms/site-visuals-form"
import DailyProductionForm from "./forms/daily-production-form"
import IncidentReportForm from "./forms/incident-report-form"
import EmployeePlanningForm from "./forms/employee-planning-form"
import Check from "@mui/icons-material/Check" // Import Check component

interface ReportingFlowProps {
  onSubmit: (data: any) => void
  user: any
}

export default function ReportingFlow({ onSubmit, user }: ReportingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [reportData, setReportData] = useState({
    id: `RPT-${Date.now()}`,
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

  const steps = [
    { id: 0, name: "Power Interruption", description: "Report any power interruptions" },
    { id: 1, name: "Site Visuals", description: "Add site photos and visual documentation" },
    { id: 2, name: "Daily Production", description: "Enter daily production data" },
    { id: 3, name: "Incident Report", description: "Document any incidents" },
    { id: 4, name: "Employee Planning", description: "Employee allocation and planning" },
  ]

  const handleStepComplete = (stepData: any) => {
    const stepKeys = ["powerInterruptions", "siteVisuals", "dailyProduction", "incidentReport", "employeePlanning"]
    setReportData({
      ...reportData,
      [stepKeys[currentStep]]: stepData,
    })

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = () => {
    const completeReport = {
      ...reportData,
      submittedAt: new Date().toISOString(),
    }
    setReportData(completeReport)
    setSubmitted(true)
    onSubmit(completeReport)
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

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon sx={{ fontSize: 40, color: "#16a34a" }} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Report Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-1">
              Report ID: <span className="font-mono font-semibold">{reportData.id}</span>
            </p>
            <p className="text-sm text-muted-foreground">Admins and viewers have been notified</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You can view your reports in the Reports section of your dashboard
            </p>
            <Button onClick={handleReset} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all mb-2 ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "bg-accent text-accent-foreground ring-2 ring-accent/50"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span className="text-xs font-medium text-center text-foreground hidden sm:inline max-w-[80px]">
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
      <div className="flex gap-3 justify-between pt-4 border-t border-border/50">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="px-6 bg-transparent">
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  )
}
