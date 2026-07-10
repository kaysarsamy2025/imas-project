import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const token = crypto.randomUUID()
      const expires = new Date(Date.now() + 3600000)

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })
    }

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
