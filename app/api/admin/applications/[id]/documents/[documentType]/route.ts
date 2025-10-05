import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import path from "path"
import fs from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentType: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, documentType } = params
    
    if (!id || !documentType) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 })
    }

    // Get the document information from the database
    const { getDatabase } = await import("@/lib/mongodb")
    const { ObjectId } = await import("mongodb")
    const db = await getDatabase()
    
    const application = await db
      .collection("applications")
      .findOne({ _id: new ObjectId(id) })

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    const document = application.documents?.[documentType]
    
    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    // Construct the file path - handle both old and new path formats
    let filePath = document.filePath
    
    // If the path doesn't start with public, assume it's in the public directory
    if (!filePath.startsWith('/') && !filePath.startsWith('public/')) {
      filePath = `/uploads/documents/${filePath}`
    }
    
    // Resolve the full path
    const fullPath = path.join(process.cwd(), 'public', filePath.startsWith('/') ? filePath.slice(1) : filePath)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ 
        message: "File not found on server",
        debug: {
          originalPath: document.filePath,
          resolvedPath: fullPath,
          fileName: document.fileName
        }
      }, { status: 404 })
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath)

    // Set appropriate headers based on file type
    const headers = {
      'Content-Type': document.fileType || 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString(),
      'Content-Disposition': `inline; filename="${document.originalName}"`,
    }

    return new Response(fileBuffer, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error("Error serving document:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}