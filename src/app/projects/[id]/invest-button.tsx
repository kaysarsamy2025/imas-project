"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, ChevronRight, Loader2, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default function InvestButton({ projectId, projectTitle, fundingGoal, equityPercent }: { projectId: string; projectTitle: string; fundingGoal: number; equityPercent: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [investing, setInvesting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleInvest() {
    const num = Number(amount)
    if (!num || num <= 0) return
    setInvesting(true)
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, amount: num, equity: ((num / fundingGoal) * equityPercent) }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Investment failed")
        return
      }
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false); setAmount(""); router.refresh() }, 1500)
    } catch {
      alert("Something went wrong")
    } finally {
      setInvesting(false)
    }
  }

  return (
    <div className="rounded-xs border border-border bg-card p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Interested in this project?</h3>
          <p className="text-sm text-muted-foreground mb-4">Invest now and become part of this journey.</p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xs text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <DollarSign className="h-4 w-4" />
            Invest Now
          </button>
        </div>

        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-lg font-semibold">Investment Submitted!</p>
              <p className="text-sm text-muted-foreground">Your investment request is being processed.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Invest in {projectTitle}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Enter the amount you would like to invest. Minimum is $100.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-12 text-lg"
                  />
                </div>
                {amount && Number(amount) > 0 && (
                  <div className="rounded-xs bg-muted p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-bold">{formatCurrency(Number(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equity Share</span>
                      <span className="font-bold">~{((Number(amount) / fundingGoal) * equityPercent).toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </DialogClose>
                <Button
                  className="flex-1"
                  disabled={!amount || Number(amount) <= 0 || investing}
                  onClick={handleInvest}
                >
                  {investing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Confirm Investment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
