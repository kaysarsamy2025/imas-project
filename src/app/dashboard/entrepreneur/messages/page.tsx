"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Send, ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, formatDateRelative } from "@/lib/utils"

interface ConvUser { id: string; name: string; email: string; image: string | null }
interface LastMsg  { content: string; createdAt: string; senderId: string }
interface Conversation { user: ConvUser; lastMessage: LastMsg }

interface Message {
  id: string; content: string; senderId: string
  sender: { id: string; name: string; image: string | null }
  createdAt: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const myId = session?.user?.id

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeUserId, setActiveUserId]   = useState<string | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [text, setText]                   = useState("")
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [sending, setSending]             = useState(false)
  const [showList, setShowList]           = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load conversations
  async function loadConversations() {
    setLoadingConvs(true)
    try {
      const res  = await fetch("/api/messages")
      const data = await res.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch {}
    finally { setLoadingConvs(false) }
  }

  // Load messages for a conversation
  async function loadMessages(userId: string) {
    setLoadingMsgs(true)
    try {
      const res  = await fetch(`/api/messages/${userId}`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch {}
    finally { setLoadingMsgs(false) }
  }

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (activeUserId) loadMessages(activeUserId)
  }, [activeUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || !activeUserId || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeUserId, content: text.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(p => [...p, data])
        setText("")
        loadConversations() // refresh list
      }
    } catch {}
    finally { setSending(false) }
  }

  const activeConv = conversations.find(c => c.user.id === activeUserId)

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xs border border-border bg-muted">

      {/* Conversation list */}
      <div className={cn("w-full shrink-0 border-r border-border bg-background sm:w-72", showList ? "block" : "hidden sm:block")}>
        <div className="border-b border-border px-4 py-3.5">
          <h2 className="text-base font-semibold">Messages</h2>
          <p className="text-xs text-muted-foreground">
            {loadingConvs ? "Loading..." : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="overflow-y-auto h-[calc(100%-56px)]">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const initials = conv.user.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"
              const isActive = conv.user.id === activeUserId
              const isUnread = conv.lastMessage.senderId !== myId
              return (
                <button key={conv.user.id}
                  onClick={() => { setActiveUserId(conv.user.id); setShowList(false) }}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-muted",
                    isActive && "bg-muted"
                  )}>
                  <Avatar className="mt-0.5 h-9 w-9 shrink-0">
                    {conv.user.image && <AvatarImage src={conv.user.image} alt={conv.user.name} />}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                        {conv.user.name}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatDateRelative(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{conv.lastMessage.content}</p>
                  </div>
                  {isUnread && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className={cn("flex flex-1 flex-col", !showList ? "flex" : "hidden sm:flex")}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
              <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" onClick={() => setShowList(true)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                {activeConv.user.image && <AvatarImage src={activeConv.user.image} />}
                <AvatarFallback className="text-xs">
                  {activeConv.user.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{activeConv.user.name}</p>
                <p className="text-xs text-muted-foreground">{activeConv.user.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === myId
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-background border border-border text-foreground"
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn("mt-1 text-right text-[10px]", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
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
            <div className="border-t border-border bg-background p-3">
              <div className="flex gap-2">
                <Input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }}}
                  placeholder="Type a message..." className="h-10 flex-1 bg-muted" />
                <Button size="icon" className="h-10 w-10 shrink-0" disabled={!text.trim() || sending} onClick={handleSend}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xs bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs text-muted-foreground">Choose from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
