import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import FileUploadManager from "@/lib/fileUpload"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const requestType = (formData.get("requestType") as string) || "new-course"

    let courseData: any = {
      // Common fields
      reason: formData.get("reason") as string,
      careerGoals: formData.get("careerGoals") as string,
      previousExperience: formData.get("previousExperience") as string,
      expectedOutcome: formData.get("expectedOutcome") as string,
      urgency: formData.get("urgency") as string,
    }

    if (requestType === "available-course") {
      // Available course request fields
      courseData = {
        ...courseData,
        courseId: formData.get("courseId") as string,
      }
    } else if (requestType === "new-course") {
      // New course request fields
      courseData = {
        ...courseData,
        title: formData.get("title") as string,
        provider: formData.get("provider") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        estimatedFee: Number(formData.get("estimatedFee")),
        duration: formData.get("duration") as string,
        courseUrl: formData.get("courseUrl") as string,
      }
    } else if (requestType === "certification") {
      // Certification request fields
      courseData = {
        ...courseData,
        certificationType: formData.get("certificationType") as string,
        provider: formData.get("provider") as string,
        estimatedFee: Number(formData.get("estimatedFee")),
        description: formData.get("description") as string,
      }
    }

    // Validate required fields based on request type
    const commonFields = ["reason", "careerGoals", "previousExperience", "expectedOutcome", "urgency"]
    let requiredFields = [...commonFields]

    if (requestType === "available-course") {
      requiredFields.push("courseId")
    } else if (requestType === "new-course") {
      requiredFields.push(
        "title", "provider", "description", "category", "estimatedFee", 
        "duration"
      )
    } else if (requestType === "certification") {
      requiredFields.push(
        "certificationType", "provider", "estimatedFee", "description"
      )
    }

    for (const field of requiredFields) {
      if (!courseData[field as keyof typeof courseData]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Process uploaded files
    const fileUploadManager = new FileUploadManager()
    const requiredDocuments = ["academicTranscript", "marksheets", "bankSlip", "electricityBill", "idCard"]
    
    // Collect files from FormData
    const filesToUpload: Record<string, File | null> = {}
    for (const docType of requiredDocuments) {
      const file = formData.get(docType) as File | null
      filesToUpload[docType] = file
    }

    // Validate that all required documents are present
    for (const docId of requiredDocuments) {
      if (!filesToUpload[docId]) {
        return NextResponse.json({ message: `Missing required document: ${docId}` }, { status: 400 })
      }
    }

    // Upload files to server
    const uploadResults = await fileUploadManager.uploadMultipleFiles(
      filesToUpload, 
      session.user.id
    )

    // Check for upload failures
    const failedUploads = Object.entries(uploadResults)
      .filter(([_, result]) => !result.success)
      .map(([docType, result]) => ({ docType, error: result.error }))

    if (failedUploads.length > 0) {
      return NextResponse.json({ 
        message: "File upload failed", 
        errors: failedUploads 
      }, { status: 400 })
    }

    // Generate documents metadata for database
    const documents: Record<string, any> = {}
    for (const [docType, file] of Object.entries(filesToUpload)) {
      if (file && uploadResults[docType].success) {
        documents[docType] = FileUploadManager.generateFileMetadata(file, uploadResults[docType])
      }
    }

    const db = await getDatabase()

    // Check if similar request already exists
    let existingRequest
    if (requestType === "available-course") {
      existingRequest = await db.collection("courseRequests").findOne({
        studentId: new ObjectId(session.user.id),
        courseId: courseData.courseId,
        requestType: "available-course",
        status: { $in: ["pending", "approved"] },
      })
    } else if (requestType === "new-course") {
      existingRequest = await db.collection("courseRequests").findOne({
        studentId: new ObjectId(session.user.id),
        title: courseData.title,
        provider: courseData.provider,
        requestType: "new-course",
        status: { $in: ["pending", "approved"] },
      })
    } else if (requestType === "certification") {
      existingRequest = await db.collection("courseRequests").findOne({
        studentId: new ObjectId(session.user.id),
        certificationType: courseData.certificationType,
        provider: courseData.provider,
        requestType: "certification",
        status: { $in: ["pending", "approved"] },
      })
    }

    if (existingRequest) {
      return NextResponse.json(
        { message: "You already have a pending or approved request for this item" },
        { status: 400 },
      )
    }

    // Create request
    const requestDoc = {
      studentId: new ObjectId(session.user.id),
      studentName: session.user.name,
      studentEmail: session.user.email,
      requestType: requestType,
      ...courseData,
      documents,
      status: "pending",
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("courseRequests").insertOne(requestDoc)

    return NextResponse.json(
      {
        message: `${requestType === "certification" ? "Certification" : "Course"} request submitted successfully`,
        requestId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting course request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
