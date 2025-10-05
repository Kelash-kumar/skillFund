// Seed initial courses data
const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/"
const dbName = "skillfund"

const sampleCourses = [
  {
    title: "AWS Certified Solutions Architect",
    provider: "Amazon Web Services",
    description: "Learn to design and deploy scalable systems on AWS",
    category: "Cloud Computing",
    price: 300,
    duration: "3 months",
    certificationType: "Professional Certification",
    url: "https://aws.amazon.com/certification/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Google Data Analytics Certificate",
    provider: "Google",
    description: "Master data analytics skills with Google tools",
    category: "Data Science",
    price: 49,
    duration: "6 months",
    certificationType: "Professional Certificate",
    url: "https://grow.google/certificates/data-analytics/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Meta Front-End Developer",
    provider: "Meta",
    description: "Build responsive websites and web applications",
    category: "Web Development",
    price: 49,
    duration: "7 months",
    certificationType: "Professional Certificate",
    url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Salesforce Administrator",
    provider: "Salesforce",
    description: "Learn to configure and manage Salesforce orgs",
    category: "CRM",
    price: 200,
    duration: "2 months",
    certificationType: "Professional Certification",
    url: "https://trailhead.salesforce.com/credentials/administrator",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "PMP Project Management",
    provider: "PMI",
    description: "Master project management methodologies",
    category: "Project Management",
    price: 555,
    duration: "4 months",
    certificationType: "Professional Certification",
    url: "https://www.pmi.org/certifications/project-management-pmp",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedCourses() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)

    // Clear existing courses
    await db.collection("courses").deleteMany({})

    // Insert sample courses
    const result = await db.collection("courses").insertMany(sampleCourses)
    console.log(`Inserted ${result.insertedCount} courses`)
  } catch (error) {
    console.error("Seeding failed:", error)
  } finally {
    await client.close()
  }
}

seedCourses()
