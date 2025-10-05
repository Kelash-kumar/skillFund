import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all users for admin panel
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Fetch all users with relevant information
    const users = await db
      .collection("users")
      .find({}, {
        projection: {
          password: 0, // Exclude password field for security
        }
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform the data to ensure consistent structure
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name || "Unknown User",
      email: user.email,
      userType: user.userType || "student",
      location: user.location || null,
      phone: user.phone || null,
      bio: user.bio || null,
      university: user.university || null,
      major: user.major || null,
      graduationYear: user.graduationYear || null,
      organization: user.organization || null,
      position: user.position || null,
      interests: user.interests || [],
      isActive: user.isActive !== false, // Default to true if not specified
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin || null,
      profileComplete: user.profileComplete || false,
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Update user status or information
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId, ...updateData } = await request.json()

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Update user
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}