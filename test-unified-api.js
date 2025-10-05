const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function testUnifiedAPI() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Testing Unified API Logic");
    console.log("============================");
    
    // Test the same aggregation logic as our API
    const applications = await db
      .collection("applications")
      .aggregate([
        // Match all applications regardless of type
        { $match: {} },
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
            // Get document count and names
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
            
            // Document information
            documents: 1,
            documentCount: 1,
            documentNames: 1,
            
            // Timestamps
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    console.log(`\n📊 Found ${applications.length} unified applications:`);
    
    // Group by request type
    const byType = {
      "available-course": [],
      "new-course": [],
      "certification": []
    };
    
    applications.forEach(app => {
      if (byType[app.requestType]) {
        byType[app.requestType].push(app);
      }
    });
    
    console.log(`\n📋 By Type:`);
    console.log(`   Available Courses: ${byType["available-course"].length}`);
    console.log(`   New Courses: ${byType["new-course"].length}`);
    console.log(`   Certifications: ${byType["certification"].length}`);
    
    // Show sample from each type
    Object.keys(byType).forEach(type => {
      if (byType[type].length > 0) {
        const sample = byType[type][0];
        console.log(`\n🔍 Sample ${type}:`);
        console.log(`   ID: ${sample._id}`);
        console.log(`   Student: ${sample.studentName} (${sample.studentEmail})`);
        console.log(`   Course Title: ${sample.courseTitle}`);
        console.log(`   Provider: ${sample.courseProvider}`);
        console.log(`   Cost: $${sample.estimatedCost}`);
        console.log(`   Status: ${sample.status}`);
        console.log(`   Urgency: ${sample.urgency}`);
        console.log(`   Documents: ${sample.documentCount} files (${sample.documentNames?.join(', ')})`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

testUnifiedAPI();