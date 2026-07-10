"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Leaf, HeartPulse, Sprout, GraduationCap,
  Shield, ShoppingCart, BarChart3, SearchX, Loader2,
  TrendingUp, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"

const CATEGORIES = ["All", "GreenTech", "HealthTech", "AgriTech", "EdTech", "Cybersecurity", "E-Commerce", "FinTech", "AI/ML", "Blockchain"]

const ICON_MAP: Record<string, typeof Leaf> = {
  GreenTech: Leaf, HealthTech: HeartPulse, AgriTech: Sprout,
  EdTech: GraduationCap, Cybersecurity: Shield, "E-Commerce": ShoppingCart,
  FinTech: TrendingUp, "AI/ML": BarChart3, Blockchain: Shield,
}

const COLOR_MAP: Record<string, { accent: string; bg: string }> = {
  GreenTech:    { accent: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  HealthTech:   { accent: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  AgriTech:     { accent: "#84cc16", bg: "rgba(132,204,22,0.08)" },
  EdTech:       { accent: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  Cybersecurity:{ accent: "#f97316", bg: "rgba(249,115,22,0.08)" },
  "E-Commerce": { accent: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  FinTech:      { accent: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  "AI/ML":      { accent: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
  Blockchain:   { accent: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
}

function getColor(cat: string) {
  return COLOR_MAP[cat] ?? { accent: "var(--primary)", bg: "rgba(254,244,122,0.08)" }
}

interface Project {
  id: string; title: string; category: string; description: string
  fundingGoal: number; raisedAmount: number; equityPercent: number
  entrepreneur: { id: string; name: string; image: string | null; company: string | null }
}

export default function BrowseProjectsPage() {
  const router = useRouter()
  const [search, setSearch]     = useState("")
  const [category, setCategory] = useState("All")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)            params.set("search", search)
    if (category !== "All") params.set("category", category)
    fetch(`/api/projects?${params}`)
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary)" }}>
            Investment Opportunities
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Browse Projects
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover and invest in promising ventures across multiple industries.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row max-w-2xl mx-auto mb-14">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search projects..." className="pl-10 h-11"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48 h-11"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {!loading && projects.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing <span className="font-semibold text-foreground">{projects.length}</span> project{projects.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xs bg-muted border border-border">
              <SearchX className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {category !== "All" ? `No ${category} projects yet.` : "Try adjusting your search."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const Icon = ICON_MAP[project.category] ?? Leaf
              const { accent, bg } = getColor(project.category)
              const name = project.entrepreneur?.name ?? "Unknown"
              const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
              const pct = project.fundingGoal > 0
                ? Math.min(Math.round((project.raisedAmount / project.fundingGoal) * 100), 100)
                : 0

              return (
                <div
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-xs border border-border bg-card transition-all duration-200 hover:border-ring hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Color header */}
                  <div className="relative flex h-36 items-center justify-center overflow-hidden" style={{ background: bg }}>
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />

                    {/* Large bg icon */}
                    <Icon className="h-20 w-20 absolute right-4 bottom-2 opacity-[0.07]" style={{ color: accent }} />

                    {/* Category badge */}
                    <Badge
                      className="absolute left-4 top-4 border text-xs font-semibold"
                      style={{ background: accent + "18", color: accent, borderColor: accent + "30" }}
                    >
                      {project.category}
                    </Badge>

                    {/* Icon box */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xs border"
                      style={{ background: accent + "18", borderColor: accent + "30" }}>
                      <Icon className="h-6 w-6" style={{ color: accent }} />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5 space-y-4">
                    {/* Title + description */}
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xs border border-border bg-background px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Goal</p>
                        <p className="mt-0.5 text-sm font-bold text-foreground">{formatCurrency(project.fundingGoal)}</p>
                      </div>
                      <div className="rounded-xs border border-border bg-background px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Equity</p>
                        <p className="mt-0.5 text-sm font-bold" style={{ color: accent }}>{project.equityPercent}%</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Raised <span className="font-semibold text-foreground">{formatCurrency(project.raisedAmount)}</span>
                        </span>
                        <span className="font-bold" style={{ color: pct >= 100 ? "#22c55e" : "var(--foreground)" }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: accent }}
                        />
                      </div>
                    </div>

                    {/* Entrepreneur + CTA */}
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          {project.entrepreneur?.image && <AvatarImage src={project.entrepreneur.image} alt={name} />}
                          <AvatarFallback className="text-[10px] font-bold"
                            style={{ background: accent + "20", color: accent }}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="truncate text-xs font-medium text-foreground">{name}</p>
                      </div>
                      <Button size="sm" className="shrink-0 h-8 px-4 text-xs"
                        onClick={() => router.push(`/projects/${project.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
