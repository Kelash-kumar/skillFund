import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    // Extract form fields
    const courseData = {
      title: formData.get("title") as string,
      provider: formData.get("provider") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      duration: formData.get("duration") as string,
      certificationType: formData.get("certificationType") as string,
      url: formData.get("url") as string,
      justification: formData.get("justification") as string,
      careerRelevance: formData.get("careerRelevance") as string,
      timeline: formData.get("timeline") as string,
      additionalInfo: (formData.get("additionalInfo") as string) || "",
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "provider",
      "description",
      "category",
      "price",
      "duration",
      "certificationType",
      "url",
      "justification",
      "careerRelevance",
      "timeline",
    ]
    for (const field of requiredFields) {
      if (!courseData[field as keyof typeof courseData]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Process uploaded files
    const documents: Record<string, any> = {}
    const requiredDocuments = ["transcript", "resume", "motivation", "financial"]

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("document_") && value instanceof File) {
        const documentId = key.replace("document_", "")

        // Convert file to base64 for storage (in production, you'd upload to cloud storage)
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString("base64")

        documents[documentId] = {
          name: value.name,
          size: value.size,
          type: value.type,
          data: base64, // In production, this would be a URL to cloud storage
          uploadedAt: new Date(),
        }
      }
    }

    // Validate required documents
    for (const docId of requiredDocuments) {
      if (!documents[docId]) {
        return NextResponse.json({ message: `Missing required document: ${docId}` }, { status: 400 })
      }
    }

    const db = await getDatabase()

    // Check if course request already exists
    const existingRequest = await db.collection("courseRequests").findOne({
      studentId: new ObjectId(session.user.id),
      title: courseData.title,
      provider: courseData.provider,
      status: { $in: ["pending", "approved"] },
    })

    if (existingRequest) {
      return NextResponse.json(
        { message: "You already have a pending or approved request for this course" },
        { status: 400 },
      )
    }

    // Create course request
    const courseRequest = {
      studentId: new ObjectId(session.user.id),
      studentName: session.user.name,
      studentEmail: session.user.email,
      ...courseData,
      documents,
      status: "pending",
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("courseRequests").insertOne(courseRequest)

    return NextResponse.json(
      {
        message: "Course request submitted successfully",
        requestId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting course request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
