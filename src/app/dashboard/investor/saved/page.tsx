"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Trash2, BarChart3, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency } from "@/lib/utils"

interface SavedItem {
  id: string
  project: {
    id: string; title: string; description: string; category: string
    fundingGoal: number; raisedAmount: number; equityPercent: number
    entrepreneur: { id: string; name: string; image: string | null }
  }
}

export default function SavedProjects() {
  const router  = useRouter()
  const [items, setItems]     = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [removing, setRemoving] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/saved-projects")
      const data = await res.json()
      if (!res.ok) throw new Error()
      setItems(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load saved projects") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function remove(projectId: string) {
    setRemoving(projectId)
    try {
      await fetch("/api/saved-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      setItems(p => p.filter(i => i.project.id !== projectId))
    } catch {}
    finally { setRemoving(null) }
  }

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Projects</h1>
        <p className="text-sm text-muted-foreground">Projects you have bookmarked for later.</p>
      </div>

      {items.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bookmark className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-medium">No saved projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse projects and click the heart icon to save them.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/investor/browse")}>Browse Projects</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ id, project }) => {
            const pct = project.fundingGoal > 0 ? Math.min(Math.round((project.raisedAmount / project.fundingGoal) * 100), 100) : 0
            return (
              <Card key={id} className="group flex flex-col border-border transition-colors hover:border-ring">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base truncate">{project.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs font-normal">{project.category}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                      disabled={removing === project.id} onClick={() => remove(project.id)}>
                      {removing === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                    <div className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{project.equityPercent}% Equity</div>
                    <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /><span className="truncate max-w-[100px]">{project.entrepreneur.name}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0">
                  <Button className="flex-1" size="sm" variant="outline" onClick={() => remove(project.id)} disabled={removing === project.id}>Remove</Button>
                  <Button className="flex-1" size="sm" onClick={() => router.push(`/projects/${project.id}`)}>View</Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
