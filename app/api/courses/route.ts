import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get all approved courses
    const courses = await db.collection("courses").find({ isApproved: true }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
