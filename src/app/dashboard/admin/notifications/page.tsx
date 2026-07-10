"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCheck, Trash2, Clock, MessageSquare, UserPlus, DollarSign, ShieldAlert, Settings, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatDateRelative } from "@/lib/utils"

interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }

const typeIcons: Record<string, typeof Bell> = {
  user: UserPlus, project: Clock, investment: DollarSign,
  message: MessageSquare, alert: ShieldAlert, system: Settings,
}
const typeColors: Record<string, string> = {
  user: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  project: "bg-blue-600/10 text-blue-500 ring-blue-600/20",
  investment: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  message: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  alert: "bg-red-500/10 text-red-400 ring-red-500/20",
  system: "bg-gray-500/10 text-gray-400 ring-gray-500/20",
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  async function load() {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/notifications")
      const data = await res.json()
      if (!res.ok) throw new Error()
      setNotifications(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load notifications") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => markRead(n.id)))
    setNotifications(p => p.map(n => ({ ...n, read: true })))
  }

  async function deleteNotif(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      setNotifications(p => p.filter(n => n.id !== id))
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2 hover:border-emerald-500/30 hover:text-emerald-400">
            <CheckCheck className="h-4 w-4" />Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xs border border-border bg-muted">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="mt-5 text-base font-semibold">No notifications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">System notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] ?? Bell
            return (
              <Card key={notif.id}
                className={cn(
                  "group cursor-pointer border transition-all hover:-translate-y-0.5",
                  notif.read ? "border-border hover:border-ring" : "border-primary/20 bg-primary/[0.02] hover:border-primary/40"
                )}
                onClick={() => !notif.read && markRead(notif.id)}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xs ring-1 transition-transform group-hover:scale-110",
                    typeColors[notif.type] ?? "bg-muted text-muted-foreground ring-border")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !notif.read ? "font-semibold" : "font-medium text-muted-foreground/80")}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        <span className="text-xs text-muted-foreground/50 whitespace-nowrap">{formatDateRelative(notif.createdAt)}</span>
                      </div>
                    </div>
                    <p className={cn("mt-0.5 text-sm", notif.read ? "text-muted-foreground/60" : "text-muted-foreground/80")}>
                      {notif.message}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
