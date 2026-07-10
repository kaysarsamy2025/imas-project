import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.notification.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(notification, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.notification.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.notification.delete({ where: { id } })

    return NextResponse.json({ message: "Notification deleted" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
