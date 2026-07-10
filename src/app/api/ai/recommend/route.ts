import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const projects: Array<{ id: string; title: string; category: string; description: string }> = await prisma.project.findMany({
      where: { status: "APPROVED" },
      select: { id: true, title: true, category: true, description: true },
    })

    const preferredCategories = preferences?.categories || []
    const maxBudget = preferences?.maxBudget || Infinity

    let scored: Array<{ id: string; title: string; category: string; description: string; score: number }> = projects.map((p) => {
      let score = 0
      if (preferredCategories.length > 0 && preferredCategories.includes(p.category)) {
        score += 3
      }
      if (preferredCategories.length === 0) {
        score += 1
      }
      return { ...p, score }
    })

    if (preferredCategories.length > 0) {
      scored = scored.filter((p) => p.score > 0)
    }

    scored.sort((a, b) => b.score - a.score)
    const recommended = scored.slice(0, 5).map((p) => p.id)

    return NextResponse.json({ recommendations: recommended }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
