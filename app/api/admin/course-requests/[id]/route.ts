import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid course request ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get single course request with student information
    const requests = await db
      .collection("courseRequests")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) }
        },
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
            courseName: { $ifNull: ["$title", "$courseName"] },
            title: 1,
            provider: 1,
            description: 1,
            category: 1,
            cost: { $ifNull: ["$price", "$cost"] },
            price: 1,
            duration: 1,
            certificationType: 1,
            url: 1,
            justification: 1,
            careerRelevance: 1,
            timeline: 1,
            documents: { $ifNull: ["$documents", {}] },
            status: 1,
            reviewNote: 1,
            reviewedBy: 1,
            reviewedAt: 1,
            submissionDate: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray()

    if (requests.length === 0) {
      return NextResponse.json({ message: "Course request not found" }, { status: 404 })
    }

    return NextResponse.json(requests[0])
  } catch (error) {
    console.error("Error fetching course request details:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}