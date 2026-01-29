import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile, chmod } from "fs/promises"
import path from "path"
import crypto from "crypto"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 50 * 1024 * 1024
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files").filter((value): value is File => value instanceof File)
    const singleFile = formData.get("file")
    if (!files.length && singleFile instanceof File) {
      files.push(singleFile)
    }

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 })
      }
    }

    // Ensure upload directory exists with proper permissions
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
      await chmod(UPLOAD_DIR, 0o755)
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }

    const uploaded = []
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = path.extname(file.name || "").slice(0, 10)
      const filename = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${ext}`
      const filePath = path.join(UPLOAD_DIR, filename)

      await writeFile(filePath, buffer)
      
      // Set proper file permissions
      try {
        await chmod(filePath, 0o644)
      } catch (error) {
        console.error("Error setting file permissions:", error)
      }

      uploaded.push({
        name: file.name,
        url: `/uploads/${filename}`,
        type: file.type?.startsWith("image/")
          ? "image"
          : file.type?.startsWith("video/")
            ? "video"
            : "file",
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        mimeType: file.type
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
