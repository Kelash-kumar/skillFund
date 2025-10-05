import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// List all course requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const requests = await db
      .collection("courseRequests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            studentName: { $ifNull: ["$student.name", "$studentName"] },
            studentEmail: { $ifNull: ["$student.email", "$studentEmail"] },
            courseName: { $ifNull: ["$title", "$courseName", "Unknown Course"] },
            title: { $ifNull: ["$title", "$courseName", "Unknown Course"] },
            provider: { $ifNull: ["$provider", "Unknown Provider"] },
            description: { $ifNull: ["$description", "$justification", "No description provided"] },
            category: { $ifNull: ["$category", "General"] },
            cost: { $ifNull: ["$price", "$cost", 0] },
            price: { $ifNull: ["$price", "$cost", 0] },
            duration: { $ifNull: ["$duration", "Not specified"] },
            certificationType: 1,
            url: 1,
            justification: 1,
            careerRelevance: 1,
            timeline: 1,
            documents: 1,
            status: 1,
            reviewNote: 1,
            submissionDate: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching course requests:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Approve or reject a course request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, note } = await request.json()
    if (!requestId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    const db = await getDatabase()

    const reqDoc = await db.collection("courseRequests").findOne({ _id: new ObjectId(requestId) })
    if (!reqDoc) {
      return NextResponse.json({ message: "Course request not found" }, { status: 404 })
    }

    const update: any = {
      status: action === "approve" ? "approved" : "rejected",
      reviewNote: note || "",
      reviewedBy: new ObjectId(session.user.id),
      reviewedAt: new Date(),
      updatedAt: new Date(),
      isApproved: action === "approve",
    }

    await db.collection("courseRequests").updateOne({ _id: new ObjectId(requestId) }, { $set: update })

    // Optional: if approved, create course entry automatically (if not exists)
    if (action === "approve") {
      // check if same title+provider exists
      const exists = await db.collection("courses").findOne({ title: reqDoc.title, provider: reqDoc.provider })
      if (!exists) {
        await db.collection("courses").insertOne({
          title: reqDoc.title,
          provider: reqDoc.provider,
          description: reqDoc.description,
          category: reqDoc.category,
          price: reqDoc.price,
          duration: reqDoc.duration,
          certificationType: reqDoc.certificationType,
          url: reqDoc.url,
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    return NextResponse.json({ message: `Course request ${action}d successfully` })
  } catch (error) {
    console.error("Error reviewing course request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
