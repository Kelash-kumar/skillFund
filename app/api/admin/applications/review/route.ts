import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { applicationId, action, note, purchasePrice } = await request.json()

    if (!applicationId || !action || ["approve", "reject"].includes(action) === false) {
      return NextResponse.json({ message: "Invalid application ID or action" }, { status: 400 })
    }

    if (action === "approve") {
      const priceNum = Number(purchasePrice)
      if (!purchasePrice || isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json({ message: "purchasePrice must be a number greater than 0" }, { status: 400 })
      }
    }

    const db = await getDatabase()

    // Verify application exists and is pending
    const application = await db.collection("courseRequests").findOne({
      _id: new ObjectId(applicationId),
      status: "pending",
    })

    if (!application) {
      return NextResponse.json({ message: "Application not found or already processed" }, { status: 404 })
    }

    // Update application status
    const updateData: any = {
      status: action === "approve" ? "approved" : "rejected",
      approvedBy: new ObjectId(session.user.id),
      updatedAt: new Date(),
    }

    if (note) {
      updateData.reviewNote = note
    }

    if (action === "approve") {
      updateData.approvedAmount = Number(purchasePrice)
    }

    await db.collection("courseRequests").updateOne({ _id: new ObjectId(applicationId) }, { $set: updateData })

    // On approval, deduct from DonationBank by inserting a negative transaction
    if (action === "approve") {
      const priceNum = Number(purchasePrice)
      await db.collection("donationBank").insertOne({
        amount: -priceNum,
        source: "application_funding",
        applicationId: new ObjectId(applicationId),
        studentId: application.studentId,
        status: "completed",
        message: "Funds allocated for approved application",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ message: `Application ${action}d successfully` }, { status: 200 })
  } catch (error) {
    console.error("Error reviewing application:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
