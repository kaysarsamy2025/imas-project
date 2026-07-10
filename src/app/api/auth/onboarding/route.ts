import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await req.json()
    if (role !== "ENTREPRENEUR" && role !== "INVESTOR") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    })

    return NextResponse.json({ message: "Role updated successfully" })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
