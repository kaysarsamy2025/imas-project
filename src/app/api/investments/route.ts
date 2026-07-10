import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let investments

    if (user.role === "ADMIN") {
      investments = await prisma.investment.findMany({
        include: {
          investor: {
            select: { id: true, name: true, email: true, image: true },
          },
          project: { select: { id: true, title: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (user.role === "INVESTOR") {
      investments = await prisma.investment.findMany({
        where: { investorId: session.user.id },
        include: {
          project: {
            include: {
              entrepreneur: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      investments = await prisma.investment.findMany({
        where: {
          project: { entrepreneurId: session.user.id },
        },
        include: {
          investor: {
            select: { id: true, name: true, email: true, image: true },
          },
          project: true,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(investments, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}

const createInvestmentSchema = z.object({
  amount: z.number().positive(),
  equity: z.number().min(0).max(100),
  projectId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== "INVESTOR") {
      return NextResponse.json({ error: "Only investors can invest" }, { status: 403 })
    }

    const body = await req.json()
    const validation = createInvestmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }

    const { amount, equity, projectId } = validation.data

    const project = await prisma.project.findUnique({ where: { id: projectId } })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const investment = await prisma.investment.create({
      data: {
        amount,
        equity,
        investorId: session.user.id,
        projectId,
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { raisedAmount: { increment: amount } },
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
  }
}
