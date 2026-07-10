"use client"

import { useEffect, useState } from "react"
import { Eye, Users, TrendingUp, DollarSign, ArrowUpRight, BarChart3, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Investment {
  id: string
  amount: number
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  createdAt: string
  investor: { id: string; name: string; image: string | null }
  project: { id: string; title: string }
}

const statusCls = {
  PENDING:   "bg-blue-600/10 text-blue-500 border-blue-600/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}
const statusDot = {
  PENDING: "bg-blue-500", COMPLETED: "bg-emerald-400", CANCELLED: "bg-red-400",
}

export default function AnalyticsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")

  async function load() {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/investments")
      const data = await res.json()
      if (!res.ok) throw new Error()
      setInvestments(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load analytics") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  /* Derived metrics */
  const totalRaised    = investments.filter(i => i.status === "COMPLETED").reduce((s, i) => s + i.amount, 0)
  const uniqueInvestors = new Set(investments.map(i => i.investor.id)).size
  const convRate       = investments.length > 0
    ? ((investments.filter(i => i.status === "COMPLETED").length / investments.length) * 100).toFixed(1)
    : "0.0"
  const avgInvestment  = investments.filter(i => i.status === "COMPLETED").length > 0
    ? totalRaised / investments.filter(i => i.status === "COMPLETED").length
    : 0

  const stats = [
    { label: "Total Raised",     value: formatCurrency(totalRaised),   sub: `from ${investments.filter(i=>i.status==="COMPLETED").length} completed`,    icon: DollarSign,   color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Investors",  value: String(uniqueInvestors),        sub: `${investments.length} investments total`,                                  icon: Users,        color: "text-violet-400",  bg: "bg-violet-500/10" },
    { label: "Conversion Rate",  value: `${convRate}%`,                 sub: "completed vs total",                                                       icon: TrendingUp,    color: "text-blue-400",    bg: "bg-blue-500/10" },
    { label: "Avg Investment",   value: formatCurrency(avgInvestment),  sub: "per completed deal",                                                       icon: BarChart3,     color: "text-blue-500",   bg: "bg-blue-600/10" },
  ]

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your project performance and investment metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="group border-border transition-colors hover:border-ring">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-xs p-3", s.bg)}>
                    <Icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/50">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Investment status breakdown */}
      {investments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {(["COMPLETED", "PENDING", "CANCELLED"] as const).map(status => {
            const count = investments.filter(i => i.status === status).length
            const total = investments.filter(i => i.status === status).reduce((s, i) => s + i.amount, 0)
            return (
              <Card key={status} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("border text-xs font-medium", statusCls[status])}>
                      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", statusDot[status])} />
                      {status}
                    </Badge>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-emerald-400">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground">total amount</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Investments table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Investments</CardTitle>
          <CardDescription>Complete investment history across your projects</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium">No investments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Investment data will appear here once investors fund your projects</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Investor", "Project", "Amount", "Date", "Status"].map(h => (
                      <th key={h} className={cn("px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground/60",
                        h === "Amount" || h === "Date" ? "text-right" : h === "Status" ? "text-center" : "text-left"
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-muted">
                      <td className="px-6 py-4 font-medium">{inv.investor.name}</td>
                      <td className="px-6 py-4 text-muted-foreground/70 max-w-[160px] truncate">{inv.project.title}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground/60">{formatDate(inv.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={cn("border text-[10px] font-medium", statusCls[inv.status])}>
                          <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", statusDot[inv.status])} />
                          {inv.status}
                        </Badge>
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
