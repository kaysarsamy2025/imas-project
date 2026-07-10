import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const saved = await prisma.savedProject.findMany({
      where: { userId: session.user.id },
      include: { project: { select: { id: true, title: true, category: true, fundingGoal: true, raisedAmount: true, equityPercent: true, status: true, entrepreneur: { select: { id: true, name: true, image: true } } } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(saved, { status: 200 })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { projectId } = await req.json()
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })
    const existing = await prisma.savedProject.findUnique({ where: { userId_projectId: { userId: session.user.id, projectId } } })
    if (existing) {
      await prisma.savedProject.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false }, { status: 200 })
    }
    await prisma.savedProject.create({ data: { userId: session.user.id, projectId } })
    return NextResponse.json({ saved: true }, { status: 201 })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}
