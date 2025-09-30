import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, paymentMethod, message, studentId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = await getDatabase()

    // Create payment record
    const payment = {
      donorId: new ObjectId(session.user.id),
      studentId: studentId ? new ObjectId(studentId) : null,
      amount: Number.parseFloat(amount),
      paymentMethod,
      message: message || "",
      status: "completed", // In real app, this would be "pending" until payment processor confirms
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("payments").insertOne(payment)

    // Update donor's total donations
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $inc: { totalDonated: Number.parseFloat(amount) },
        $set: { updatedAt: new Date() },
      },
    )

    // If donation is for a specific student, update their funding
    if (studentId) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(studentId) },
        {
          $inc: { totalFunding: Number.parseFloat(amount) },
          $set: { updatedAt: new Date() },
        },
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: result.insertedId.toString(),
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
