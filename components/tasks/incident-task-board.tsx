"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Chip,
  FormControl,
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
  Alert
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { ChevronDown, ChevronUp } from "lucide-react"

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
  comments?: Array<{
    id: string
    author: string
    role: string
    text: string
    timestamp: string
  }>
}

interface IncidentTaskBoardProps {
  user?: any
  scope?: "all" | "assigned"
}

export default function IncidentTaskBoard({ user, scope = "all" }: IncidentTaskBoardProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))
  const userId = user?._id || user?.id
  const restrictToAssignee = scope === "assigned" && userId
  const canComment = Array.isArray(user?.roles) && user.roles.some((role: string) => role === "admin" || role === "viewer")
  const [tasks, setTasks] = useState<IncidentTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const fetchTasks = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      const params = new URLSearchParams({
        status: "all",
        limit: "200"
      })
      if (restrictToAssignee && userId) {
        params.set("assigneeId", String(userId))
      }
      const response = await fetch(`/api/tasks?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [restrictToAssignee, userId])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(() => fetchTasks(true), 5000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString()
  }

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

  const addComment = async (taskId: string) => {
    const text = (commentDrafts[taskId] || "").trim()
    if (!text) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: {
            id: `CMT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            author: user?.name || "User",
            role: Array.isArray(user?.roles) ? user.roles[0] || "user" : "user",
            text,
            timestamp: new Date().toISOString()
          }
        })
      })
      if (!response.ok) {
        throw new Error("Failed to add comment")
      }
      const updated = await response.json()
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updated : task)))
      setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
    }
  }

  const getStatusColor = (status: IncidentTask["status"]) => {
    if (status === "closed") return "success"
    if (status === "in-progress") return "warning"
    return "default"
  }

  const uniqueAssignees = useMemo(() => {
    const names = tasks
      .map((task) => task.assignedToName || task.assignedToId)
      .filter(Boolean)
    return Array.from(new Set(names))
  }, [tasks])

  const overdueIds = useMemo(() => {
    const now = new Date()
    return new Set(
      tasks
        .filter((task) => task.status !== "closed" && new Date(task.dueDate) < now)
        .map((task) => task._id)
    )
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false
      }

      const assignee = task.assignedToName || task.assignedToId
      if (filterAssignee !== "all" && assignee !== filterAssignee) {
        return false
      }

      if (filterDate !== "all") {
        const dueDate = new Date(task.dueDate)
        const now = new Date()
        switch (filterDate) {
          case "today":
            if (dueDate.toDateString() !== now.toDateString()) return false
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (dueDate < weekAgo) return false
            break
          case "month":
            if (dueDate.getMonth() !== now.getMonth() || dueDate.getFullYear() !== now.getFullYear()) return false
            break
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.reportId?.toLowerCase().includes(query) ||
          task.incidentType?.toLowerCase().includes(query) ||
          task.status?.toLowerCase().includes(query) ||
          (task.assignedToName || "").toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [tasks, filterStatus, filterAssignee, filterDate, searchQuery])

  return (
    <div className="space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-foreground">Incident Tasks</h2>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card className="card-brand card-elevated card-filter-tight mb-4">
          <CardHeader className="card-filter-header">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FilterListIcon sx={{ fontSize: 20 }} />
                Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="gap-2"
              >
                {filtersExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span className="hidden sm:inline">Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span className="hidden sm:inline">Expand</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="relative">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-sm"
              />
              <SearchIcon
                sx={{ fontSize: 16 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
            </div>

            {filtersExpanded && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      aria-label="Filter by status"
                      className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        filterStatus !== "all" ? "bg-green-50 text-green-800" : "bg-background"
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                    <select
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      aria-label="Filter by assignee"
                      className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        filterAssignee !== "all" ? "bg-green-50 text-green-800" : "bg-background"
                      }`}
                    >
                      <option value="all">All Assignees</option>
                      {uniqueAssignees.map((assignee) => (
                        <option key={assignee} value={assignee}>
                          {assignee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      aria-label="Filter by due date"
                      className={`w-full h-10 px-3 text-sm border-2 border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                        filterDate !== "all" ? "bg-green-50 text-green-800" : "bg-background"
                      }`}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground invisible">Actions</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterStatus("all")
                        setFilterAssignee("all")
                        setFilterDate("all")
                        setSearchQuery("")
                      }}
                      className="text-sm w-full h-10"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t text-sm text-muted-foreground">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
              </div>
            )}

            {!filtersExpanded && (
              <div className="mt-2 text-sm text-muted-foreground">
                {filteredTasks.length} of {tasks.length} tasks
                {(filterStatus !== "all" || filterAssignee !== "all" || filterDate !== "all" || searchQuery) && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-none">
                    Filtered
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto" }}>
          {isSmall ? (
            <Box className="space-y-3 p-3">
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading tasks...
                </Typography>
              ) : filteredTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tasks found matching your filters.
                </Typography>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task._id} className="card-brand card-elevated p-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Assignee</p>
                        <p className="text-foreground">{task.assignedToName || task.assignedToId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due</p>
                        <Chip
                          label={new Date(task.dueDate).toLocaleDateString()}
                          size="small"
                          color={overdueIds.has(task._id) ? "error" : "default"}
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Report</p>
                        <p className="text-foreground">{task.reportId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value as IncidentTask["status"])}
                          >
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Comments</p>
                      {task.comments?.length ? (
                        <div className="max-h-28 overflow-y-auto border border-border/60 rounded-md bg-muted/20 p-2 space-y-2">
                          {task.comments.map((comment) => (
                            <div key={comment.id} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">{comment.author}</span>
                                <span>{formatTimestamp(comment.timestamp)}</span>
                              </div>
                              <p className="text-xs text-foreground">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No comments yet.</p>
                      )}
                      {canComment && (
                        <div className="flex gap-2">
                          <Input
                            value={commentDrafts[task._id] || ""}
                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [task._id]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="text-xs"
                          />
                          <Button size="sm" onClick={() => addComment(task._id)}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Box>
          ) : (
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
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No tasks found matching your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
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
                          <div className="mt-2 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Comments</p>
                            {task.comments?.length ? (
                              <div className="max-h-28 overflow-y-auto border border-border/60 rounded-md bg-muted/20 p-2 space-y-2">
                                {task.comments.map((comment) => (
                                  <div key={comment.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                      <span className="font-medium text-foreground">{comment.author}</span>
                                      <span>{formatTimestamp(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-foreground">{comment.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No comments yet.</p>
                            )}
                            {canComment && (
                              <div className="flex gap-2">
                                <Input
                                  value={commentDrafts[task._id] || ""}
                                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [task._id]: e.target.value }))}
                                  placeholder="Add a comment..."
                                  className="text-xs"
                                />
                                <Button size="sm" onClick={() => addComment(task._id)}>
                                  Add
                                </Button>
                              </div>
                            )}
                          </div>
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
          )}
        </TableContainer>
    </div>
  )
}
