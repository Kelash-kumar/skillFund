const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function findCorrectCollection() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Searching for Collection with requestType Field");
    console.log("=================================================");
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Search each collection for documents with requestType field
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n🔎 Checking collection: ${collectionName}`);
      
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   Document count: ${count}`);
        
        if (count > 0) {
          // Check if any document has requestType field
          const sampleWithRequestType = await db.collection(collectionName).findOne({ requestType: { $exists: true } });
          
          if (sampleWithRequestType) {
            console.log(`   ✅ Found requestType field!`);
            console.log(`   Sample document ID: ${sampleWithRequestType._id}`);
            console.log(`   Request Type: ${sampleWithRequestType.requestType}`);
            console.log(`   Student: ${sampleWithRequestType.studentName}`);
            
            // Get all requestTypes in this collection
            const requestTypes = await db.collection(collectionName).distinct("requestType");
            console.log(`   Available request types: ${requestTypes.join(', ')}`);
            
            // Count by type
            for (const type of requestTypes) {
              const typeCount = await db.collection(collectionName).countDocuments({ requestType: type });
              console.log(`   ${type}: ${typeCount} applications`);
            }
            
            return collectionName; // Found the right collection
          } else {
            console.log(`   ❌ No requestType field found`);
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Error checking collection: ${error.message}`);
      }
    }
    
    console.log(`\n❌ No collection found with requestType field`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

findCorrectCollection();