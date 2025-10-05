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

    // Get recent applications
    const recentApplications = await db
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
            type: { $literal: "application" },
            description: {
              $concat: ["$student.name", " applied for ", "$course.title"],
            },
            amount: 1,
            status: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray()

    // Get recent donations
    const recentDonations = await db
      .collection("donations")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "donorId",
            foreignField: "_id",
            as: "donor",
          },
        },
        {
          $unwind: "$donor",
        },
        {
          $lookup: {
            from: "courseRequests",
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
          $project: {
            _id: 1,
            type: { $literal: "donation" },
            description: {
              $concat: ["$donor.name", " donated to ", "$student.name"],
            },
            amount: 1,
            status: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray()

    // Combine and sort all activities
    const allActivity = [...recentApplications, ...recentDonations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return NextResponse.json(allActivity)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
