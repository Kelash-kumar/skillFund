import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "donor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get recent donations with student and course information
    const donations = await db
      .collection("donations")
      .aggregate([
        {
          $match: { donorId: new ObjectId(session.user.id) },
        },
        {
          $lookup: {
            from: "applications",
            localField: "applicationId",
            foreignField: "_id",
            as: "application",
          },
        },
        {
          $unwind: "$application",
        },
        {
          $lookup: {
            from: "users",
            localField: "application.studentId",
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
            localField: "application.courseId",
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
            courseTitle: "$course.title",
            amount: 1,
            status: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray()

    return NextResponse.json(donations)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
