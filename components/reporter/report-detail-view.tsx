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
        <CardHeader>
          <CardTitle className="text-primary">Report Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Report Date</p>
            <p className="text-foreground">{report.date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
            <p className="text-foreground">{formatDate(report.submittedAt)}</p>
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
          <CardTitle className="text-primary flex items-center gap-2">
            Power Interruptions
            {report.powerInterruptions?.noInterruptions ? (
              <div className="flex items-center gap-1">
                <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                <Badge variant="secondary" className="rounded-none">No Issues</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Close sx={{ fontSize: 16, color: "#dc2626" }} />
                <Badge variant="destructive" className="rounded-none">Interruption Occurred</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.powerInterruptions?.noInterruptions ? (
            <p className="text-muted-foreground">No power interruptions occurred on this day.</p>
          ) : (
            <div className="space-y-4">
              {report.powerInterruptions?.interruptions?.length > 0 ? (
                report.powerInterruptions.interruptions.map((interruption: any, index: number) => (
                  <div key={interruption.id || index} className="p-4 bg-orange-50 border border-orange-200 rounded-none">
                    <h4 className="font-medium text-orange-800 mb-3">Interruption #{index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time of Interruption</p>
                        <p className="text-foreground">{formatTime(interruption.occurredAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-foreground">{interruption.duration} minutes</p>
                      </div>
                    </div>
                    {interruption.kplcMeter && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground">KPLC Meter Reading</p>
                        <p className="text-foreground">{interruption.kplcMeter}</p>
                      </div>
                    )}
                    {interruption.affectedMachines?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Affected Machines</p>
                        <div className="flex flex-wrap gap-2">
                          {interruption.affectedMachines.map((machine: string) => (
                            <Badge key={machine} variant="outline">
                              {machine}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Fallback for old single interruption format
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time of Interruption</p>
                      <p className="text-foreground">{formatTime(report.powerInterruptions?.occurredAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-foreground">{report.powerInterruptions?.duration} minutes</p>
                    </div>
                    {report.powerInterruptions?.kplcMeter && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">KPLC Meter Reading</p>
                        <p className="text-foreground">{report.powerInterruptions?.kplcMeter}</p>
                      </div>
                    )}
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
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Visuals */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-primary">Site Visuals</CardTitle>
        </CardHeader>
        <CardContent>
          {report.siteVisuals?.photos?.length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Photos Uploaded</p>
                <p className="text-foreground">{report.siteVisuals.photos.length} photo(s)</p>
              </div>
              {report.siteVisuals.notes && (
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

      {/* Daily Production */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-primary">Daily Production Data</CardTitle>
        </CardHeader>
        <CardContent>
          {report.dailyProduction?.products?.length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {report.dailyProduction.products.map((product: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-none bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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
                          <Badge key={machine} variant="outline">
                            {machine}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              {report.dailyProduction?.kplcMeter && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">KPLC Meter Reading</p>
                  <p className="text-foreground">{report.dailyProduction.kplcMeter}</p>
                </div>
              )}
              {report.dailyProduction?.qualityIssues && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quality Issues</p>
                  <p className="text-foreground">{report.dailyProduction.qualityIssues}</p>
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
          <CardTitle className="text-primary flex items-center gap-2">
            Incident Report
            {report.incidentReport?.noIncidents ? (
              <div className="flex items-center gap-1">
                <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                <Badge variant="secondary" className="rounded-none">No Incidents</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Close sx={{ fontSize: 16, color: "#dc2626" }} />
                <Badge variant="destructive" className="rounded-none">Incident Reported</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.incidentReport?.noIncidents ? (
            <p className="text-muted-foreground">No incidents occurred on this day.</p>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
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

    </div>
  )
}
