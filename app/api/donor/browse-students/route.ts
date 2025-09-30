import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "donor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get approved applications with student and course information
    const applications = await db
      .collection("applications")
      .aggregate([
        {
          $match: { status: "approved" },
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
          $lookup: {
            from: "donations",
            localField: "_id",
            foreignField: "applicationId",
            as: "donations",
          },
        },
        {
          $addFields: {
            fundedAmount: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$donations",
                      cond: { $eq: ["$$this.status", "completed"] },
                    },
                  },
                  as: "donation",
                  in: "$$donation.amount",
                },
              },
            },
          },
        },
        {
          $addFields: {
            fundingProgress: {
              $multiply: [{ $divide: ["$fundedAmount", "$amount"] }, 100],
            },
          },
        },
        {
          $project: {
            _id: 1,
            studentId: "$student._id",
            studentName: "$student.name",
            courseTitle: "$course.title",
            courseProvider: "$course.provider",
            courseCategory: "$course.category",
            amount: 1,
            reason: 1,
            careerGoals: 1,
            timeline: 1,
            createdAt: 1,
            fundingProgress: { $ifNull: ["$fundingProgress", 0] },
            fundedAmount: { $ifNull: ["$fundedAmount", 0] },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications for donors:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
