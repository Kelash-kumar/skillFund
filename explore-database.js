const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function exploreDatabase() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Database Structure Exploration");
    console.log("=================================");
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n📁 Collections found:", collections.map(c => c.name));
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n📊 Collection: ${collectionName}`);
      console.log("─".repeat(50));
      
      // Get document count
      const count = await db.collection(collectionName).countDocuments();
      console.log(`Documents: ${count}`);
      
      if (count > 0) {
        // Get sample documents
        const samples = await db.collection(collectionName).find({}).limit(2).toArray();
        
        samples.forEach((doc, index) => {
          console.log(`\n${index + 1}. Sample Document:`);
          console.log("ID:", doc._id);
          
          // Show field structure
          const fields = Object.keys(doc);
          console.log("Fields:", fields.join(", "));
          
          // Show some key values
          if (doc.studentName) console.log("Student:", doc.studentName);
          if (doc.studentEmail) console.log("Email:", doc.studentEmail);
          if (doc.reason) console.log("Reason preview:", doc.reason.substring(0, 50) + "...");
          if (doc.courseName) console.log("Course:", doc.courseName);
          if (doc.status) console.log("Status:", doc.status);
          if (doc.createdAt) console.log("Created:", doc.createdAt);
        });
      }
    }
    
  } catch (error) {
    console.error("❌ Exploration error:", error);
  } finally {
    await client.close();
  }
}

exploreDatabase();