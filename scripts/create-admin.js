// Quick script to create a single admin account
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = process.env.MONGODB_URI || "mongodb+srv://jawadsoomro:JawadsPassword123@cluster0.jlqp0dn.mongodb.net/"
const dbName = "scholarfund"

async function createAdminAccount(name, email, password = "password123") {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    
    const db = client.db(dbName)
    
    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({ email })
    
    if (existingAdmin) {
      console.log(`❌ Admin account with email ${email} already exists!`)
      return false
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create admin user
    const adminUser = {
      _id: new ObjectId(),
      name: name,
      email: email,
      password: hashedPassword,
      userType: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await db.collection("users").insertOne(adminUser)
    
    console.log(`✅ Successfully created admin account!`)
    console.log(`   Name: ${name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Login URL: http://localhost:3000/auth/signin`)
    
    return true
    
  } catch (error) {
    console.error("❌ Failed to create admin account:", error)
    return false
  } finally {
    await client.close()
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log("Usage: node create-admin.js <name> <email> [password]")
  console.log("Example: node create-admin.js \"John Doe\" \"john@scholarfund.com\"")
  console.log("Example: node create-admin.js \"Jane Smith\" \"jane@scholarfund.com\" \"mypassword\"")
  process.exit(1)
}

const [name, email, password] = args
createAdminAccount(name, email, password)

module.exports = { createAdminAccount }