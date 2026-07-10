import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { projectSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const mine     = searchParams.get("mine") === "true"

    if (mine) {
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const projects = await prisma.project.findMany({
        where: { entrepreneurId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          entrepreneur: { select: { id: true, name: true, email: true, image: true, company: true } },
          investments: { select: { id: true, amount: true, status: true } },
        },
      })
      return NextResponse.json(projects, { status: 200 })
    }

    const where: Record<string, unknown> = { status: "APPROVED" }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) where.category = category

    const projects = await prisma.project.findMany({
      where,
      include: {
        entrepreneur: { select: { id: true, name: true, email: true, image: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(projects, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = projectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        ...validation.data,
        entrepreneurId: session.user.id,
        images: validation.data.images || [],
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
