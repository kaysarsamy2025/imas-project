"use client"

import { useEffect, useState } from "react"
import { Search, Eye, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Project {
  id: string; title: string; description: string; category: string; status: string
  fundingGoal: number; raisedAmount: number; equityPercent: number; createdAt: string
  entrepreneur: { id: string; name: string; email: string }
}

const statusCls: Record<string, string> = {
  PENDING:  "bg-blue-600/10 text-blue-500 border-blue-600/20",
  APPROVED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  FUNDED:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

export default function AdminProjects() {
  const router = useRouter()
  const [projects, setProjects]     = useState<Project[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatus]   = useState("All")
  const [updating, setUpdating]     = useState<string | null>(null)

  async function load() {
    setLoading(true); setError("")
    try {
      // admin fetches all projects (no mine filter, no status filter)
      const res  = await fetch("/api/projects/all")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProjects(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load projects") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setUpdating(id)
    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setProjects(p => p.map(proj => proj.id === id ? { ...proj, status } : proj))
      }
    } catch {}
    finally { setUpdating(null) }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.entrepreneur.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  const pendingCount = projects.filter(p => p.status === "PENDING").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} projects · {pendingCount} pending approval
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search projects or entrepreneur..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatus} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="PENDING">Pending {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>
                <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                <TabsTrigger value="FUNDED">Funded</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Project", "Entrepreneur", "Category", "Goal", "Raised", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="pb-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr key={project.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted">
                      <td className="py-3">
                        <p className="font-medium truncate max-w-[160px]">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.equityPercent}% equity</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm">{project.entrepreneur.name}</p>
                        <p className="text-xs text-muted-foreground">{project.entrepreneur.email}</p>
                      </td>
                      <td className="py-3 text-muted-foreground">{project.category}</td>
                      <td className="py-3 font-medium">{formatCurrency(project.fundingGoal)}</td>
                      <td className="py-3 text-muted-foreground">{formatCurrency(project.raisedAmount)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={cn("font-medium", statusCls[project.status])}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{formatDate(project.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/projects/${project.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {project.status === "PENDING" && (
                            <>
                              <Button variant="ghost" size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                disabled={updating === project.id}
                                onClick={() => updateStatus(project.id, "APPROVED")}>
                                {updating === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                disabled={updating === project.id}
                                onClick={() => updateStatus(project.id, "REJECTED")}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
