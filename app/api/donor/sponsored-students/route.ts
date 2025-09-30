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

    // Get sponsored students with progress information
    const sponsoredStudents = await db
      .collection("donations")
      .aggregate([
        {
          $match: { donorId: new ObjectId(session.user.id), status: "completed" },
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
          $group: {
            _id: "$applicationId",
            studentName: { $first: "$student.name" },
            courseTitle: { $first: "$course.title" },
            totalAmount: { $first: "$application.amount" },
            fundedAmount: { $sum: "$amount" },
          },
        },
        {
          $addFields: {
            progress: {
              $multiply: [{ $divide: ["$fundedAmount", "$totalAmount"] }, 100],
            },
          },
        },
        {
          $sort: { progress: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(sponsoredStudents)
  } catch (error) {
    console.error("Error fetching sponsored students:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
