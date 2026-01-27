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
  const [assignees, setAssignees] = useState<Array<{ _id: string; name: string; email?: string; roles?: string[] }>>([])
  const [assigneeLoading, setAssigneeLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    hasIncident: data?.hasIncident || "no",
    incidentType: data?.incidentType || "",
    incidentTime: data?.incidentTime || "",
    description: data?.description || "",
    actionTaken: data?.actionTaken || "",
    taskOwnerId: data?.taskOwnerId || "",
    taskOwnerName: data?.taskOwnerName || "",
    taskOwnerEmail: data?.taskOwnerEmail || "",
    taskDueDate: data?.taskDueDate || ""
  })

  useEffect(() => {
    setFormData({
      hasIncident: data?.hasIncident || "no",
      incidentType: data?.incidentType || "",
      incidentTime: data?.incidentTime || "",
      description: data?.description || "",
      actionTaken: data?.actionTaken || "",
      taskOwnerId: data?.taskOwnerId || "",
      taskOwnerName: data?.taskOwnerName || "",
      taskOwnerEmail: data?.taskOwnerEmail || "",
      taskDueDate: data?.taskDueDate || ""
    })
  }, [data])

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        setAssigneeLoading(true)
        const response = await fetch("/api/users")
        if (!response.ok) return
        const users = await response.json()
        const candidates = Array.isArray(users)
          ? users.filter((user: any) => Array.isArray(user.roles) && (user.roles.includes("admin") || user.roles.includes("viewer")))
          : []
        setAssignees(candidates.map((user: any) => ({
          _id: user._id || user.id,
          name: user.name,
          email: user.email,
          roles: user.roles
        })))
      } catch {
        setAssignees([])
      } finally {
        setAssigneeLoading(false)
      }
    }

    fetchAssignees()
  }, [])

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {}

    if (formData.hasIncident === "yes") {
      if (!formData.incidentType) nextErrors.incidentType = "Incident type is required"
      if (!formData.description) nextErrors.description = "Description is required"
      if (!formData.taskOwnerId) nextErrors.taskOwnerId = "Assign an owner"
      if (!formData.taskDueDate) nextErrors.taskDueDate = "Due date is required"
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
                className="flex items-center space-x-4 p-4 border-2 border-green-700 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer backdrop-blur-sm bg-background/40"
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
                        actionTaken: "",
                        taskOwnerId: "",
                        taskOwnerName: "",
                        taskOwnerEmail: "",
                        taskDueDate: ""
                      })
                      setErrors({})
                      return
                    }
                    setFormData({ ...formData, hasIncident: nextValue })
                  }}
                  className="w-5 h-5 cursor-pointer accent-green-700 border-2 border-green-700 mt-1 shrink-0"
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
                  className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}}
                >
                  <option value="">Select incident type</option>
                  <option value="equipment">Equipment Failure</option>
                  <option value="injury">Injury</option>
                  <option value="environmental">Environmental</option>
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
                  className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
                />
              </div>
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
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="assign-owner" className="text-lg sm:text-xl font-semibold text-foreground">Assign Owner</label>
                <select
                  id="assign-owner"
                  className="w-full px-3 py-2 border-2 border-green-700 rounded-md bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.taskOwnerId}
                  onChange={(e) => {
                    const selected = assignees.find((user) => user._id === e.target.value)
                    setFormData({
                      ...formData,
                      taskOwnerId: e.target.value,
                      taskOwnerName: selected?.name || "",
                      taskOwnerEmail: selected?.email || ""
                    })
                  }}
                  disabled={assigneeLoading}
                >
                  <option value="">{assigneeLoading ? "Loading assignees..." : "Select an owner"}</option>
                  {assignees.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.taskOwnerId && <p className="text-xs text-red-500">{errors.taskOwnerId}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-lg sm:text-xl font-semibold text-foreground">Task Due Date</label>
                <Input
                  type="date"
                  value={formData.taskDueDate}
                  onChange={(e) => setFormData({ ...formData, taskDueDate: e.target.value })}
                  className="bg-background/80 backdrop-blur-sm border-2 border-green-700"
                />
                {errors.taskDueDate && <p className="text-xs text-red-500">{errors.taskDueDate}</p>}
              </div>
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
