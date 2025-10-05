import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import FileUploadManager from "@/lib/fileUpload"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid application ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if it's a fund application or course request
    let application = await db.collection("courseRequests").findOne({
      _id: new ObjectId(id),
      studentId: new ObjectId(session.user.id)
    })

    let isFromCourseRequests = false
    if (!application) {
      application = await db.collection("courseRequests").findOne({
        _id: new ObjectId(id),
        studentId: new ObjectId(session.user.id)
      })
      isFromCourseRequests = true
    }

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Only allow deletion if status is pending
    if (application.status !== "pending") {
      return NextResponse.json({ 
        message: `Cannot delete application with status: ${application.status}. Only pending applications can be deleted.` 
      }, { status: 400 })
    }

    // Delete associated files if they exist
    let filesDeleted = 0
    if (application.documents && typeof application.documents === 'object') {
      const fileUploadManager = new FileUploadManager()
      const deleteResults = await fileUploadManager.deleteMultipleFiles(
        session.user.id,
        application.documents
      )
      
      // Count successful deletions
      filesDeleted = Object.values(deleteResults).filter(result => result.success).length
      
      // Log any failures
      Object.entries(deleteResults).forEach(([docType, result]) => {
        if (!result.success) {
          console.warn(`Failed to delete ${docType}:`, result.error)
        }
      })
    }

    // Delete the application from the appropriate collection
    const collection = isFromCourseRequests ? "courseRequests" : "courseRequests"
    const deleteResult = await db.collection(collection).deleteOne({
      _id: new ObjectId(id),
      studentId: new ObjectId(session.user.id)
    })

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ message: "Failed to delete application" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Application and associated files deleted successfully",
      deletedFrom: collection,
      filesDeleted: filesDeleted
    })

  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}