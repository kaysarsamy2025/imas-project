import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Admin-only: update project status (approve/reject)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (adminUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    const { status } = await req.json()

    const allowed = ["PENDING", "APPROVED", "REJECTED", "FUNDED"]
    if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    const project = await prisma.project.update({
      where: { id },
      data: { status },
      include: { entrepreneur: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(project, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
