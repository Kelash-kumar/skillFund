import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get all applications with student and course information
    const applications = await db
      .collection("applications")
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
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            courseId: 1,
            studentName: { $ifNull: ["$student.name", "Unknown Student"] },
            studentEmail: { $ifNull: ["$student.email", "No Email"] },
            courseTitle: { $ifNull: ["$course.title", "Unknown Course"] },
            courseProvider: { $ifNull: ["$course.provider", "Unknown Provider"] },
            courseCategory: { $ifNull: ["$course.category", "General"] },
            // Support both old and new field names
            amount: { $ifNull: ["$estimatedCost", "$amount", "$course.cost", 0] },
            estimatedCost: { $ifNull: ["$estimatedCost", "$course.cost", 0] },
            reason: { $ifNull: ["$description", "$reason", "No description provided"] },
            description: { $ifNull: ["$description", "$reason", "No description provided"] },
            careerGoals: 1,
            timeline: 1,
            additionalInfo: 1,
            urgency: 1,
            documents: { $ifNull: ["$documents", {}] },
            status: 1,
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

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications for admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
