export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  userType: "student" | "donor" | "admin"
  profile?: StudentProfile | DonorProfile
  createdAt: Date
  updatedAt: Date
}

export interface StudentProfile {
  education: string
  careerGoals: string
  completedCertifications: string[]
  portfolio?: string
  linkedIn?: string
  github?: string
}

export interface DonorProfile {
  company?: string
  interests: string[]
  donationPreferences: {
    categories: string[]
    maxAmount?: number
    recurring: boolean
  }
  isAnonymous: boolean
}

export interface Course {
  _id?: string
  title: string
  provider: string
  description: string
  category: string
  price: number
  duration: string
  certificationType: string
  url: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FundingApplication {
  _id?: string
  studentId: string
  courseId: string
  amount: number
  reason: string
  status: "pending" | "approved" | "rejected" | "funded"
  approvedBy?: string
  fundedAmount?: number
  donors?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Donation {
  _id?: string
  donorId: string
  amount: number
  type: "one-time" | "recurring"
  applicationId?: string
  status: "pending" | "completed" | "failed"
  paymentId?: string
  createdAt: Date
  updatedAt: Date
}
