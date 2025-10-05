import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(id)

    // Get user details first
    const user = await db.collection("users").findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    let stats = {}

    if (user.userType === "student") {
      // Get student-specific statistics
      const [applications, totalFundingResult] = await Promise.all([
        db.collection("courseRequests").countDocuments({ studentId: userId }),
        db.collection("donations").aggregate([
          { $match: { studentId: userId, status: "completed" } },
          { $group: { _id: null, totalFunded: { $sum: "$amount" } } }
        ]).toArray()
      ])

      const totalFunded = totalFundingResult.length > 0 ? totalFundingResult[0].totalFunded : 0

      // Get application status breakdown
      const [pendingApps, approvedApps, rejectedApps] = await Promise.all([
        db.collection("courseRequests").countDocuments({ studentId: userId, status: "pending" }),
        db.collection("courseRequests").countDocuments({ studentId: userId, status: "approved" }),
        db.collection("courseRequests").countDocuments({ studentId: userId, status: "rejected" })
      ])

      stats = {
        totalApplications: applications,
        totalFunded,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        rejectedApplications: rejectedApps,
      }
    } else if (user.userType === "donor") {
      // Get donor-specific statistics
      const [donations, totalDonatedResult] = await Promise.all([
        db.collection("donations").countDocuments({ donorId: userId }),
        db.collection("donations").aggregate([
          { $match: { donorId: userId, status: "completed" } },
          { $group: { _id: null, totalDonated: { $sum: "$amount" } } }
        ]).toArray()
      ])

      const totalDonated = totalDonatedResult.length > 0 ? totalDonatedResult[0].totalDonated : 0

      // Get students helped
      const studentsHelped = await db.collection("donations").distinct("studentId", {
        donorId: userId,
        status: "completed"
      })

      stats = {
        totalDonations: donations,
        totalDonated,
        studentsHelped: studentsHelped.length,
      }
    } else if (user.userType === "admin") {
      // Get admin activity statistics
      const [reviewedApps, reviewedCourses] = await Promise.all([
        db.collection("courseRequests").countDocuments({ reviewedBy: userId }),
        db.collection("courseRequests").countDocuments({ reviewedBy: userId })
      ])

      stats = {
        reviewedApplications: reviewedApps,
        reviewedCourses: reviewedCourses,
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}