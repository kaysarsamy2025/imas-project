import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        entrepreneur: {
          select: { id: true, name: true, company: true },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const fundingRatio = project.fundingGoal > 0 ? project.raisedAmount / project.fundingGoal : 0
    const marketPotential = Math.min(100, 50 + Math.round(Math.random() * 40))
    const teamStrength = project.entrepreneur.company ? 65 + Math.round(Math.random() * 30) : 40 + Math.round(Math.random() * 30)
    const financialHealth = Math.min(100, Math.round(fundingRatio * 100 * 0.7 + Math.random() * 30))
    const innovationScore = 55 + Math.round(Math.random() * 40)

    const overallScore = Math.round(
      marketPotential * 0.3 + teamStrength * 0.25 + financialHealth * 0.25 + innovationScore * 0.2
    )

    return NextResponse.json({
      overallScore,
      marketPotential,
      teamStrength,
      financialHealth,
      innovationScore,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to calculate score" }, { status: 500 })
  }
}
