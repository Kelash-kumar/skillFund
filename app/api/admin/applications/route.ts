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
          $unwind: "$student",
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
          $unwind: "$course",
        },
        {
          $project: {
            _id: 1,
            studentName: "$student.name",
            studentEmail: "$student.email",
            courseTitle: "$course.title",
            courseProvider: "$course.provider",
            courseCategory: "$course.category",
            amount: 1,
            reason: 1,
            careerGoals: 1,
            timeline: 1,
            additionalInfo: 1,
            status: 1,
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
