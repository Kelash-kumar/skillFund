import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get applications for the current student
    const applications = await db
      .collection("courseRequests")
      .aggregate([
        {
          $match: { studentId: new ObjectId(session.user.id) },
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
            courseTitle: "$course.title",
            amount: 1,
            status: 1,
            createdAt: 1,
            fundedAmount: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
