"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Upload, X, ImageIcon, Play } from "lucide-react"

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mediaFiles.length === 0) newErrors.media = "Upload at least one image or video"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      Array.from(files).forEach((file) => {
        const isImage = file.type.startsWith("image/")
        const isVideo = file.type.startsWith("video/")

        if (isImage || isVideo) {
          const newFile: MediaFile = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: isImage ? "image" : "video",
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          }

          if (isImage) {
            const reader = new FileReader()
            reader.onload = (e) => {
              setMediaFiles((prev) =>
                prev.map((f) => (f.id === newFile.id ? { ...f, preview: e.target?.result as string } : f)),
              )
            }
            reader.readAsDataURL(file)
          }

          setMediaFiles((prev) => [...prev, newFile])
        }
      })
    }
  }

  const removeMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((m) => m.id !== id))
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
          <label className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors block">
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV up to 50MB each</p>
          </label>

          {errors.media && <p className="text-xs text-red-500">{errors.media}</p>}

          {/* Media List */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Uploaded Files ({mediaFiles.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative p-3 border border-border rounded-lg bg-muted/30 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.type === "image" ? (
                          <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMedia(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
    </Card>
  )
}
