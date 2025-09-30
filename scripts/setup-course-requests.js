const { MongoClient } = require("mongodb")

async function setupCourseRequests() {
  const client = new MongoClient("mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/scholarfund")

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db()

    // Create courseRequests collection with indexes
    const courseRequestsCollection = db.collection("courseRequests")

    // Create indexes for better performance
    await courseRequestsCollection.createIndex({ studentId: 1 })
    await courseRequestsCollection.createIndex({ status: 1 })
    await courseRequestsCollection.createIndex({ createdAt: -1 })
    await courseRequestsCollection.createIndex({ title: 1, provider: 1 })

    console.log("Course requests collection setup completed")

    // Create validation schema
    await db.command({
      collMod: "courseRequests",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "studentId",
            "studentName",
            "studentEmail",
            "title",
            "provider",
            "description",
            "category",
            "price",
            "duration",
            "certificationType",
            "url",
            "justification",
            "careerRelevance",
            "timeline",
            "documents",
            "status",
            "createdAt",
          ],
          properties: {
            studentId: { bsonType: "objectId" },
            studentName: { bsonType: "string" },
            studentEmail: { bsonType: "string" },
            title: { bsonType: "string" },
            provider: { bsonType: "string" },
            description: { bsonType: "string" },
            category: { bsonType: "string" },
            price: { bsonType: "number", minimum: 0 },
            duration: { bsonType: "string" },
            certificationType: { bsonType: "string" },
            url: { bsonType: "string" },
            justification: { bsonType: "string" },
            careerRelevance: { bsonType: "string" },
            timeline: { bsonType: "string" },
            additionalInfo: { bsonType: "string" },
            documents: { bsonType: "object" },
            status: {
              bsonType: "string",
              enum: ["pending", "approved", "rejected"],
            },
            isApproved: { bsonType: "bool" },
            reviewNote: { bsonType: "string" },
            reviewedBy: { bsonType: "objectId" },
            reviewedAt: { bsonType: "date" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    console.log("Course requests validation schema applied")
  } catch (error) {
    console.error("Error setting up course requests:", error)
  } finally {
    await client.close()
  }
}

setupCourseRequests()
