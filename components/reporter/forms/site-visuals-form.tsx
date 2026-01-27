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
  const isImageType = (type?: string) => !type || type === "image" || type?.startsWith("image/")
  const isVideoType = (type?: string) => type === "video" || type?.startsWith("video/")

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

          {/* Media List - Only show uploaded files with valid URLs */}
          {mediaFiles.filter(f => f.url).length > 0 && (
            <div className="space-y-4">
              <p className="text-lg sm:text-xl font-semibold text-foreground">Uploaded Files ({mediaFiles.filter(f => f.url).length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {mediaFiles.filter(f => f.url).map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-none overflow-hidden bg-gray-50 hover:shadow-md transition-shadow group">
                    {/* Images */}
                    {isImageType(file.type) ? (
                      <>
                        <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => openPreview(file)}
                          />
                          {/* Preview Button for Images */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openPreview(file)}
                            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-2 sm:p-3 border-t border-gray-200 bg-white flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">Image</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedia(file.id)}
                            aria-label="Remove media"
                            className="w-6 h-6 p-0 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    ) : isVideoType(file.type) ? (
                      <>
                        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                          <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                            <p className="text-[10px] sm:text-xs text-white/90 truncate">{file.name}</p>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3 border-t border-gray-200 bg-white flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">Video</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedia(file.id)}
                            aria-label="Remove media"
                            className="w-6 h-6 p-0 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="p-2 sm:p-3 border-t border-gray-200 bg-white flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">File</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedia(file.id)}
                            aria-label="Remove media"
                            className="w-6 h-6 p-0 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator for files being uploaded */}
          {mediaFiles.filter(f => !f.url).length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading {mediaFiles.filter(f => !f.url).length} file(s)...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-primary hover:bg-(--brand-green-dark text-primary-foreground gap-2 px-8 py-4 text-lg font-semibold">
            Save Draft <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {isImageType(previewFile?.type) ? (
                <ImageIcon className="w-5 h-5" />
              ) : isVideoType(previewFile?.type) ? (
                <Play className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            {previewFile?.preview && (
              <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden backdrop-blur-sm">
                {isImageType(previewFile.type) ? (
                  <img
                    src={previewFile.preview}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : isVideoType(previewFile.type) ? (
                  <video
                    src={previewFile.preview}
                    className="max-w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay={false}
                  />
                ) : (
                  <div className="p-8 text-sm text-muted-foreground">Unsupported file</div>
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
