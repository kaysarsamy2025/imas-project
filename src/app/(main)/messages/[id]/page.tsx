"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatDateRelative } from "@/lib/utils"

interface Message {
  id: string; content: string; senderId: string; createdAt: string
  sender: { id: string; name: string; image: string | null }
}

interface OtherUser { id: string; name: string; email: string; image: string | null }

export default function ConversationPage() {
  const { id: otherId } = useParams<{ id: string }>()
  const { data: session }  = useSession()
  const router = useRouter()
  const myId   = session?.user?.id

  const [otherUser, setOtherUser]   = useState<OtherUser | null>(null)
  const [messages, setMessages]     = useState<Message[]>([])
  const [text, setText]             = useState("")
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load other user info + messages
  useEffect(() => {
    if (!otherId) return
    setLoadingMsgs(true)
    // fetch user info
    fetch(`/api/users/${otherId}`)
      .then(r => r.json())
      .then(d => { if (d.id) setOtherUser(d) })
      .catch(() => {})
    // fetch messages
    fetch(`/api/messages/${otherId}`)
      .then(r => r.json())
      .then(d => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false))
  }, [otherId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || !otherId || sending) return
    setSending(true)
    const content = text.trim()
    setText("")
    try {
      const res  = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherId, content }),
      })
      const data = await res.json()
      if (res.ok) setMessages(p => [...p, data])
      else setText(content) // restore on error
    } catch { setText(content) }
    finally { setSending(false) }
  }

  const initials = otherUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 shrink-0">
        <Link href="/messages"
          className="flex h-8 w-8 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {otherUser ? (
          <>
            <Avatar className="h-9 w-9 ring-2 ring-border">
              {otherUser.image && <AvatarImage src={otherUser.image} alt={otherUser.name} />}
              <AvatarFallback className="text-xs font-bold"
                style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{otherUser.name}</p>
              <p className="text-xs text-muted-foreground">{otherUser.email}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xs bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {loadingMsgs ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myId
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <Avatar className="h-7 w-7 mr-2 mt-1 shrink-0">
                    {msg.sender.image && <AvatarImage src={msg.sender.image} />}
                    <AvatarFallback className="text-[10px]"
                      style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
                      {msg.sender.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5",
                  isMe
                    ? "rounded-br-sm text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-muted text-foreground",
                )}
                  style={isMe ? { background: "var(--primary)" } : {}}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={cn(
                    "mt-1 text-right text-[10px]",
                    isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {formatDateRelative(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3 shrink-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }}}
            placeholder="Type a message..."
            className="h-10 flex-1 bg-muted"
          />
          <Button size="icon" className="h-10 w-10 shrink-0"
            disabled={!text.trim() || sending}
            onClick={handleSend}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
