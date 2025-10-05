import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid application ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get application with the new unified structure that includes requestType
    const applications = await db
      .collection("courseRequests")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        // For available-course type, lookup the course details
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id", 
            as: "courseDetails",
          },
        },
        // Add computed fields based on the request type
        {
          $addFields: {
            // Determine the display title based on request type
            displayTitle: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.title", 0] }
                  },
                  {
                    case: { $eq: ["$requestType", "new-course"] },
                    then: "$title"
                  },
                  {
                    case: { $eq: ["$requestType", "certification"] },
                    then: "$certificationType"
                  }
                ],
                default: "Unknown Course"
              }
            },
            // Determine the provider based on request type  
            displayProvider: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.provider", 0] }
                  },
                  {
                    case: { $in: ["$requestType", ["new-course", "certification"]] },
                    then: "$provider"
                  }
                ],
                default: "Unknown Provider"
              }
            },
            // Determine the cost based on request type
            displayCost: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.cost", 0] }
                  },
                  {
                    case: { $in: ["$requestType", ["new-course", "certification"]] },
                    then: "$estimatedFee"
                  }
                ],
                default: 0
              }
            },
            // Get document count and names for preview
            documentCount: { $size: { $objectToArray: { $ifNull: ["$documents", {}] } } },
            documentNames: { 
              $map: {
                input: { $objectToArray: { $ifNull: ["$documents", {}] } },
                as: "doc",
                in: "$$doc.k"
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            studentName: 1,
            studentEmail: 1,
            requestType: 1,
            courseId: 1,
            
            // Unified display fields
            courseTitle: "$displayTitle",
            courseProvider: "$displayProvider", 
            estimatedCost: "$displayCost",
            
            // Common fields across all types
            reason: 1,
            description: 1,
            careerGoals: 1,
            previousExperience: 1,
            expectedOutcome: 1,
            urgency: 1,
            status: 1,
            isApproved: 1,
            
            // Type-specific fields
            title: 1,
            certificationType: 1,
            provider: 1,
            category: 1,
            duration: 1,
            courseUrl: 1,
            
            // Document information with full structure for preview
            documents: 1,
            documentCount: 1,
            documentNames: 1,
            
            // Timestamps
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray()

    if (applications.length === 0) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(applications[0])
  } catch (error) {
    console.error("Error fetching application details:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}