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
    const userId = session.user.id

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    await prisma.message.updateMany({
      where: {
        senderId: id,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json(messages, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const message = await prisma.message.findUnique({ where: { id } })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.message.delete({ where: { id } })

    return NextResponse.json({ message: "Message deleted" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}
