import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string; filename: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { studentId, filename } = params

    // Only allow students to access their own files, or allow admin/donor access
    if (session.user?.userType === "student" && session.user.id !== studentId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // For admin and donor access, we'll allow viewing any student files
    if (!["student", "admin", "donor"].includes(session.user?.userType || "")) {
      return NextResponse.json({ message: "Invalid user type" }, { status: 403 })
    }

    // Construct file path
    const filePath = join(
      process.cwd(),
      'public',
      'uploads',
      'documents',
      'students',
      studentId,
      filename
    )

    try {
      const fileBuffer = await readFile(filePath)
      
      // Determine content type based on file extension
      const contentType = getContentType(filename)
      
      return new NextResponse(fileBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
        },
      })
    } catch (fileError) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function getContentType(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    default:
      return 'application/octet-stream'
  }
}