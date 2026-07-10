import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, bio, company, image } = body

    if (name !== undefined && typeof name === "string" && name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name  !== undefined && { name:    name.trim() }),
        ...(bio   !== undefined && { bio:     bio.trim() }),
        ...(company !== undefined && { company: company.trim() }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        company: true,
        role: true,
      },
    })

    return NextResponse.json({ message: "Profile updated", user: updated }, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
