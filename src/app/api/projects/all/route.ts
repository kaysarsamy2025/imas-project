import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Admin-only: get ALL projects regardless of status
export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || ""

    const projects = await prisma.project.findMany({
      where: status ? { status: status as any } : {},
      include: {
        entrepreneur: { select: { id: true, name: true, email: true, image: true } },
        investments: { select: { id: true, amount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(projects, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
