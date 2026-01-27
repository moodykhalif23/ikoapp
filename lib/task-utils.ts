import { IncidentTask, User } from "@/lib/models"
import type { IIncidentTask } from "@/lib/models/IncidentTask"
import { createIncidentTaskNotification } from "@/lib/notification-utils"

const normalizeIncidentType = (type?: string) => {
  if (!type) return "Incident"
  return type
    .replace(/_/g, "-")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const buildTaskTitle = (incidentType: string, reportId: string) =>
  `Incident: ${incidentType} • Report ${reportId}`

export async function createIncidentTasksFromReport(report: any) {
  const incident = report?.incidentReport || {}
  if (incident.hasIncident === "no" || incident.noIncidents === true) {
    return []
  }

  const hasLegacyIncidents = Array.isArray(incident.incidents) && incident.incidents.length > 0
  const hasIncident =
    incident.hasIncident === "yes" ||
    hasLegacyIncidents ||
    (incident.incidentType && incident.incidentType !== "None")

  if (!hasIncident) {
    return []
  }

  // Get all admins to assign the incident to
  const admins = await User.find({ roles: "admin" }).select("_id name email").lean()
  
  if (!admins || admins.length === 0) {
    console.warn("No admins found to assign incident tasks")
    return []
  }

  const incidents = hasLegacyIncidents
    ? incident.incidents.map((item: any, index: number) => ({
        key: item.id || item._id || String(index),
        type: item.type || incident.incidentType || "Incident",
        description: item.description || incident.description || "Incident reported",
        time: item.occurredAt || incident.incidentTime
      }))
    : [
        {
          key: "primary",
          type: incident.incidentType || "Incident",
          description: incident.description || "Incident reported",
          time: incident.incidentTime
        }
      ]

  const createdTasks: IIncidentTask[] = []

  // Create task for each admin
  for (const [index, item] of incidents.entries()) {
    const incidentType = normalizeIncidentType(item.type)
    
    for (const admin of admins) {
      const taskKey = `${report.id}:${item.key || index}:${admin._id}`

      const existing = await IncidentTask.findOne({ taskKey }).lean()
      if (existing) continue

      // Use today's date + 1 day as default due date
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 1)

      const task = new IncidentTask({
        title: buildTaskTitle(incidentType, report.id),
        description: item.description,
        status: "open",
        dueDate,
        reportId: report.id,
        reportDate: report.date,
        incidentType,
        incidentTime: item.time,
        taskKey,
        assignedToId: admin._id.toString(),
        assignedToName: admin.name,
        assignedToEmail: admin.email,
        createdByName: report.reportedBy,
        createdById: report.reportedByEmail
      })

      await task.save()
      createdTasks.push(task)

      await createIncidentTaskNotification({
        assigneeId: admin._id.toString(),
        assigneeName: admin.name,
        reportId: report.id,
        taskTitle: task.title,
        dueDate: dueDate.toLocaleDateString()
      })
    }
  }

  return createdTasks
}
