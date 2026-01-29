"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Close, ArrowBack, Download, Send } from "@mui/icons-material"
import { useRef, useState } from "react"

interface ScrollableReportViewProps {
  report: any
  onBack: () => void
  onPDFExport?: (report: any, element: HTMLElement | null) => void
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
  const printRef = useRef<HTMLDivElement | null>(null)

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

  const formatIncidentType = (type?: string) => {
    if (!type) return "N/A"
    const normalized = type.toLowerCase()
    const map: Record<string, string> = {
      equipment: "Equipment Failure",
      injury: "Injury",
      "near-miss": "Near Miss",
      security: "Security",
      other: "Other",
      safety: "Safety",
    }
    if (map[normalized]) return map[normalized]
    return normalized
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  const formatMeterRange = (start?: string, end?: string, legacy?: string) => {
    if (start || end) {
      return `Start: ${start || "N/A"} · End: ${end || "N/A"}`
    }
    if (legacy) {
      return `Reading: ${legacy}`
    }
    return null
  }
  const isImageMedia = (file: any) => {
    const type = file?.type
    if (!type) return true
    if (typeof type === "string" && type.startsWith("image/")) return true
    return type === "image"
  }
  const isVideoMedia = (file: any) => {
    const type = file?.type
    if (typeof type === "string" && type.startsWith("video/")) return true
    return type === "video"
  }

  const handleAddComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(report.id, commentText.trim())
      setCommentText("")
    }
  }

  // Handle both embedded data and populated references
  const powerData = report?.powerInterruptionId || report?.powerInterruptions || {}
  const productionData = report?.dailyProductionId || report?.dailyProduction || {}
  const incidentData = report?.incidentReportId || report?.incidentReport || {}
  const visualsData = report?.siteVisualId || report?.siteVisuals || {}
  
  const hasFormIncident = incidentData?.hasIncident === "yes"
  const hasLegacyIncidents = Array.isArray(incidentData?.incidents)
  const noLegacyIncidents = incidentData?.noIncidents === true
  const showIncidentDetails = hasLegacyIncidents ? !noLegacyIncidents : hasFormIncident


  return (
    <div ref={printRef} className="h-full flex flex-col print-auto-height">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b bg-white backdrop-blur supports-backdrop-filter:bg-white/95 print-hidden">
        <div className="flex items-center justify-between gap-3 p-2 sm:p-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="gap-2 bg-transparent shrink-0 h-9 sm:h-10 px-2 sm:px-3"
            >
              <ArrowBack sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-foreground truncate">
                {report.date}
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                Report {report.id}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
                <span className="hidden sm:inline">Submit Report</span>
              </Button>
            )}
            {onPDFExport && (
              <Button
                variant="outline"
                onClick={() => onPDFExport(report, printRef.current)}
                className="gap-2 h-9 sm:h-10 px-2 sm:px-3"
                size="sm"
              >
                <Download sx={{ fontSize: 16 }} />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only border-b border-gray-200 bg-white">
        <div className="flex items-center justify-center px-4 py-4">
          <img src="/logo.png" alt="IKO BRIQ" className="h-10 w-auto" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white print-overflow-visible print-bg-white">
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 pb-20 sm:pb-24 print-p-0 print-space-tight">
          
          {/* Power Interruptions */}
          <div className="border-b border-gray-200 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Power Interruptions</h2>
              {powerData?.noInterruptions && (
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ fontSize: 18, color: "#16a34a" }} />
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-none text-xs sm:text-sm">No Issues</span>
                </div>
              )}
            </div>
            {powerData?.noInterruptions ? (
              <p className="text-gray-600">No power interruptions occurred on this day.</p>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {powerData?.interruptions?.length > 0 ? (
                  powerData.interruptions.map((interruption: any, index: number) => (
                    <div key={interruption.id || index} className="p-2 sm:p-4 bg-orange-50 border border-orange-200 rounded-none">
                      <h4 className="font-medium text-orange-800 mb-2 sm:mb-3">Interruption #{index + 1}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                        <div className="space-y-0.5">
                          <p className="text-[11px] sm:text-xs font-medium text-gray-600">Time of Interruption</p>
                          <p className="text-xs sm:text-sm text-gray-900">{formatTime(interruption.occurredAt)}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] sm:text-xs font-medium text-gray-600">Duration</p>
                          <p className="text-xs sm:text-sm text-gray-900">{Math.floor(interruption.duration / 60)} min {interruption.duration % 60} sec</p>
                        </div>
                      </div>
                      {interruption.kplcReferenceNumber && (
                        <div className="mb-2 sm:mb-4">
                          <p className="text-[11px] sm:text-xs font-medium text-gray-600">KPLC Reference Number</p>
                          <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">{interruption.kplcReferenceNumber}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  powerData?.occurredAt || powerData?.duration ? (
                    // Fallback for old single interruption format
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
                    <div>
                      <p className="text-[11px] sm:text-xs font-medium text-gray-600">Time of Interruption</p>
                      <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">{formatTime(powerData?.occurredAt)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-medium text-gray-600">Duration</p>
                      <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">{Math.floor(powerData?.duration / 60)} min {powerData?.duration % 60} sec</p>
                    </div>
                    {powerData?.kplcReferenceNumber && (
                      <div>
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">KPLC Reference Number</p>
                        <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">{powerData?.kplcReferenceNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                    <p className="text-gray-600">No interruptions were recorded for this report.</p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Daily Production */}
          <div className="border-b border-gray-200 pb-3 sm:pb-4">
            <div className="mb-1.5 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daily Production Data</h2>
            </div>
            {productionData?.products?.length > 0 ? (
              <div className="space-y-2 sm:space-y-4">
                <div className="p-2 sm:p-4 bg-gray-50 rounded-none border border-gray-200">
                    <div className="space-y-1.5 sm:space-y-3">
                      {productionData.products.map((product: any, index: number) => (
                        <div
                          key={index}
                          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 ${
                            index < productionData.products.length - 1 ? "pb-2.5 sm:pb-3 border-b border-gray-200" : ""
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-[11px] sm:text-xs font-medium text-gray-600">Product Name</p>
                            <p className="text-xs sm:text-sm text-gray-900 font-medium">{product.productName}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] sm:text-xs font-medium text-gray-600">Quantity</p>
                            <p className="text-xs sm:text-sm text-gray-900">{product.quantity} {product.unit}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] sm:text-xs font-medium text-gray-600">Employees</p>
                            <p className="text-xs sm:text-sm text-gray-900">{product.employees}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] sm:text-xs font-medium text-gray-600">Machines Used</p>
                            <div className="flex flex-wrap gap-1">
                              {product.machinesUsed?.map((machine: string) => (
                                <span key={machine} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-[10px] sm:text-xs">
                                {machine}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {formatMeterRange(productionData?.kplcMeterStart as string | undefined, productionData?.kplcMeterEnd as string | undefined, productionData?.kplcMeter as string | undefined) && (
                <div className="mt-2 sm:mt-4">
                  <p className="text-[11px] sm:text-xs font-medium text-gray-600">KPLC Meter</p>
                  <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">
                    {formatMeterRange(productionData?.kplcMeterStart as string | undefined, productionData?.kplcMeterEnd as string | undefined, productionData?.kplcMeter as string | undefined)}
                  </p>
                </div>
              )}
              {productionData?.qualityIssues && (
                <div className="mt-2 sm:mt-4">
                  <p className="text-[11px] sm:text-xs font-medium text-gray-600">Quality Issues</p>
                  <p className="text-xs sm:text-sm text-gray-900 mt-0.5 sm:mt-1">{productionData.qualityIssues}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No production data was recorded for this report.</p>
          )}
        </div>

          {/* Incident Report */}
          <div className="border-b border-gray-200 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Incident Report</h2>
              {!showIncidentDetails && (
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ fontSize: 18, color: "#16a34a" }} />
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-none text-xs sm:text-sm">No Incidents</span>
                </div>
              )}
            </div>
            {!showIncidentDetails ? (
              <p className="text-gray-600">No incidents occurred on this day.</p>
            ) : (
              <div className="p-2 sm:p-4 bg-gray-50 border border-gray-200 rounded-none space-y-2 sm:space-y-4">
                {hasLegacyIncidents ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Incident Type</p>
                        <p className="text-xs sm:text-sm text-gray-900">{formatIncidentType(incidentData?.incidentType)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Severity</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs sm:text-sm ${
                          incidentData?.severity === 'High' ? 'bg-red-100 text-red-800' : 
                          incidentData?.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {incidentData?.severity}
                        </span>
                      </div>
                    </div>
                    {incidentData?.description && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Description</p>
                        <p className="text-xs sm:text-sm text-gray-900">{incidentData.description}</p>
                      </div>
                    )}
                    {incidentData?.actionsTaken && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Actions Taken</p>
                        <p className="text-xs sm:text-sm text-gray-900">{incidentData.actionsTaken}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Incident Type</p>
                        <p className="text-xs sm:text-sm text-gray-900">{formatIncidentType(incidentData.incidentType)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Time of Incident</p>
                        <p className="text-xs sm:text-sm text-gray-900">{incidentData.incidentTime || "N/A"}</p>
                      </div>
                    </div>
                    {incidentData.description && (
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Description</p>
                        <p className="text-xs sm:text-sm text-gray-900">{incidentData.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-medium text-gray-600">Action Taken</p>
                        <p className="text-xs sm:text-sm text-gray-900">{incidentData.actionTaken || "N/A"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Site Visuals */}
          <div className="border-b border-gray-200 pb-3 sm:pb-4 print-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Site Visuals</h2>
            {visualsData?.photos?.length > 0 || visualsData?.media?.length > 0 ? (
              <div className="space-y-2 sm:space-y-4">
                {/* Handle both photos and media arrays */}
                {(visualsData?.media || visualsData?.photos)?.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">
                      {visualsData?.media ? 'Media Files' : 'Photos'} Uploaded
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {(visualsData?.media || visualsData?.photos || []).map((file: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-none overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                        >
                          {isImageMedia(file) ? (
                            <>
                              <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={file.url || file.preview || file || "/placeholder.svg"}
                                  alt={file.name || `Photo ${idx + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => window.open(file.url || file.preview || file, '_blank')}
                                />
                              </div>
                              <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name || `Photo ${idx + 1}`}</p>
                                <p className="text-[10px] sm:text-xs text-gray-600">Image{file.size ? ` • ${file.size}` : ''}</p>
                              </div>
                            </>
                          ) : isVideoMedia(file) ? (
                            <>
                              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                                {file.url || file.preview ? (
                                  <video
                                    src={file.url || file.preview}
                                    className="w-full h-full object-contain"
                                    controls
                                    preload="metadata"
                                  />
                                ) : (
                                  <div className="text-white/60 text-center">
                                    <div className="text-2xl mb-2">▶</div>
                                    <div className="text-xs">Video</div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name || `Video ${idx + 1}`}</p>
                                <p className="text-[10px] sm:text-xs text-gray-600">Video{file.size ? ` • ${file.size}` : ''}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={file.url || file.preview || file || "/placeholder.svg"}
                                  alt={file.name || `File ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name || `File ${idx + 1}`}</p>
                                <p className="text-[10px] sm:text-xs text-gray-600">File</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {visualsData?.notes && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-gray-900 mt-0.5 sm:mt-1">{visualsData.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No site visuals were uploaded for this report.</p>
            )}
          </div>

          {/* Comments Section - Only show if enabled */}
          {showComments && (
            <div className="pb-3 sm:pb-4 print-hidden">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Comments</h2>
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
