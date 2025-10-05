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

    // Get recent transactions for this donor from DonationBank, joining to application/student/course if present
    const transactions = await db
      .collection("donationBank")
      .aggregate([
        { $match: { donorId: new ObjectId(session.user.id) } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "courseRequests",
            localField: "applicationId",
            foreignField: "_id",
            as: "application",
          },
        },
        { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "application.studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "courses",
            localField: "application.courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            studentName: { $ifNull: ["$student.name", "General Donation"] },
            courseTitle: { $ifNull: ["$course.title", ""] },
          },
        },
      ])
      .toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
