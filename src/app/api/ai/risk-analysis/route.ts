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
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const fundingRatio = project.fundingGoal > 0 ? project.raisedAmount / project.fundingGoal : 0
    const fundingRisk = Math.max(0, 100 - fundingRatio * 100)
    const marketRisk = project.category === "Technology" ? 30 : project.category === "Healthcare" ? 25 : 40
    const equityRisk = project.equityPercent > 40 ? 60 : project.equityPercent > 20 ? 35 : 20

    const riskScore = Math.min(100, Math.round((fundingRisk * 0.4 + marketRisk * 0.3 + equityRisk * 0.3)))

    let riskLevel: string
    if (riskScore < 30) {
      riskLevel = "Low"
    } else if (riskScore < 60) {
      riskLevel = "Medium"
    } else {
      riskLevel = "High"
    }

    const factors = [
      { name: "Funding Progress", score: Math.round(fundingRisk), impact: fundingRisk > 50 ? "negative" : "positive" },
      { name: "Market Sector", score: marketRisk, impact: marketRisk > 35 ? "neutral" : "positive" },
      { name: "Equity Offering", score: equityRisk, impact: equityRisk > 40 ? "negative" : "positive" },
    ]

    let recommendation: string
    if (riskLevel === "Low") {
      recommendation = "Strong opportunity with manageable risk. Consider proceeding with due diligence."
    } else if (riskLevel === "Medium") {
      recommendation = "Moderate risk. Further analysis of market conditions and team background recommended."
    } else {
      recommendation = "High risk investment. Proceed with caution and consider diversifying your portfolio."
    }

    return NextResponse.json({
      riskScore,
      riskLevel,
      factors,
      recommendation,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze risk" }, { status: 500 })
  }
}
