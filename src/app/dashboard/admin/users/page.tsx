"use client"

import { useEffect, useState } from "react"
import { Search, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatDate } from "@/lib/utils"

interface User { id: string; name: string; email: string; role: string; image: string | null; createdAt: string }

const roleColors: Record<string, string> = {
  ENTREPRENEUR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  INVESTOR:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ADMIN:        "bg-red-500/10 text-red-400 border-red-500/20",
  GUEST:        "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

export default function AdminUsers() {
  const [users, setUsers]     = useState<User[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [search, setSearch]   = useState("")
  const [roleFilter, setRole] = useState("all")

  async function load() {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/users?limit=50")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(Array.isArray(data.users) ? data.users : [])
      setTotal(data.total ?? 0)
    } catch (e: any) { setError(e.message || "Failed to load users") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function deleteUser(id: string) {
    if (!confirm("Delete this user permanently?")) return
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" })
      setUsers(p => p.filter(u => u.id !== id))
    } catch { alert("Failed to delete user") }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} registered users on the platform.</p>
        </div>
        <Button className="gap-2" variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Tabs value={roleFilter} onValueChange={setRole} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="ENTREPRENEUR">Entrepreneur</TabsTrigger>
                <TabsTrigger value="INVESTOR">Investor</TabsTrigger>
                <TabsTrigger value="ADMIN">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} className="pb-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.image && <AvatarImage src={user.image} alt={user.name} />}
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={cn("font-medium", roleColors[user.role] ?? "bg-muted text-muted-foreground")}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
