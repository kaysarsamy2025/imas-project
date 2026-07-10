"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, FolderOpen, Loader2, AlertCircle, RefreshCw, X, Check } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Project {
  id: string
  title: string
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "FUNDED"
  fundingGoal: number
  raisedAmount: number
  equityPercent: number
  category: string
  createdAt: string
}

const statusConfig = {
  PENDING:  { label: "Pending",  dot: "bg-blue-500",   cls: "bg-blue-600/10 text-blue-500 border-blue-600/20" },
  APPROVED: { label: "Approved", dot: "bg-blue-400",    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  REJECTED: { label: "Rejected", dot: "bg-red-400",     cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  FUNDED:   { label: "Funded",   dot: "bg-emerald-400", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/projects?mine=true")
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load projects") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return
    setDeleting(id)
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" })
      setProjects(p => p.filter(x => x.id !== id))
    } catch { alert("Delete failed") }
    finally { setDeleting(null) }
  }

  if (loading) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2">
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground">Manage and track all your funding projects.</p>
        </div>
        <Button className="group gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          New Project
        </Button>
      </div>

      {/* Create form */}
      {showForm && <CreateProjectForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load() }} />}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xs bg-muted ring-1 ring-border">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create your first project and start raising funds.</p>
          <Button className="mt-5 gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progress = project.fundingGoal > 0 ? Math.min(Math.round((project.raisedAmount / project.fundingGoal) * 100), 100) : 0
            const s = statusConfig[project.status]
            return (
              <Card key={project.id} className="group border-border transition-colors hover:border-ring">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 min-w-0">
                      <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors truncate">
                        {project.title}
                      </CardTitle>
                      <Badge className={cn("inline-flex items-center gap-1.5 border text-xs font-medium", s.cls)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                        disabled={deleting === project.id}
                        onClick={() => handleDelete(project.id)}>
                        {deleting === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs mt-1">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-muted [&>div]:bg-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-xs border border-border bg-background p-3">
                    {[
                      { label: "Goal",    value: formatCurrency(project.fundingGoal) },
                      { label: "Raised",  value: formatCurrency(project.raisedAmount), green: true },
                      { label: "Equity",  value: `${project.equityPercent}%` },
                      { label: "Created", value: formatDate(project.createdAt) },
                    ].map(({ label, value, green }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={cn("text-sm font-semibold", green && "text-emerald-400")}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <span className="inline-block rounded-xs border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {project.category}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Create Project Modal ── */
function CreateProjectForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState("")
  const [form, setForm]     = useState({
    title: "", description: "", category: "", fundingGoal: "", equityPercent: "",
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setSaving(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          fundingGoal: parseFloat(form.fundingGoal),
          equityPercent: parseFloat(form.equityPercent),
          images: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error?.[0]?.message || data.error || "Failed"); setSaving(false); return }
      onCreated()
    } catch { setErr("Something went wrong"); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xs border border-border bg-muted shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Create New Project</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</Label>
            <Input value={form.title} onChange={set("title")} required placeholder="My startup idea" className="h-10 bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
            <textarea value={form.description} onChange={set("description")} required rows={3}
              placeholder="Describe your project..."
              className="flex w-full rounded-xs border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</Label>
              <Input value={form.category} onChange={set("category")} required placeholder="FinTech" className="h-10 bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goal ($)</Label>
              <Input type="number" value={form.fundingGoal} onChange={set("fundingGoal")} required min={1} placeholder="100000" className="h-10 bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Equity (%)</Label>
              <Input type="number" value={form.equityPercent} onChange={set("equityPercent")} required min={1} max={100} placeholder="10" className="h-10 bg-background" />
            </div>
          </div>
          {err && <p className="rounded-xs border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
