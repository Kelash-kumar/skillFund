// Database setup script for ScholarFund
const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/"
const dbName = "scholarfund"

async function setupDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)

    // Create collections with validation
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "email", "userType"],
          properties: {
            name: { bsonType: "string" },
            email: { bsonType: "string" },
            userType: { enum: ["student", "donor", "admin"] },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
          },
        },
      },
    })

    await db.createCollection("courses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "provider", "category", "price"],
          properties: {
            title: { bsonType: "string" },
            provider: { bsonType: "string" },
            category: { bsonType: "string" },
            price: { bsonType: "number", minimum: 0 },
            isApproved: { bsonType: "bool" },
          },
        },
      },
    })

    await db.createCollection("applications")
    await db.createCollection("donations")

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("courses").createIndex({ category: 1, provider: 1 })
    await db.collection("applications").createIndex({ studentId: 1, status: 1 })
    await db.collection("donations").createIndex({ donorId: 1, createdAt: -1 })

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
