"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, HeartPulse, Sprout, GraduationCap, Shield, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const categoryIcons: Record<string, typeof Leaf> = {
  GreenTech: Leaf, HealthTech: HeartPulse, AgriTech: Sprout,
  EdTech: GraduationCap, Cybersecurity: Shield, "E-Commerce": ShoppingCart,
}

const categoryColor: Record<string, string> = {
  GreenTech:    "#22c55e",
  HealthTech:   "#ec4899",
  AgriTech:     "#84cc16",
  EdTech:       "#3b82f6",
  Cybersecurity:"#f97316",
  "E-Commerce": "#a855f7",
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 0 }).format(n)
}

interface FeaturedProject {
  id: string
  title: string
  category: string
  description: string
  fundingGoal: number
  raisedAmount: number
  equityPercent: number
  entrepreneur: { id: string; name: string; image: string | null }
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<FeaturedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
            Live Opportunities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mt-4 text-muted-foreground">
            High-potential startups actively seeking investment
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No projects available yet
            </div>
          ) : projects.map((p) => {
            const pct = Math.round((p.raisedAmount / p.fundingGoal) * 100)
            const color = categoryColor[p.category] ?? "#fef47a"
            const Icon = categoryIcons[p.category] || Leaf
            const name = p.entrepreneur?.name || "Unknown"
            const initials = name.split(" ").map((n: string) => n[0]).join("")
            return (
              <Card key={p.id} className="group flex flex-col overflow-hidden border-border transition-all duration-instant hover:border-ring hover:-translate-y-1">
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-muted">
                  <div className="absolute inset-0 opacity-10" style={{ background: color }} />
                  <Icon className="h-16 w-16 opacity-20" style={{ color }} />
                  <div className="absolute left-0 right-0 top-0 h-0.5" style={{ background: color }} />
                  <Badge
                    className="absolute left-4 top-4 border-0 text-xs font-semibold"
                    style={{ background: `${color}22`, color }}
                  >
                    {p.category}
                  </Badge>
                </div>

                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base font-bold leading-snug">
                    {p.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xs border border-border bg-muted p-3">
                      <span className="text-xs text-muted-foreground">Goal</span>
                      <p className="mt-0.5 text-sm font-bold text-foreground">{fmt(p.fundingGoal)}</p>
                    </div>
                    <div className="rounded-xs border border-border bg-muted p-3">
                      <span className="text-xs text-muted-foreground">Equity</span>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: "var(--primary)" }}>{p.equityPercent}%</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Raised {fmt(p.raisedAmount)}</span>
                      <span className="font-bold text-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar size="sm" className="border-0">
                      {p.entrepreneur?.image && <AvatarImage src={p.entrepreneur.image} alt={name} />}
                      <AvatarFallback className="text-[9px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>by <span className="font-medium text-foreground">{name}</span></span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link href={`/projects/${p.id}`} className="w-full">
                    <Button variant="outline" className="group/btn w-full transition-colors duration-instant hover:border-ring">
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-instant group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/projects">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              Browse All Projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
