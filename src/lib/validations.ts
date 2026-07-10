import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ENTREPRENEUR", "INVESTOR"]),
})

export const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.string().min(2),
  fundingGoal: z.number().positive(),
  equityPercent: z.number().min(1).max(100),
  pitchDeck: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export const messageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string(),
})
