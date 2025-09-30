import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId, amount, reason, careerGoals, timeline, additionalInfo } = await request.json()

    if (!courseId || !amount || !reason || !careerGoals || !timeline) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify course exists and is approved
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
      isApproved: true,
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found or not approved" }, { status: 404 })
    }

    // Check if student already has a pending/approved application for this course
    const existingApplication = await db.collection("applications").findOne({
      studentId: new ObjectId(session.user.id),
      courseId: new ObjectId(courseId),
      status: { $in: ["pending", "approved", "funded"] },
    })

    if (existingApplication) {
      return NextResponse.json({ message: "You already have an active application for this course" }, { status: 400 })
    }

    // Create application
    const application = {
      studentId: new ObjectId(session.user.id),
      courseId: new ObjectId(courseId),
      amount: Number(amount),
      reason,
      careerGoals,
      timeline,
      additionalInfo: additionalInfo || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("applications").insertOne(application)

    return NextResponse.json(
      { message: "Application submitted successfully", applicationId: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
