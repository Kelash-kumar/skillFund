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

    // Get comprehensive platform statistics
    const [
      totalUsers,
      totalStudents,
      totalDonors,
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalFundingResult,
      totalCourses,
      pendingCourses,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ userType: "student" }),
      db.collection("users").countDocuments({ userType: "donor" }),
      db.collection("courseRequests").countDocuments(),
      db.collection("courseRequests").countDocuments({ status: "pending" }),
      db.collection("courseRequests").countDocuments({ status: "approved" }),
      db
        .collection("donations")
        .aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, totalFunding: { $sum: "$amount" } } }])
        .toArray(),
      db.collection("courses").countDocuments({}),
      db.collection("courseRequests").countDocuments({ status: "pending" }),
    ])

    const totalFunding = totalFundingResult.length > 0 ? totalFundingResult[0].totalFunding : 0

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalDonors,
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalFunding,
      totalCourses,
      pendingCourses,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
