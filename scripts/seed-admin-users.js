// Admin User Seeder Script for ScholarFund platform
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = process.env.MONGODB_URI || "mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/"
const dbName = "scholarfund"

async function seedAdminUsers() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    
    const db = client.db(dbName)
    
    // Hash password for all admin accounts
    const hashedPassword = await bcrypt.hash("password123", 10)
    
    // Define admin users to create
    const adminUsers = [
      {
        _id: new ObjectId(),
        name: "Main Admin",
        email: "mainadmin@scholarfund.com",
        password: hashedPassword,
        userType: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]
    
    // Check if admin users already exist
    console.log("Checking for existing admin accounts...")
    for (const admin of adminUsers) {
      const existingUser = await db.collection("users").findOne({ email: admin.email })
      
      if (existingUser) {
        console.log(`⚠️  Admin account ${admin.email} already exists. Skipping...`)
      } else {
        await db.collection("users").insertOne(admin)
        console.log(`✅ Created admin account: ${admin.email}`)
      }
    }
    
    console.log("\n🎉 Admin user seeding completed!")
    console.log("\n📋 Admin Login Credentials:")
    adminUsers.forEach(admin => {
      console.log(`   ${admin.name}: ${admin.email} / password123`)
    })
    
    console.log("\n🔗 Admin Dashboard URL: http://localhost:3000/admin/dashboard")
    
  } catch (error) {
    console.error("❌ Admin seeding failed:", error)
  } finally {
    await client.close()
  }
}

// Check if script is run directly
if (require.main === module) {
  seedAdminUsers()
}

module.exports = { seedAdminUsers }