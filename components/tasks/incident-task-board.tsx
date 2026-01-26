"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Alert
} from "@mui/material"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IncidentTask {
  _id: string
  title: string
  description?: string
  status: "open" | "in-progress" | "closed"
  dueDate: string
  reportId: string
  reportDate?: string
  incidentType?: string
  assignedToId: string
  assignedToName?: string
  createdByName?: string
}

export default function IncidentTaskBoard() {
  const [tasks, setTasks] = useState<IncidentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("open")

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/tasks?status=${encodeURIComponent(statusFilter)}&limit=100`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const updateTaskStatus = async (taskId: string, status: IncidentTask["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        throw new Error("Failed to update task")
      }
      const updated = await response.json()
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updated : task)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  const getStatusColor = (status: IncidentTask["status"]) => {
    if (status === "closed") return "success"
    if (status === "in-progress") return "warning"
    return "default"
  }

  const overdueIds = useMemo(() => {
    const now = new Date()
    return new Set(
      tasks
        .filter((task) => task.status !== "closed" && new Date(task.dueDate) < now)
        .map((task) => task._id)
    )
  }, [tasks])

  return (
    <Card className="card-brand card-elevated">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg">Incident Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={fetchTasks}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell><strong>Task</strong></TableCell>
                <TableCell sx={{ minWidth: 140 }}><strong>Assignee</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Due Date</strong></TableCell>
                <TableCell sx={{ minWidth: 120 }}><strong>Status</strong></TableCell>
                <TableCell sx={{ minWidth: 140 }}><strong>Report</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading tasks...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No tasks found for this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task._id} hover>
                    <TableCell sx={{ minWidth: 280 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary">
                            {task.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {task.assignedToName || task.assignedToId}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={new Date(task.dueDate).toLocaleDateString()}
                        size="small"
                        color={overdueIds.has(task._id) ? "error" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value as IncidentTask["status"])}
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                        </Select>
                      </FormControl>
                      <Chip
                        label={task.status.replace("-", " ")}
                        size="small"
                        color={getStatusColor(task.status) as any}
                        sx={{ ml: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{task.reportId}</Typography>
                      {task.reportDate && (
                        <Typography variant="caption" color="text.secondary">
                          {task.reportDate}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
