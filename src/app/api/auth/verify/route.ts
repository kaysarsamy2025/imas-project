import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, identifier } = await req.json()

    if (!token || !identifier) {
      return NextResponse.json(
        { error: "Token and identifier are required" },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier,
        expires: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email: identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json({
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
