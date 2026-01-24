"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Close, ArrowBack, Download, Send } from "@mui/icons-material"
import { useState } from "react"

interface ScrollableReportViewProps {
  report: any
  onBack: () => void
  onPDFExport?: (report: any) => void
  onSubmitReport?: (reportId: string) => void
  canSubmit?: boolean
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
  onSubmitReport,
  canSubmit,
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

  const incidentData = report?.incidentReport || {}
  const hasFormIncident = incidentData?.hasIncident === "yes"
  const hasLegacyIncidents = Array.isArray(incidentData?.incidents)
  const noLegacyIncidents = incidentData?.noIncidents === true
  const showIncidentDetails = hasLegacyIncidents ? !noLegacyIncidents : hasFormIncident


  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b bg-white backdrop-blur supports-backdrop-filter:bg-white/95">
        <div className="flex items-center justify-between gap-3 p-2 sm:p-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="gap-2 bg-transparent shrink-0"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                {report.date}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Report {report.id}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Submitted by {report.reportedBy}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSubmitReport && report?.status === "draft" && (
              <Button
                onClick={() => onSubmitReport(report.id)}
                className="gap-2"
                size="sm"
                disabled={canSubmit === false}
              >
                <CheckCircle sx={{ fontSize: 16 }} />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            )}
            {onPDFExport && (
              <Button
                variant="outline"
                onClick={() => onPDFExport(report)}
                className="gap-2"
                size="sm"
              >
                <Download sx={{ fontSize: 16 }} />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-3 sm:p-4 space-y-4 pb-24">
          
          {/* Report Overview */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Report Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Report ID</p>
                <p className="text-gray-900 font-mono mt-1">{report.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-none text-sm mt-1">{report.status}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Report Date</p>
                <p className="text-gray-900 mt-1">{report.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted At</p>
                <p className="text-gray-900 mt-1">{formatDate(report.submittedAt || report.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reported By</p>
                <p className="text-gray-900 mt-1">{report.reportedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900 mt-1">{report.reportedByEmail}</p>
              </div>
            </div>
          </div>

          {/* Power Interruptions */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Power Interruptions</h2>
              {report.powerInterruptions?.noInterruptions ? (
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ fontSize: 18, color: "#16a34a" }} />
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-none text-sm">No Issues</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Close sx={{ fontSize: 18, color: "#dc2626" }} />
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-none text-sm">Interruption Occurred</span>
                </div>
              )}
            </div>
            {report.powerInterruptions?.noInterruptions ? (
              <p className="text-gray-600">No power interruptions occurred on this day.</p>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {report.powerInterruptions?.interruptions?.length > 0 ? (
                  report.powerInterruptions.interruptions.map((interruption: any, index: number) => (
                    <div key={interruption.id || index} className="p-4 bg-orange-50 border border-orange-200 rounded-none">
                      <h4 className="font-medium text-orange-800 mb-3">Interruption #{index + 1}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Time of Interruption</p>
                          <p className="text-gray-900 mt-1">{formatTime(interruption.occurredAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Duration</p>
                          <p className="text-gray-900 mt-1">{interruption.duration} minutes</p>
                        </div>
                      </div>
                      {interruption.kplcMeter && (
                        <div className="mb-2 sm:mb-4">
                          <p className="text-sm font-medium text-gray-600">KPLC Meter Reading</p>
                          <p className="text-gray-900 mt-1">{interruption.kplcMeter}</p>
                        </div>
                      )}
                      {interruption.affectedMachines?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Affected Machines</p>
                          <div className="flex flex-wrap gap-2">
                            {interruption.affectedMachines.map((machine: string) => (
                              <span key={machine} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                {machine}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback for old single interruption format
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Time of Interruption</p>
                      <p className="text-gray-900 mt-1">{formatTime(report.powerInterruptions?.occurredAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-gray-900 mt-1">{report.powerInterruptions?.duration} minutes</p>
                    </div>
                    {report.powerInterruptions?.kplcMeter && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">KPLC Meter Reading</p>
                        <p className="text-gray-900 mt-1">{report.powerInterruptions?.kplcMeter}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daily Production */}
          <div className="border-b border-gray-200 pb-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Daily Production Data</h2>
            </div>
            {report.dailyProduction?.products?.length > 0 ? (
              <div className="space-y-4">
                {report.dailyProduction.products.map((product: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-none border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Product Name</p>
                        <p className="text-gray-900 font-medium mt-1">{product.productName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quantity</p>
                        <p className="text-gray-900 mt-1">{product.quantity} {product.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Employees</p>
                        <p className="text-gray-900 mt-1">{product.employees}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Machines Used</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.machinesUsed?.map((machine: string) => (
                            <span key={machine} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                              {machine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {report.dailyProduction?.kplcMeter && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">KPLC Meter Reading</p>
                    <p className="text-gray-900 mt-1">{report.dailyProduction.kplcMeter}</p>
                  </div>
                )}
                {report.dailyProduction?.qualityIssues && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Quality Issues</p>
                    <p className="text-gray-900 mt-1">{report.dailyProduction.qualityIssues}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No production data was recorded for this report.</p>
            )}
          </div>

          {/* Incident Report */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Incident Report</h2>
              {!showIncidentDetails ? (
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ fontSize: 18, color: "#16a34a" }} />
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-none text-sm">No Incidents</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Close sx={{ fontSize: 18, color: "#dc2626" }} />
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-none text-sm">Incident Reported</span>
                </div>
              )}
            </div>
            {!showIncidentDetails ? (
              <p className="text-gray-600">No incidents occurred on this day.</p>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-none space-y-4">
                {hasLegacyIncidents ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Incident Type</p>
                        <p className="text-gray-900 mt-1">{report.incidentReport?.incidentType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Severity</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm mt-1 ${
                          report.incidentReport?.severity === 'High' ? 'bg-red-100 text-red-800' : 
                          report.incidentReport?.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.incidentReport?.severity}
                        </span>
                      </div>
                    </div>
                    {report.incidentReport?.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-gray-900 mt-1">{report.incidentReport.description}</p>
                      </div>
                    )}
                    {report.incidentReport?.actionsTaken && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Actions Taken</p>
                        <p className="text-gray-900 mt-1">{report.incidentReport.actionsTaken}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Incident Type</p>
                        <p className="text-gray-900 mt-1">{incidentData.incidentType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time of Incident</p>
                        <p className="text-gray-900 mt-1">{incidentData.incidentTime || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Injury Level</p>
                        <p className="text-gray-900 mt-1">{incidentData.injuryLevel || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Action Taken</p>
                        <p className="text-gray-900 mt-1">{incidentData.actionTaken || "N/A"}</p>
                      </div>
                    </div>
                    {incidentData.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-gray-900 mt-1">{incidentData.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Site Visuals */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Site Visuals</h2>
            {report.siteVisuals?.photos?.length > 0 || report.siteVisuals?.media?.length > 0 ? (
              <div className="space-y-4">
                {/* Handle both photos and media arrays */}
                {(report.siteVisuals?.media || report.siteVisuals?.photos)?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      {report.siteVisuals?.media ? 'Media Files' : 'Photos'} Uploaded
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(report.siteVisuals?.media || report.siteVisuals?.photos || []).map((file: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-none overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                        >
                          {file.type === "image" || !file.type ? (
                            <>
                              <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={file.url || file || "/placeholder.svg"}
                                  alt={file.name || `Photo ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3 border-t border-gray-200 bg-white">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name || `Photo ${idx + 1}`}</p>
                                <p className="text-xs text-gray-600">Image</p>
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
                              <div className="p-3 border-t border-gray-200 bg-white">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-600">Video</p>
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
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-gray-900 mt-1">{report.siteVisuals.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No site visuals were uploaded for this report.</p>
            )}
          </div>

          {/* Comments Section - Only show if enabled */}
          {showComments && (
            <div className="pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Comments</h2>
              <div className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-none p-4 bg-gray-50">
                  {comments[report.id]?.length > 0 ? (
                    comments[report.id].map((comment: Comment) => (
                      <div key={comment.id} className="p-3 bg-white rounded-none border border-gray-200">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="font-medium text-sm text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-500 shrink-0">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
