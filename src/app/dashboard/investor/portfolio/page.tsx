"use client"

import { useEffect, useState } from "react"
import { DollarSign, TrendingUp, ArrowUpRight, Briefcase, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Investment {
  id: string; amount: number; equity: number; status: string; createdAt: string
  project: { id: string; title: string; category: string; fundingGoal: number; raisedAmount: number }
}

const statusCls: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING:   "bg-blue-600/10 text-blue-500 border-blue-600/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}
const statusDot: Record<string, string> = {
  COMPLETED: "bg-emerald-400", PENDING: "bg-blue-500", CANCELLED: "bg-red-400",
}

export default function Portfolio() {
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
    } catch { setError("Failed to load portfolio") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0)
  const activeCount   = investments.filter(i => i.status !== "CANCELLED").length
  const completedAmt  = investments.filter(i => i.status === "COMPLETED").reduce((s, i) => s + i.amount, 0)

  const summary = [
    { label: "Total Invested",     value: formatCurrency(totalInvested), icon: DollarSign,  color: "text-blue-400",    bg: "bg-blue-500/10" },
    { label: "Completed Deals",    value: formatCurrency(completedAmt),  icon: TrendingUp,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Equity Owned", value: `${investments.reduce((s,i)=>s+i.equity,0).toFixed(2)}%`, icon: ArrowUpRight, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Active Deals",       value: String(activeCount),           icon: Briefcase,   color: "text-blue-500",   bg: "bg-blue-600/10" },
  ]

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
        <p className="text-sm text-muted-foreground">Track and manage your investment portfolio.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => {
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
                <div className="text-2xl font-bold tracking-tight">{s.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No investments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                    <th className="px-6 py-4 text-left">Project</th>
                    <th className="px-6 py-4 text-right">Invested</th>
                    <th className="px-6 py-4 text-right">Equity</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv, i) => (
                    <tr key={inv.id} className={cn("border-b border-border transition-colors hover:bg-muted", i === investments.length-1 && "border-b-0")}>
                      <td className="px-6 py-4">
                        <p className="font-semibold truncate max-w-[200px]">{inv.project.title}</p>
                        <p className="text-xs text-muted-foreground">{inv.project.category}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 text-right font-medium">{inv.equity}%</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={cn("inline-flex items-center gap-1.5 border text-[10px] font-medium", statusCls[inv.status] ?? "bg-muted text-muted-foreground")}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[inv.status] ?? "bg-muted-foreground")} />
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground/60">{formatDate(inv.createdAt)}</td>
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
