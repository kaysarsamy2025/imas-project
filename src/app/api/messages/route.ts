import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { messageSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      distinct: ["receiverId"],
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      distinct: ["senderId"],
    })

    const conversationsMap = new Map()

    for (const msg of sentMessages) {
      const otherUser = msg.receiver
      const key = otherUser.id
      if (!conversationsMap.has(key) || conversationsMap.get(key).lastMessage.createdAt < msg.createdAt.toISOString()) {
        conversationsMap.set(key, {
          user: otherUser,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
          },
        })
      }
    }

    for (const msg of receivedMessages) {
      const otherUser = msg.sender
      const key = otherUser.id
      if (!conversationsMap.has(key) || conversationsMap.get(key).lastMessage.createdAt < msg.createdAt.toISOString()) {
        conversationsMap.set(key, {
          user: otherUser,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt.toISOString(),
            senderId: msg.senderId,
          },
        })
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())

    return NextResponse.json(conversations, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = messageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 })
    }

    const receiver = await prisma.user.findUnique({
      where: { id: validation.data.receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        content: validation.data.content,
        senderId: session.user.id,
        receiverId: validation.data.receiverId,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
