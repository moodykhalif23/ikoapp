"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowBack, CheckCircle, Close } from "@mui/icons-material"
import { Badge } from "@/components/ui/badge"

interface ReportDetailViewProps {
  report: any
  onBack: () => void
}

export default function ReportDetailView({ report, onBack }: ReportDetailViewProps) {
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

  const formatMeterRange = (start?: string, end?: string, legacy?: string) => {
    if (start || end) {
      return `Start: ${start || "N/A"} · End: ${end || "N/A"}`
    }
    if (legacy) {
      return `Reading: ${legacy}`
    }
    return null
  }
  const formatIncidentType = (type?: string) => {
    if (!type) return "N/A"
    const normalized = type.toLowerCase()
    const map: Record<string, string> = {
      equipment: "Equipment Failure",
      injury: "Injury",
      "near-miss": "Near Miss",
      environmental: "Environmental",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
          <ArrowBack sx={{ fontSize: 16 }} />
          Back to Reports
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Details</h1>
          <p className="text-muted-foreground">Report ID: {report.id}</p>
        </div>
      </div>

      {/* Report Overview */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-primary text-base sm:text-lg">Report Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-6 pt-0">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Report Date</p>
            <p className="text-sm sm:text-base text-foreground">{report.date}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Submitted At</p>
            <p className="text-sm sm:text-base text-foreground">{formatDate(report.submittedAt)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Reported By</p>
            <p className="text-sm sm:text-base text-foreground">{report.reportedBy}</p>
          </div>
        </CardContent>
      </Card>

      {/* Power Interruptions */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-primary flex items-center gap-2 text-base sm:text-lg">
            Power Interruptions
            {report.powerInterruptions?.noInterruptions && (
              <div className="flex items-center gap-1">
                <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                <Badge variant="secondary" className="rounded-none text-xs">No Issues</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {report.powerInterruptions?.noInterruptions ? (
            <p className="text-sm text-muted-foreground">No power interruptions occurred on this day.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {report.powerInterruptions?.interruptions?.length > 0 ? (
                report.powerInterruptions.interruptions.map((interruption: any, index: number) => (
                  <div key={interruption.id || index} className="p-2 sm:p-4 bg-orange-50 border border-orange-200 rounded-none">
                    <h4 className="text-sm sm:text-base font-medium text-orange-800 mb-2 sm:mb-3">Interruption #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-2">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Time of Interruption</p>
                        <p className="text-sm sm:text-base text-foreground">{formatTime(interruption.occurredAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-sm sm:text-base text-foreground">{Math.floor(interruption.duration / 60)} min {interruption.duration % 60} sec</p>
                      </div>
                    </div>
                    {interruption.kplcReferenceNumber && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">KPLC Reference Number</p>
                        <p className="text-sm sm:text-base text-foreground">{interruption.kplcReferenceNumber}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                report.powerInterruptions?.occurredAt || report.powerInterruptions?.duration ? (
                  // Fallback for old single interruption format
                  <div className="space-y-2 sm:space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Time of Interruption</p>
                        <p className="text-sm sm:text-base text-foreground">{formatTime(report.powerInterruptions?.occurredAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-sm sm:text-base text-foreground">{Math.floor(report.powerInterruptions?.duration / 60)} min {report.powerInterruptions?.duration % 60} sec</p>
                      </div>
                    </div>
                    {report.powerInterruptions?.kplcReferenceNumber && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">KPLC Reference Number</p>
                        <p className="text-sm sm:text-base text-foreground">{report.powerInterruptions?.kplcReferenceNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No interruptions were recorded for this report.</p>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Visuals */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-primary text-base sm:text-lg">Site Visuals</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {report.siteVisuals?.media?.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                  Media Files ({report.siteVisuals.media.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {report.siteVisuals.media.map((file: any, index: number) => (
                    <div key={file.id || index} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                      {file.type === 'image' || file.type?.startsWith?.('image/') ? (
                        <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(file.url, '_blank')}
                          />
                        </div>
                      ) : file.type === 'video' || file.type?.startsWith?.('video/') ? (
                        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                          <video
                            src={file.url}
                            className="w-full h-full object-contain"
                            controls
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                          <span className="text-gray-400 text-sm">Unsupported file</span>
                        </div>
                      )}
                      <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">
                          {file.type === 'image' || file.type?.startsWith?.('image/') ? 'Image' : 
                           file.type === 'video' || file.type?.startsWith?.('video/') ? 'Video' : 'File'} • {file.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {report.siteVisuals.notes && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm sm:text-base text-foreground">{report.siteVisuals.notes}</p>
                </div>
              )}
            </div>
          ) : report.siteVisuals?.photos?.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                  Photos ({report.siteVisuals.photos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {report.siteVisuals.photos.map((url: string, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      </div>
                      <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">Photo {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {report.siteVisuals.notes && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm sm:text-base text-foreground">{report.siteVisuals.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No site visuals were uploaded for this report.</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Production */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-primary text-base sm:text-lg">Daily Production Data</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {report.dailyProduction?.products?.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-4 border border-border rounded-none bg-muted/30">
                <div className="space-y-2 sm:space-y-3">
                  {report.dailyProduction.products.map((product: any, index: number) => (
                    <div
                      key={index}
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 ${
                        index < report.dailyProduction.products.length - 1 ? "pb-2 sm:pb-3 border-b border-border" : ""
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Product Name</p>
                        <p className="text-sm sm:text-base text-foreground font-medium">{product.productName}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quantity</p>
                        <p className="text-sm sm:text-base text-foreground">{product.quantity} {product.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Employees</p>
                        <p className="text-sm sm:text-base text-foreground">{product.employees}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Machines Used</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.machinesUsed?.map((machine: string) => (
                            <Badge key={machine} variant="outline" className="text-xs">
                              {machine}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {formatMeterRange(report.dailyProduction?.kplcMeterStart as string | undefined, report.dailyProduction?.kplcMeterEnd as string | undefined, report.dailyProduction?.kplcMeter as string | undefined) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">KPLC Meter</p>
                  <p className="text-sm sm:text-base text-foreground">
                    {formatMeterRange(report.dailyProduction?.kplcMeterStart as string | undefined, report.dailyProduction?.kplcMeterEnd as string | undefined, report.dailyProduction?.kplcMeter as string | undefined)}
                  </p>
                </div>
              )}
              {report.dailyProduction?.qualityIssues && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quality Issues</p>
                  <p className="text-sm sm:text-base text-foreground">{report.dailyProduction.qualityIssues}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No production data was recorded for this report.</p>
          )}
        </CardContent>
      </Card>

      {/* Incident Report */}
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-primary flex items-center gap-2 text-base sm:text-lg">
            Incident Report
            {report.incidentReport?.noIncidents && (
              <div className="flex items-center gap-1">
                <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                <Badge variant="secondary" className="rounded-none text-xs">No Incidents</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {report.incidentReport?.noIncidents ? (
            <p className="text-sm text-muted-foreground">No incidents occurred on this day.</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Incident Type</p>
                  <p className="text-sm sm:text-base text-foreground">{formatIncidentType(report.incidentReport?.incidentType)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Severity</p>
                  <Badge variant={report.incidentReport?.severity === 'High' ? 'destructive' : 
                                 report.incidentReport?.severity === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                    {report.incidentReport?.severity}
                  </Badge>
                </div>
              </div>
              {report.incidentReport?.description && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm sm:text-base text-foreground">{report.incidentReport.description}</p>
                </div>
              )}
              {report.incidentReport?.actionsTaken && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Actions Taken</p>
                  <p className="text-sm sm:text-base text-foreground">{report.incidentReport.actionsTaken}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
