import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Token and password (min 6 chars) are required" },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
