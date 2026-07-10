import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }

    const contactMessage = await prisma.contactMessage.create({
      data: validation.data,
    })

    return NextResponse.json({ message: "Message sent successfully", data: contactMessage }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
