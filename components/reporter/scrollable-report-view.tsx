"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, Close, ArrowBack, Download, Send } from "@mui/icons-material"
import { useState } from "react"

interface ScrollableReportViewProps {
  report: any
  onBack: () => void
  onPDFExport?: (report: any) => void
  showComments?: boolean
  user?: any
  comments?: Record<string, any[]>
  onAddComment?: (reportId: string, comment: string) => void
}

interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
  role: string
}

export default function ScrollableReportView({ 
  report, 
  onBack, 
  onPDFExport,
  showComments = false,
  user,
  comments = {},
  onAddComment
}: ScrollableReportViewProps) {
  const [commentText, setCommentText] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAddComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(report.id, commentText.trim())
      setCommentText("")
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="gap-2 bg-transparent flex-shrink-0"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                Report {report.id}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Submitted by {report.reportedBy} on {report.date}
              </p>
            </div>
          </div>
          {onPDFExport && (
            <Button
              variant="outline"
              onClick={() => onPDFExport(report)}
              className="gap-2 flex-shrink-0"
              size="sm"
            >
              <Download sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-4 sm:p-6 space-y-6 pb-24">
          
          {/* Report Overview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Report Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report ID</p>
                <p className="text-foreground font-mono">{report.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="secondary" className="mt-1">{report.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Date</p>
                <p className="text-foreground">{report.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                <p className="text-foreground">{formatDate(report.submittedAt || report.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reported By</p>
                <p className="text-foreground">{report.reportedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{report.reportedByEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Power Interruptions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                Power Interruptions
                {report.powerInterruptions?.noInterruptions ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                    <Badge variant="secondary">No Issues</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Close sx={{ fontSize: 16, color: "#dc2626" }} />
                    <Badge variant="destructive">Interruption Occurred</Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.powerInterruptions?.noInterruptions ? (
                <p className="text-muted-foreground">No power interruptions occurred on this day.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time of Interruption</p>
                      <p className="text-foreground">{formatTime(report.powerInterruptions?.occurredAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-foreground">{report.powerInterruptions?.duration} minutes</p>
                    </div>
                  </div>
                  {report.powerInterruptions?.affectedMachines?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Affected Machines</p>
                      <div className="flex flex-wrap gap-2">
                        {report.powerInterruptions.affectedMachines.map((machine: string) => (
                          <Badge key={machine} variant="outline">
                            {machine}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.powerInterruptions?.cause && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cause</p>
                      <p className="text-foreground">{report.powerInterruptions.cause}</p>
                    </div>
                  )}
                  {report.powerInterruptions?.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                      <p className="text-foreground">{report.powerInterruptions.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Production */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Daily Production Data</CardTitle>
              {report.dailyProduction?.overallEfficiency && (
                <div className="mt-2">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                    <span className="text-sm text-muted-foreground">Overall Efficiency:</span>
                    <span className="text-xl font-bold text-primary">{report.dailyProduction.overallEfficiency}%</span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {report.dailyProduction?.products?.length > 0 ? (
                <div className="space-y-4">
                  {report.dailyProduction.products.map((product: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                          <p className="text-foreground font-medium">{product.productName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                          <p className="text-foreground">{product.quantity} {product.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Employees</p>
                          <p className="text-foreground">{product.employees}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Machines Used</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.machinesUsed?.map((machine: string) => (
                              <Badge key={machine} variant="outline" className="text-xs">
                                {machine}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {report.dailyProduction?.qualityIssues && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Quality Issues</p>
                      <p className="text-foreground mt-1">{report.dailyProduction.qualityIssues}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No production data was recorded for this report.</p>
              )}
            </CardContent>
          </Card>

          {/* Incident Report */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                Incident Report
                {report.incidentReport?.noIncidents ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                    <Badge variant="secondary">No Incidents</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Close sx={{ fontSize: 16, color: "#dc2626" }} />
                    <Badge variant="destructive">Incident Reported</Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.incidentReport?.noIncidents ? (
                <p className="text-muted-foreground">No incidents occurred on this day.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Incident Type</p>
                      <p className="text-foreground">{report.incidentReport?.incidentType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Severity</p>
                      <Badge variant={report.incidentReport?.severity === 'High' ? 'destructive' : 
                                     report.incidentReport?.severity === 'Medium' ? 'default' : 'secondary'}>
                        {report.incidentReport?.severity}
                      </Badge>
                    </div>
                  </div>
                  {report.incidentReport?.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-foreground">{report.incidentReport.description}</p>
                    </div>
                  )}
                  {report.incidentReport?.actionsTaken && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Actions Taken</p>
                      <p className="text-foreground">{report.incidentReport.actionsTaken}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Planning */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Employee Planning</CardTitle>
            </CardHeader>
            <CardContent>
              {report.employeePlanning?.shifts?.length > 0 ? (
                <div className="space-y-4">
                  {report.employeePlanning.shifts.map((shift: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Shift</p>
                          <p className="text-foreground font-medium">{shift.shiftName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Employees</p>
                          <p className="text-foreground">{shift.employeeCount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                          <p className="text-foreground">{shift.supervisor}</p>
                        </div>
                      </div>
                      {shift.notes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground">Notes</p>
                          <p className="text-foreground">{shift.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {report.employeePlanning?.generalNotes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">General Notes</p>
                      <p className="text-foreground">{report.employeePlanning.generalNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No employee planning data was recorded for this report.</p>
              )}
            </CardContent>
          </Card>

          {/* Site Visuals */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Site Visuals</CardTitle>
            </CardHeader>
            <CardContent>
              {report.siteVisuals?.photos?.length > 0 || report.siteVisuals?.media?.length > 0 ? (
                <div className="space-y-4">
                  {/* Handle both photos and media arrays */}
                  {(report.siteVisuals?.media || report.siteVisuals?.photos)?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        {report.siteVisuals?.media ? 'Media Files' : 'Photos'} Uploaded
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(report.siteVisuals?.media || report.siteVisuals?.photos || []).map((file: any, idx: number) => (
                          <div
                            key={idx}
                            className="border border-border rounded-lg overflow-hidden bg-muted hover:shadow-md transition-shadow"
                          >
                            {file.type === "image" || !file.type ? (
                              <>
                                <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                  <img
                                    src={file.url || file || "/placeholder.svg"}
                                    alt={file.name || `Photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-2 border-t border-border bg-card">
                                  <p className="text-xs font-medium truncate">{file.name || `Photo ${idx + 1}`}</p>
                                  <p className="text-xs text-muted-foreground">Image</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                                  <div className="text-white/60 text-center">
                                    <div className="text-2xl mb-2">▶</div>
                                    <div className="text-xs">Video</div>
                                  </div>
                                </div>
                                <div className="p-2 border-t border-border bg-card">
                                  <p className="text-xs font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">Video</p>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.siteVisuals?.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-foreground">{report.siteVisuals.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No site visuals were uploaded for this report.</p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section - Only show if enabled */}
          {showComments && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
                    {comments[report.id]?.length > 0 ? (
                      comments[report.id].map((comment: Comment) => (
                        <div key={comment.id} className="p-3 bg-card rounded-lg border border-border">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="font-medium text-sm">{comment.author}</p>
                            <p className="text-xs text-muted-foreground flex-shrink-0">{comment.timestamp}</p>
                          </div>
                          <p className="text-sm text-foreground">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>

                  {onAddComment && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="px-3"
                      >
                        <Send sx={{ fontSize: 16 }} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}