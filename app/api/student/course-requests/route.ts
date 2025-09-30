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

    // Get course requests for the current student
    const courseRequests = await db
      .collection("courseRequests")
      .find({ studentId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(courseRequests)
  } catch (error) {
    console.error("Error fetching course requests:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      provider,
      description,
      category,
      price,
      duration,
      certificationType,
      url,
      justification,
      careerRelevance,
      timeline,
      additionalInfo
    } = body

    // Validate required fields
    if (!title || !provider || !description || !category || price === undefined || !duration || !certificationType || !url || !justification || !careerRelevance || !timeline) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get user details
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create course request
    const courseRequest = {
      studentId: new ObjectId(session.user.id),
      studentName: user.name,
      studentEmail: user.email,
      title,
      provider,
      description,
      category,
      price: Number(price),
      duration,
      certificationType,
      url,
      justification,
      careerRelevance,
      timeline,
      additionalInfo: additionalInfo || "",
      documents: {},
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("courseRequests").insertOne(courseRequest)

    return NextResponse.json({ 
      message: "Course request submitted successfully", 
      requestId: result.insertedId 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating course request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}