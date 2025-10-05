// Seed courses data for skillfund database
const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "skillfund"

const sampleCourses = [
  {
    title: "AWS Certified Solutions Architect",
    provider: "Amazon Web Services",
    description: "Learn to design and deploy scalable, secure, and highly available systems on AWS cloud platform. Master architectural principles and best practices.",
    category: "Cloud Computing",
    price: 300,
    duration: "3 months",
    certificationType: "Professional Certification",
    url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Google Data Analytics Professional Certificate",
    provider: "Google",
    description: "Master data analytics skills including data cleaning, analysis, and visualization using Google tools like Sheets, SQL, Tableau, and R.",
    category: "Data Science",
    price: 149,
    duration: "6 months",
    certificationType: "Professional Certificate",
    url: "https://grow.google/certificates/data-analytics/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Meta Front-End Developer Professional Certificate",
    provider: "Meta",
    description: "Build responsive websites and web applications using HTML, CSS, JavaScript, React, and modern front-end development tools and frameworks.",
    category: "Web Development",
    price: 149,
    duration: "7 months",
    certificationType: "Professional Certificate",
    url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Salesforce Administrator Certification",
    provider: "Salesforce",
    description: "Learn to configure and manage Salesforce organizations, customize objects, fields, and page layouts, and manage users and security.",
    category: "CRM & Business Applications",
    price: 200,
    duration: "2 months",
    certificationType: "Professional Certification",
    url: "https://trailhead.salesforce.com/credentials/administrator",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Project Management Professional (PMP)",
    provider: "Project Management Institute (PMI)",
    description: "Master project management fundamentals, methodologies, and best practices. Learn to lead projects from initiation to closure.",
    category: "Project Management",
    price: 555,
    duration: "4 months",
    certificationType: "Professional Certification",
    url: "https://www.pmi.org/certifications/project-management-pmp",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Google Cloud Professional Cloud Architect",
    provider: "Google Cloud",
    description: "Design and manage scalable, secure, and highly available cloud architecture solutions on Google Cloud Platform.",
    category: "Cloud Computing",
    price: 200,
    duration: "3 months",
    certificationType: "Professional Certification",
    url: "https://cloud.google.com/certification/cloud-architect",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Microsoft Azure Developer Associate",
    provider: "Microsoft",
    description: "Learn to develop and deploy applications on Microsoft Azure cloud platform using various Azure services and tools.",
    category: "Cloud Computing",
    price: 165,
    duration: "2 months",
    certificationType: "Professional Certification",
    url: "https://docs.microsoft.com/learn/certifications/azure-developer/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Certified Information Systems Security Professional (CISSP)",
    provider: "ISC2",
    description: "Master cybersecurity principles, risk management, security architecture, and information security governance.",
    category: "Cybersecurity",
    price: 749,
    duration: "6 months",
    certificationType: "Professional Certification",
    url: "https://www.isc2.org/Certifications/CISSP",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "IBM Data Science Professional Certificate",
    provider: "IBM",
    description: "Learn data science methodology, Python programming, data analysis, machine learning, and data visualization techniques.",
    category: "Data Science",
    price: 99,
    duration: "5 months",
    certificationType: "Professional Certificate",
    url: "https://www.coursera.org/professional-certificates/ibm-data-science",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Full Stack Web Development Bootcamp",
    provider: "freeCodeCamp",
    description: "Complete full-stack web development course covering HTML, CSS, JavaScript, Node.js, React, MongoDB, and deployment.",
    category: "Web Development",
    price: 0,
    duration: "8 months",
    certificationType: "Certificate of Completion",
    url: "https://www.freecodecamp.org/learn/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Digital Marketing Specialization",
    provider: "University of Illinois",
    description: "Master digital marketing strategies including SEO, social media marketing, email marketing, and analytics.",
    category: "Digital Marketing",
    price: 79,
    duration: "4 months",
    certificationType: "Specialization Certificate",
    url: "https://www.coursera.org/specializations/digital-marketing",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "UX/UI Design Professional Certificate",
    provider: "Google",
    description: "Learn user experience design principles, wireframing, prototyping, and user interface design using industry-standard tools.",
    category: "Design",
    price: 149,
    duration: "6 months",
    certificationType: "Professional Certificate",
    url: "https://grow.google/certificates/ux-design/",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

async function seedCourses() {
  const client = new MongoClient(uri)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    const db = client.db(dbName)

    // Check if courses already exist
    const existingCount = await db.collection("courses").countDocuments()
    console.log(`Found ${existingCount} existing courses`)

    if (existingCount === 0) {
      // Insert sample courses
      const result = await db.collection("courses").insertMany(sampleCourses)
      console.log(`✅ Successfully inserted ${result.insertedCount} courses into ${dbName} database`)
    } else {
      console.log("📋 Courses already exist, skipping insertion")
      console.log("To re-seed, delete existing courses first or run: db.courses.deleteMany({})")
    }

    // Show current courses
    const courses = await db.collection("courses").find({}).limit(5).toArray()
    console.log("\n📚 Sample courses in database:")
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} by ${course.provider} - $${course.price}`)
    })

  } catch (error) {
    console.error("❌ Seeding failed:", error)
  } finally {
    await client.close()
    console.log("Connection closed")
  }
}

console.log("🌱 Starting course seeding process...")
seedCourses()