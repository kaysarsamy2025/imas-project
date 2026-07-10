import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { projectSchema } from "@/lib/validations"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        entrepreneur: {
          select: { id: true, name: true, email: true, image: true, company: true },
        },
        investments: {
          include: {
            investor: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.project.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existing.entrepreneurId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validation = projectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...validation.data,
        images: validation.data.images || [],
      },
    })

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.project.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existing.entrepreneurId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ message: "Project deleted" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
