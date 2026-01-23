"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"

interface IncidentReportFormProps {
  data: any
  onComplete: (data: any) => void
}

export default function IncidentReportForm({ data, onComplete }: IncidentReportFormProps) {
  const [formData, setFormData] = useState({
    hasIncident: data?.hasIncident || "no",
    incidentType: data?.incidentType || "",
    incidentTime: data?.incidentTime || "",
    injuryLevel: data?.injuryLevel || "none",
    description: data?.description || "",
    actionTaken: data?.actionTaken || "",
  })

  const handleSubmit = () => {
    onComplete(formData)
  }

  return (
    <div className="bg-transparent animate-in fade-in duration-300 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Incident Report</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-lg sm:text-xl font-semibold text-foreground">Were there any incidents today?</label>
          <div className="flex gap-4 flex-wrap">
            {["no", "yes"].map((option) => (
              <div
                key={option}
                className="flex items-center space-x-4 p-4 border-2 border-green-700 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer backdrop-blur-sm bg-background/40"
              >
                <input
                  type="radio"
                  id={`incident-${option}`}
                  name="hasIncident"
                  value={option}
                  checked={formData.hasIncident === option}
                  onChange={(e) => setFormData({ ...formData, hasIncident: e.target.value })}
                  className="w-5 h-5 cursor-pointer accent-green-700 border-2 border-green-700 mt-1 flex-shrink-0"
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
                <label className="text-lg sm:text-xl font-semibold text-foreground">Incident Type</label>
                <select
                  className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                >
                  <option value="">Select incident type</option>
                  <option value="equipment">Equipment Failure</option>
                  <option value="injury">Injury</option>
                  <option value="near-miss">Near Miss</option>
                  <option value="environmental">Environmental</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-lg sm:text-xl font-semibold text-foreground">Time of Incident</label>
                <Input
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                  className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-lg sm:text-xl font-semibold text-foreground">Injury Level</label>
              <select
                className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.injuryLevel}
                onChange={(e) => setFormData({ ...formData, injuryLevel: e.target.value })}
              >
                <option value="none">No Injury</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-lg sm:text-xl font-semibold text-foreground">Description</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Describe what happened..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-lg sm:text-xl font-semibold text-foreground">Action Taken</label>
              <textarea
                className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="What action was taken in response..."
                value={formData.actionTaken}
                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 py-4 text-lg font-semibold">
            Save Draft <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
