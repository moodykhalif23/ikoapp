"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save, Upload, X, ImageIcon, Play, Eye } from "lucide-react"

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
  url?: string
  file?: File
}

export default function SiteVisualsForm({ data, onComplete }: SiteVisualsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(data?.media || [])
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const nextMedia = Array.isArray(data?.media) ? data.media : []
    setMediaFiles(
      nextMedia.map((file: MediaFile | any) => ({
        ...file,
        preview: file.preview || file.url || file.previewUrl || file.src,
        url: file.url || file.previewUrl || file.src
      })),
    )
  }, [data])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (mediaFiles.length === 0) newErrors.media = "Upload at least one image or video"
    if (mediaFiles.some((file) => file.file && !file.url)) {
      newErrors.media = "Please wait for uploads to finish"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadMediaFiles = async (files: MediaFile[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      if (file.file) {
        formData.append("files", file.file)
      }
    })

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || "Failed to upload files")
    }

    const data = await response.json()
    return Array.isArray(data.files) ? data.files : []
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      setIsProcessing(true)
      const fileArray = Array.from(files)
      const nextMedia: MediaFile[] = []

      fileArray.forEach((file) => {
        const isImage = file.type.startsWith("image/")
        const isVideo = file.type.startsWith("video/")

        if (isImage || isVideo) {
          const newFile: MediaFile = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: isImage ? "image" : "video",
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            file,
          }

          nextMedia.push(newFile)

          const reader = new FileReader()
          reader.onload = (event) => {
            setMediaFiles((prev) =>
              prev.map((f) => (f.id === newFile.id ? { ...f, preview: event.target?.result as string } : f)),
            )
          }
          reader.readAsDataURL(file)
        }
      })

      if (nextMedia.length) {
        setMediaFiles((prev) => [...prev, ...nextMedia])
      }

      try {
        if (nextMedia.length) {
          const uploaded = await uploadMediaFiles(nextMedia)
          setMediaFiles((prev) =>
            prev.map((item) => {
              const index = nextMedia.findIndex((media) => media.id === item.id)
              if (index === -1) return item
              const uploadedFile = uploaded[index]
              return uploadedFile ? { ...item, url: uploadedFile.url } : item
            }),
          )
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          media: error instanceof Error ? error.message : "Failed to upload files"
        }))
      } finally {
        setIsProcessing(false)
        e.currentTarget.value = ""
      }
    } else {
      e.currentTarget.value = ""
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
      const sanitizedMedia = mediaFiles.map(({ id, name, type, size, url, preview }) => ({
        id,
        name,
        type,
        size,
        url,
        preview: url ? undefined : preview
      }))
      onComplete({
        media: sanitizedMedia,
      })
    }
  }

  return (
    <div className="bg-transparent animate-in fade-in duration-300 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Site Visuals & Documentation</h2>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-lg sm:text-xl font-semibold text-foreground">Media Files (Images & Videos)</label>

          {/* Upload Area */}
          <label className={`border-2 border-green-700 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors block backdrop-blur-sm bg-background/40 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <p className="text-lg sm:text-xl font-semibold text-foreground">Uploaded Files ({mediaFiles.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative border-2 border-green-700 rounded-lg bg-background/40 backdrop-blur-sm group overflow-hidden">
                    {/* Preview Area - Full Card Coverage */}
                    <div className="aspect-video bg-muted/30 relative overflow-hidden">
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
                            <div className="relative w-full h-full">
                              <video
                                src={file.preview}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                              />
                            </div>
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
                        <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full">
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
                        aria-label="Remove media"
                        className="absolute top-2 right-2 opacity-100 w-8 h-8 p-0 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      
                      {/* File Info Overlay - Images only (keep video controls unobstructed) */}
                      {file.type === "image" && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 transform transition-transform duration-200 translate-y-full group-hover:translate-y-0">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                              <p className="text-xs opacity-75">{file.size}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 py-4 text-lg font-semibold">
            Save Draft <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-foreground">
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
              <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden backdrop-blur-sm">
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
    </div>
  )
}
