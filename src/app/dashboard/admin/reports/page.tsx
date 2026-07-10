"use client"

import { useEffect, useState } from "react"
import { Users, DollarSign, Briefcase, TrendingUp, Activity, UserPlus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, formatDateRelative } from "@/lib/utils"

interface ReportData {
  totalUsers: number
  totalProjects: number
  totalInvestments: number
  totalFunding: number
  pendingProjects: number
  completedInvestments: number
  cancelledInvestments: number
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[]
  recentInvestments: { id: string; amount: number; status: string; createdAt: string; investor: { name: string }; project: { title: string } }[]
  categoryBreakdown: Record<string, number>
}

export default function AdminReports() {
  const [data, setData]       = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [period, setPeriod]   = useState("30")

  async function load() {
    setLoading(true); setError("")
    try {
      const [usersRes, projectsRes, investmentsRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/projects/all"),
        fetch("/api/investments"),
      ])
      const [usersData, projectsData, invData] = await Promise.all([
        usersRes.json(), projectsRes.json(), investmentsRes.json(),
      ])

      const allUsers = Array.isArray(usersData.users) ? usersData.users : []
      const allProjects = Array.isArray(projectsData) ? projectsData : []
      const allInvs = Array.isArray(invData) ? invData : []

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {}
      allProjects.forEach((p: any) => {
        categoryBreakdown[p.category] = (categoryBreakdown[p.category] ?? 0) + 1
      })

      setData({
        totalUsers: usersData.total ?? allUsers.length,
        totalProjects: allProjects.length,
        totalInvestments: allInvs.length,
        totalFunding: allInvs.filter((i: any) => i.status === "COMPLETED").reduce((s: number, i: any) => s + i.amount, 0),
        pendingProjects: allProjects.filter((p: any) => p.status === "PENDING").length,
        completedInvestments: allInvs.filter((i: any) => i.status === "COMPLETED").length,
        cancelledInvestments: allInvs.filter((i: any) => i.status === "CANCELLED").length,
        recentUsers: allUsers.slice(0, 5),
        recentInvestments: allInvs.slice(0, 5),
        categoryBreakdown,
      })
    } catch { setError("Failed to load reports") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  const successRate = data && data.totalInvestments > 0
    ? Math.round((data.completedInvestments / data.totalInvestments) * 100)
    : 0

  const summaryCards = [
    { title: "Total Users",       value: String(data?.totalUsers ?? 0),           change: "registered",  icon: Users,     bg: "bg-blue-500/10",    color: "text-blue-400" },
    { title: "Total Funding",     value: formatCurrency(data?.totalFunding ?? 0),  change: "completed",   icon: DollarSign, bg: "bg-emerald-500/10", color: "text-emerald-400" },
    { title: "Total Projects",    value: String(data?.totalProjects ?? 0),          change: "submitted",   icon: Briefcase, bg: "bg-violet-500/10",  color: "text-violet-400" },
    { title: "Success Rate",      value: `${successRate}%`,                        change: "investments", icon: TrendingUp, bg: "bg-blue-600/10",   color: "text-blue-500" },
  ]

  const invStatusCards = [
    { label: "Completed", value: data?.completedInvestments ?? 0,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending",   value: data?.totalInvestments && data.totalInvestments - (data.completedInvestments + data.cancelledInvestments), color: "text-blue-500", bg: "bg-blue-600/10" },
    { label: "Cancelled", value: data?.cancelledInvestments ?? 0, color: "text-red-400",     bg: "bg-red-500/10" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time platform metrics and insights.</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="365">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-xs p-2.5", card.bg)}>
                    <Icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{card.change}</span>
                </div>
                <p className="mt-3 text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Investment breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {invStatusCards.map(s => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label} Investments</p>
              <p className={cn("mt-2 text-3xl font-bold", s.color)}>{s.value}</p>
              <div className={cn("mt-2 h-1 rounded-full", s.bg)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />Project Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data?.categoryBreakdown ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              Object.entries(data!.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between gap-3">
                    <span className="text-sm truncate">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max((count / data!.totalProjects) * 80, 8)}px` }} />
                      <span className="text-xs font-semibold text-muted-foreground w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
            ) : (
              data!.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateRelative(u.createdAt)}</p>
                  </div>
                  <span className="shrink-0 text-xs rounded-xs border border-border bg-muted px-2 py-0.5 text-muted-foreground">{u.role}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />Recent Investments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentInvestments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No investments yet</p>
            ) : (
              data!.recentInvestments.map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.investor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{inv.project.title}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-400">{formatCurrency(inv.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
