"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Investment {
  id: string; amount: number; equity: number; status: string; createdAt: string
  project: { id: string; title: string }
}

const statusCls: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING:   "bg-blue-600/10 text-blue-500 border-blue-600/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function InvestmentHistory() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [tab, setTab]                 = useState("all")

  async function load() {
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/investments")
      const data = await res.json()
      if (!res.ok) throw new Error()
      setInvestments(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load history") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = tab === "all" ? investments : investments.filter(i => i.status === tab.toUpperCase())

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
        <h1 className="text-2xl font-bold tracking-tight">Investment History</h1>
        <p className="text-sm text-muted-foreground">View all your past and pending investment activity.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({investments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-border">
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No {tab === "all" ? "" : tab} transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Project</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-right font-medium">Equity</th>
                    <th className="px-6 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, i) => (
                    <tr key={inv.id} className={cn("border-b border-border transition-colors hover:bg-muted", i === filtered.length-1 && "border-b-0")}>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                      <td className="px-6 py-4 font-medium truncate max-w-[200px]">{inv.project.title}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{inv.equity}%</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={cn("border text-[10px] font-medium", statusCls[inv.status] ?? "bg-muted text-muted-foreground")}>{inv.status}</Badge>
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
