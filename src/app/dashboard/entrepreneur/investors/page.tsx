"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Building2, DollarSign, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"

interface Investor {
  id: string
  name: string
  email: string
  image: string | null
  company: string | null
  bio: string | null
}

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  async function load() {
    setLoading(true); setError("")
    try {
      // fetch unique investors who invested in my projects
      const res  = await fetch("/api/investments")
      const data = await res.json()
      if (!res.ok) throw new Error()

      // deduplicate by investor id
      const map = new Map<string, Investor>()
      if (Array.isArray(data)) {
        for (const inv of data) {
          if (inv.investor && !map.has(inv.investor.id)) {
            map.set(inv.investor.id, inv.investor)
          }
        }
      }
      setInvestors(Array.from(map.values()))
    } catch { setError("Failed to load investors") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
        <h1 className="text-3xl font-bold text-foreground">Investors</h1>
        <p className="text-sm text-muted-foreground">
          {investors.length > 0
            ? `${investors.length} investor${investors.length !== 1 ? "s" : ""} have invested in your projects`
            : "Investors who fund your projects will appear here"}
        </p>
      </div>

      {investors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-xs bg-muted ring-1 ring-border">
            <Users className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">No investors yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Once investors fund your projects, they&apos;ll appear here.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => router.push("/dashboard/entrepreneur/projects")}>
            View My Projects
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {investors.map((investor) => {
            const initials = investor.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"
            return (
              <Card key={investor.id} className="group border-border transition-colors hover:border-ring">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/30 transition-colors">
                      {investor.image && <AvatarImage src={investor.image} alt={investor.name} />}
                      <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {investor.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{investor.email}</p>
                    </div>
                  </div>

                  {(investor.company || investor.bio) && (
                    <div className="mt-4 space-y-2">
                      {investor.company && (
                        <div className="flex items-center gap-2 rounded-xs border border-border bg-muted px-3 py-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{investor.company}</span>
                        </div>
                      )}
                      {investor.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{investor.bio}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-5">
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-border bg-primary/5 text-primary hover:bg-primary/10"
                      onClick={() => router.push("/dashboard/entrepreneur/messages")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
