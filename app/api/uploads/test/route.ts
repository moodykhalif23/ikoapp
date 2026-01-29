import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

// Test endpoint to check if uploads directory exists and list files
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    
    try {
      const stats = await stat(uploadsDir)
      if (!stats.isDirectory()) {
        return NextResponse.json({ 
          error: "uploads path exists but is not a directory",
          path: uploadsDir
        })
      }
    } catch (error) {
      return NextResponse.json({ 
        error: "uploads directory does not exist",
        path: uploadsDir,
        message: error instanceof Error ? error.message : String(error)
      })
    }

    const files = await readdir(uploadsDir)
    
    return NextResponse.json({
      success: true,
      uploadsDir,
      fileCount: files.length,
      files: files.slice(0, 10), // Show first 10 files
      message: files.length > 10 ? `Showing 10 of ${files.length} files` : undefined
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to check uploads directory",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
