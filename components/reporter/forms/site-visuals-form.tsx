"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, Upload, X, ImageIcon, Play, Eye } from "lucide-react"

interface SiteVisualsFormProps {
  data: any
  onComplete: (data: any) => void
}

interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  size: string
  preview?: string
}

export default function SiteVisualsForm({ data, onComplete }: SiteVisualsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(data?.media || [])
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mediaFiles.length === 0) newErrors.media = "Upload at least one image or video"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      setIsProcessing(true)
      const fileArray = Array.from(files)
      let processedCount = 0

      fileArray.forEach((file) => {
        const isImage = file.type.startsWith("image/")
        const isVideo = file.type.startsWith("video/")

        if (isImage || isVideo) {
          const newFile: MediaFile = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: isImage ? "image" : "video",
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          }

          // Create preview for both images and videos
          const reader = new FileReader()
          reader.onload = (e) => {
            setMediaFiles((prev) =>
              prev.map((f) => (f.id === newFile.id ? { ...f, preview: e.target?.result as string } : f)),
            )
            processedCount++
            if (processedCount === fileArray.length) {
              setIsProcessing(false)
            }
          }
          reader.readAsDataURL(file)

          setMediaFiles((prev) => [...prev, newFile])
        } else {
          processedCount++
          if (processedCount === fileArray.length) {
            setIsProcessing(false)
          }
        }
      })
    }
  }

  const removeMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((m) => m.id !== id))
  }

  const openPreview = (file: MediaFile) => {
    setPreviewFile(file)
    setShowPreviewDialog(true)
  }

  const closePreview = () => {
    setPreviewFile(null)
    setShowPreviewDialog(false)
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete({
        media: mediaFiles,
      })
    }
  }

  return (
    <Card className="border-border/50 animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-primary">Site Visuals & Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Media Files (Images & Videos)</label>

          {/* Upload Area */}
          <label className={`border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors block ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" disabled={isProcessing} />
            {isProcessing ? (
              <>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground mb-1">Processing files...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV up to 50MB each</p>
              </>
            )}
          </label>

          {errors.media && <p className="text-xs text-red-500">{errors.media}</p>}

          {/* Media List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Uploaded Files ({mediaFiles.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative border border-border rounded-lg bg-muted/30 group overflow-hidden">
                    {/* Preview Area */}
                    <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
                      {file.preview ? (
                        <>
                          {file.type === "image" ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openPreview(file)}
                            />
                          ) : (
                            <video
                              src={file.preview}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                            />
                          )}
                          
                          {/* Preview Button for Images */}
                          {file.type === "image" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openPreview(file)}
                              className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {file.type === "image" ? (
                            <ImageIcon className="w-8 h-8 mb-2" />
                          ) : (
                            <Play className="w-8 h-8 mb-2" />
                          )}
                          <p className="text-xs">Loading preview...</p>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeMedia(file.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* File Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        {file.type === "image" ? (
                          <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              {previewFile?.type === "image" ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            {previewFile?.preview && (
              <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                {previewFile.type === "image" ? (
                  <img
                    src={previewFile.preview}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <video
                    src={previewFile.preview}
                    className="max-w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay={false}
                  />
                )}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Size: {previewFile?.size}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={closePreview}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
