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

  const assigneeId = incident.taskOwnerId || incident.taskAssigneeId || incident.assignedToId
  const assigneeName = incident.taskOwnerName || incident.taskAssigneeName || incident.assignedToName
  const dueDateRaw = incident.taskDueDate

  if (!assigneeId || !dueDateRaw) {
    return []
  }

  const dueDate = new Date(dueDateRaw)
  if (Number.isNaN(dueDate.getTime())) {
    return []
  }

  const assignee =
    assigneeName
      ? { name: assigneeName, email: incident.taskOwnerEmail }
      : await User.findById(assigneeId).select("name email").lean()

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

  for (const [index, item] of incidents.entries()) {
    const incidentType = normalizeIncidentType(item.type)
    const taskKey = `${report.id}:${item.key || index}`

    const existing = await IncidentTask.findOne({ taskKey }).lean()
    if (existing) continue

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
      assignedToId: assigneeId,
      assignedToName: assignee?.name || assigneeName,
      assignedToEmail: assignee?.email || incident.taskOwnerEmail,
      createdByName: report.reportedBy,
      createdById: report.reportedByEmail
    })

    await task.save()
    createdTasks.push(task)

    await createIncidentTaskNotification({
      assigneeId,
      assigneeName: assignee?.name || assigneeName,
      reportId: report.id,
      taskTitle: task.title,
      dueDate: dueDate.toLocaleDateString()
    })
  }

  return createdTasks
}
