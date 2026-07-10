"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MessageSquare, ArrowRight, Loader2, Clock } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn, formatDateRelative } from "@/lib/utils"

interface ConvUser { id: string; name: string; image: string | null }
interface LastMsg  { content: string; createdAt: string; senderId: string }
interface Conversation { user: ConvUser; lastMessage: LastMsg }

export default function MessagesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const myId = session?.user?.id

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) { setLoading(false); return }
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => setConversations(Array.isArray(d) ? d : []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [session, status])

  if (status === "loading" || loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  if (!session) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
        <MessageSquare className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Sign in to view messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">You need to be logged in to access your messages.</p>
      </div>
      <Button onClick={() => router.push("/auth/login")} className="gap-2">
        Sign In <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {conversations.length > 0
              ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
              : "Stay connected with entrepreneurs and investors"}
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xs border border-border bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No conversations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Start a conversation by contacting an entrepreneur or investor from a project page.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xs border border-border bg-card">
            {conversations.map((conv, i) => {
              const initials   = conv.user.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"
              const isUnread   = conv.lastMessage.senderId !== myId
              const isLast     = i === conversations.length - 1

              return (
                <button
                  key={conv.user.id}
                  onClick={() => router.push(`/messages/${conv.user.id}`)}
                  className={cn(
                    "group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted",
                    !isLast && "border-b border-border"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11 ring-2 ring-border">
                      {conv.user.image && <AvatarImage src={conv.user.image} alt={conv.user.name} />}
                      <AvatarFallback
                        className="text-xs font-bold"
                        style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn(
                        "truncate text-sm",
                        isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"
                      )}>
                        {conv.user.name}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateRelative(conv.lastMessage.createdAt)}
                      </div>
                    </div>
                    <p className={cn(
                      "mt-0.5 truncate text-sm",
                      isUnread ? "text-foreground/70 font-medium" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage.senderId === myId && (
                        <span className="text-muted-foreground/50 mr-1">You:</span>
                      )}
                      {conv.lastMessage.content}
                    </p>
                  </div>

                  {/* Arrow on hover */}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
