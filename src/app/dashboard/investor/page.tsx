"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  TrendingUp, DollarSign, Briefcase, Bookmark,
  ArrowUpRight, ArrowDownRight, Search, Loader2,
  AlertCircle, RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Investment {
  id: string; amount: number; equity: number; status: string; createdAt: string
  project: { id: string; title: string; category: string }
}

interface SavedProject { id: string; project: { id: string; title: string } }

const statusCls: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING:   "bg-blue-600/10 text-blue-500 border-blue-600/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function InvestorOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Investor"

  const [investments, setInvestments]   = useState<Investment[]>([])
  const [saved, setSaved]               = useState<SavedProject[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState("")

  async function load() {
    setLoading(true); setError("")
    try {
      const [invRes, savedRes] = await Promise.all([
        fetch("/api/investments"),
        fetch("/api/saved-projects"),
      ])
      const [invData, savedData] = await Promise.all([invRes.json(), savedRes.json()])
      setInvestments(Array.isArray(invData) ? invData : [])
      setSaved(Array.isArray(savedData) ? savedData : [])
    } catch { setError("Failed to load dashboard") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const totalInvested  = investments.reduce((s, i) => s + i.amount, 0)
  const activeCount    = investments.filter(i => i.status === "PENDING").length
  const completedTotal = investments.filter(i => i.status === "COMPLETED").reduce((s, i) => s + i.amount, 0)
  const savedCount     = saved.length

  const stats = [
    { label: "Total Invested",       value: formatCurrency(totalInvested), icon: DollarSign,  color: "text-emerald-400", bg: "bg-emerald-500/10", positive: true,  change: `${investments.length} deals` },
    { label: "Active Investments",   value: String(activeCount),           icon: TrendingUp,  color: "text-blue-400",    bg: "bg-blue-500/10",    positive: true,  change: "pending" },
    { label: "Completed Returns",    value: formatCurrency(completedTotal),icon: ArrowUpRight, color: "text-violet-400",  bg: "bg-violet-500/10",  positive: true,  change: `${investments.filter(i=>i.status==="COMPLETED").length} completed` },
    { label: "Saved Projects",       value: String(savedCount),            icon: Bookmark,    color: "text-blue-500",   bg: "bg-blue-600/10",   positive: true,  change: "bookmarked" },
  ]

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
  if (error) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {firstName}!</h1>
        <p className="text-sm text-muted-foreground">Here is what is happening with your investments today.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="group border-border transition-colors hover:border-ring">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">{s.label}</CardTitle>
                <div className={cn("rounded-xs p-2.5 transition-transform group-hover:scale-110", s.bg)}>
                  <Icon className={cn("h-4 w-4", s.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                <p className={cn("mt-2 flex items-center text-xs font-medium", s.positive ? "text-emerald-400" : "text-red-400")}>
                  {s.positive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {s.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button className="gap-2" onClick={() => router.push("/dashboard/investor/browse")}>
          <Search className="h-4 w-4" />Browse Projects
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => router.push("/dashboard/investor/portfolio")}>
          <Briefcase className="h-4 w-4" />View Portfolio
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-4">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest investment activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {investments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">No investments yet</p>
                <Button size="sm" className="mt-3" onClick={() => router.push("/dashboard/investor/browse")}>
                  Browse Projects
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {investments.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="group flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{inv.project.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{inv.project.category} · {formatDate(inv.createdAt)}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                      <Badge className={cn("mt-1 border text-[10px]", statusCls[inv.status] ?? "bg-muted text-muted-foreground")}>
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
