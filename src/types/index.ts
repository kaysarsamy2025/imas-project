export type UserRole = "GUEST" | "ENTREPRENEUR" | "INVESTOR" | "ADMIN"
export type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED" | "FUNDED"
export type InvestmentStatus = "PENDING" | "COMPLETED" | "CANCELLED"

export interface AuthUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
}

export interface ProjectData {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  raisedAmount: number
  equityPercent: number
  pitchDeck: string | null
  images: string[]
  status: ProjectStatus
  entrepreneurId: string
  entrepreneur?: {
    id: string
    name: string | null
    email: string
    image: string | null
    company: string | null
  }
  investments?: InvestmentData[]
  createdAt: string
}

export interface InvestmentData {
  id: string
  amount: number
  equity: number
  status: InvestmentStatus
  investorId: string
  projectId: string
  investor?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  project?: ProjectData
  createdAt: string
}

export interface MessageData {
  id: string
  content: string
  senderId: string
  receiverId: string
  read: boolean
  sender?: {
    id: string
    name: string | null
    image: string | null
  }
  receiver?: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: string
}

export interface NotificationData {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  type: string
  createdAt: string
}
