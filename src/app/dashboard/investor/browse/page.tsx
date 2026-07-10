"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, BarChart3, Users, Loader2, AlertCircle, RefreshCw, SearchX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn, formatCurrency } from "@/lib/utils"

interface Project {
  id: string; title: string; description: string; category: string
  fundingGoal: number; raisedAmount: number; equityPercent: number; status: string
  entrepreneur: { id: string; name: string; image: string | null }
}

const CATEGORIES = ["All", "CleanTech", "HealthTech", "AgriTech", "EdTech", "Cybersecurity", "E-Commerce", "AI/ML", "FinTech", "Blockchain"]

export default function BrowseProjects() {
  const router = useRouter()
  const [projects, setProjects]       = useState<Project[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [search, setSearch]           = useState("")
  const [category, setCategory]       = useState("All")
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set())
  const [savingId, setSavingId]       = useState<string | null>(null)

  async function loadProjects() {
    setLoading(true); setError("")
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category !== "All") params.set("category", category)
      const [projRes, savedRes] = await Promise.all([
        fetch(`/api/projects?${params}`),
        fetch("/api/saved-projects"),
      ])
      const [projData, savedData] = await Promise.all([projRes.json(), savedRes.json()])
      setProjects(Array.isArray(projData) ? projData : [])
      if (Array.isArray(savedData)) setSavedIds(new Set(savedData.map((s: any) => s.project.id)))
    } catch { setError("Failed to load projects") }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProjects() }, [category])

  async function toggleSave(projectId: string) {
    setSavingId(projectId)
    try {
      const res = await fetch("/api/saved-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      setSavedIds(prev => {
        const next = new Set(prev)
        data.saved ? next.add(projectId) : next.delete(projectId)
        return next
      })
    } catch {}
    finally { setSavingId(null) }
  }

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Projects</h1>
        <p className="text-sm text-muted-foreground">Discover and invest in promising ventures.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") loadProjects() }} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadProjects} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={loadProjects}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/30" />
          <h3 className="mt-4 text-base font-medium">No projects found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const pct = project.fundingGoal > 0 ? Math.min(Math.round((project.raisedAmount / project.fundingGoal) * 100), 100) : 0
            const isSaved = savedIds.has(project.id)
            const initials = project.entrepreneur.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"
            return (
              <Card key={project.id} className="group flex flex-col border-border transition-colors hover:border-ring">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base truncate">{project.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs font-normal">{project.category}</Badge>
                    </div>
                    <Button variant="ghost" size="icon"
                      className={cn("h-8 w-8 shrink-0 transition-colors", isSaved && "text-red-500 hover:text-red-600")}
                      disabled={savingId === project.id}
                      onClick={() => toggleSave(project.id)}>
                      {savingId === project.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />}
                    </Button>
                  </div>
                  <CardDescription className="mt-2 text-xs line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 pb-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Raised: {formatCurrency(project.raisedAmount)}</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2 [&>div]:bg-primary" />
                    <p className="text-xs text-muted-foreground">Goal: {formatCurrency(project.fundingGoal)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>{project.equityPercent}% Equity</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Avatar size="sm" className="h-5 w-5 border-0">
                        {project.entrepreneur.image && <AvatarImage src={project.entrepreneur.image} alt={project.entrepreneur.name} />}
                        <AvatarFallback className="text-[9px] font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[100px]">{project.entrepreneur.name}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 gap-2">
                  <Button className="flex-1" size="sm" onClick={() => router.push(`/projects/${project.id}`)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="shrink-0"
                    onClick={() => router.push(`/messages/${project.entrepreneur.id}`)}>
                    Message
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
