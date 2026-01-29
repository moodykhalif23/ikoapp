"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"

interface IncidentReportFormProps {
  data: any
  onComplete: (data: any) => void
}

export default function IncidentReportForm({ data, onComplete }: IncidentReportFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    hasIncident: data?.hasIncident || "no",
    incidentType: data?.incidentType || "",
    incidentTime: data?.incidentTime || "",
    description: data?.description || "",
    actionTaken: data?.actionTaken || ""
  })

  useEffect(() => {
    setFormData({
      hasIncident: data?.hasIncident || "no",
      incidentType: data?.incidentType || "",
      incidentTime: data?.incidentTime || "",
      description: data?.description || "",
      actionTaken: data?.actionTaken || ""
    })
  }, [data])

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}

    if (formData.hasIncident === "yes") {
      if (!formData.incidentType) nextErrors.incidentType = "Incident type is required"
      if (!formData.description) nextErrors.description = "Description is required"
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onComplete(formData)
  }

  return (
    <div className="bg-transparent animate-in fade-in duration-300 space-y-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-lg sm:text-xl font-semibold text-foreground">Were there any incidents today?</label>
          <div className="flex gap-4 flex-wrap">
            {["no", "yes"].map((option) => (
              <div
                key={option}
                className="flex items-center space-x-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  id={`incident-${option}`}
                  name="hasIncident"
                  value={option}
                  checked={formData.hasIncident === option}
                  onChange={(e) => {
                    const nextValue = e.target.value
                    if (nextValue === "no") {
                      setFormData({
                        ...formData,
                        hasIncident: nextValue,
                        incidentType: "",
                        incidentTime: "",
                        description: "",
                        actionTaken: ""
                      })
                      setErrors({})
                      return
                    }
                    setFormData({ ...formData, hasIncident: nextValue })
                  }}
                  className="w-5 h-5 cursor-pointer mt-1 shrink-0"
                />
                <label htmlFor={`incident-${option}`} className="text-sm cursor-pointer font-medium capitalize leading-relaxed">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {formData.hasIncident === "yes" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="incident-type" className="text-lg sm:text-xl font-semibold text-foreground">Incident Type</label>
                <select
                  id="incident-type"
                  className="w-full px-3 pr-8 py-2 border border-primary/20 rounded-md bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-right bg-[length:16px_16px] bg-[position:right_8px_center]"
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`
                  }}
                >
                  <option value="">Select incident type</option>
                  <option value="equipment">Equipment Failure</option>
                  <option value="injury">Injury</option>
                  <option value="other">Other</option>
                </select>
                {errors.incidentType && <p className="text-xs text-red-500">{errors.incidentType}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-lg sm:text-xl font-semibold text-foreground">Time of Incident</label>
                <Input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                  className="bg-background/80 backdrop-blur-sm border-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg sm:text-xl font-semibold text-foreground">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Describe what happened..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-lg sm:text-xl font-semibold text-foreground">Action Taken</label>
              <textarea
                className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="What action was taken in response..."
                value={formData.actionTaken}
                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-(--brand-green-dark) text-primary-foreground gap-2 px-8 py-4 text-lg font-semibold">
            Save Draft <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
