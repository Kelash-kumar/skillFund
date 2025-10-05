const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function createAdminUser() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("👨‍💼 Creating Admin User");
    console.log("======================");
    
    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({ userType: "admin" });
    
    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists:", existingAdmin.name, existingAdmin.email);
      return;
    }
    
    // Create admin user
    const adminUser = {
      _id: new ObjectId(),
      name: "Admin User",
      email: "admin@skillfund.com",
      userType: "admin",
      // Note: In a real app, you'd want to hash the password
      password: "admin123", // This should be hashed in production
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection("users").insertOne(adminUser);
    console.log("✅ Created admin user:");
    console.log("   Email: admin@skillfund.com");
    console.log("   Password: admin123");
    console.log("   Type: admin");
    
    console.log("\n🔐 You can now sign in to the admin panel with these credentials");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

createAdminUser();