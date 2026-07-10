import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        investor: {
          select: { id: true, name: true, email: true, image: true },
        },
        project: true,
      },
    })

    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    return NextResponse.json(investment, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch investment" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const existing = await prisma.investment.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN" && existing.investorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const investment = await prisma.investment.update({
      where: { id },
      data: { status },
    })

    if (status === "COMPLETED" && existing.status !== "COMPLETED") {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: { raisedAmount: { increment: existing.amount } },
      })
    } else if (status === "CANCELLED" && existing.status === "COMPLETED") {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: { raisedAmount: { decrement: existing.amount } },
      })
    }

    return NextResponse.json(investment, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update investment" }, { status: 500 })
  }
}
