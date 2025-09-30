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
    const studentId = new ObjectId(session.user.id)

    // Get application statistics
    const [totalApplications, approvedApplications, fundingStats] = await Promise.all([
      db.collection("applications").countDocuments({ studentId }),
      db.collection("applications").countDocuments({ studentId, status: "approved" }),
      db
        .collection("applications")
        .aggregate([
          { $match: { studentId, status: "funded" } },
          { $group: { _id: null, totalFunding: { $sum: "$fundedAmount" } } },
        ])
        .toArray(),
    ])

    const totalFunding = fundingStats.length > 0 ? fundingStats[0].totalFunding : 0

    // For now, completed courses is same as funded applications
    const completedCourses = await db.collection("applications").countDocuments({ studentId, status: "funded" })

    return NextResponse.json({
      totalApplications,
      approvedApplications,
      totalFunding,
      completedCourses,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
