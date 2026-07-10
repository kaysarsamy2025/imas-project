import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [
      totalUsers,
      totalProjects,
      totalInvestments,
      fundingAgg,
      projectsByStatus,
      usersByRole,
      recentInvestments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.investment.count(),
      prisma.investment.aggregate({ _sum: { amount: true } }),
      prisma.project.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.investment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          investor: { select: { id: true, name: true, email: true, image: true } },
          project: { select: { id: true, title: true } },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalProjects,
      totalInvestments,
      totalFundingAmount: fundingAgg._sum.amount || 0,
      projectsByStatus,
      usersByRole,
      recentInvestments,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
