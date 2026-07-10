"use client"

import { useEffect, useState } from "react"
import { Search, Loader2, AlertCircle, RefreshCw, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Investment {
  id: string; amount: number; equity: number; status: string; createdAt: string
  investor: { id: string; name: string; email: string }
  project: { id: string; title: string; category: string }
}

const statusCls: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING:   "bg-blue-600/10 text-blue-500 border-blue-600/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function AdminInvestments() {
  const [investments, setInvs] = useState<Investment[]>([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState("")
  const [search, setSearch]    = useState("")
  const [statusFilter, setStatus] = useState("All")

  async function load() {
    setLoading(true); setError("")
    try {
      // Admin gets all investments via the investments API
      const res  = await fetch("/api/investments")
      const data = await res.json()
      if (!res.ok) throw new Error()
      setInvs(Array.isArray(data) ? data : [])
    } catch { setError("Failed to load investments") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/investments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) load()
    } catch {}
  }

  const filtered = investments.filter(inv => {
    const matchSearch = inv.investor.name?.toLowerCase().includes(search.toLowerCase()) || inv.project.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "All" || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalFunding = investments.filter(i => i.status === "COMPLETED").reduce((s, i) => s + i.amount, 0)

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {investments.length} total investments · {formatCurrency(totalFunding)} completed funding
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by investor or project..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatus} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="All">All ({investments.length})</TabsTrigger>
                <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No investments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Investor", "Project", "Amount", "Equity", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="pb-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted">
                      <td className="py-3">
                        <p className="font-medium">{inv.investor.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.investor.email}</p>
                      </td>
                      <td className="py-3">
                        <p className="font-medium truncate max-w-[140px]">{inv.project.title}</p>
                        <p className="text-xs text-muted-foreground">{inv.project.category}</p>
                      </td>
                      <td className="py-3 font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="py-3 text-muted-foreground">{inv.equity}%</td>
                      <td className="py-3">
                        <Badge variant="outline" className={cn("font-medium", statusCls[inv.status] ?? "bg-muted text-muted-foreground")}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{formatDate(inv.createdAt)}</td>
                      <td className="py-3">
                        {inv.status === "PENDING" ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateStatus(inv.id, "COMPLETED")}
                              className="flex h-7 w-7 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Approve">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => updateStatus(inv.id, "CANCELLED")}
                              className="flex h-7 w-7 items-center justify-center rounded-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Reject">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
