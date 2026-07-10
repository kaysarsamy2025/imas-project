"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Briefcase, TrendingUp, Check, Loader2, Zap, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [role, setRole] = useState<"ENTREPRENEUR" | "INVESTOR" | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    if (status === "authenticated" && session?.user && !session.user.needsOnboarding) {
      const dest = session.user.role === "INVESTOR" ? "/dashboard/investor" : "/dashboard/entrepreneur"
      router.push(dest)
    }
  }, [status, session, router])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleSubmit() {
    if (!role) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong")
        setSaving(false)
        return
      }
      await update()
      const dest = role === "INVESTOR" ? "/dashboard/investor" : "/dashboard/entrepreneur"
      router.push(dest)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-14 bg-muted border-r border-border">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,250,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[160px] opacity-20"
          style={{ background: "var(--primary)" }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: "var(--primary)" }}
            >
              <Zap className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">IMAS</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              One last step
            </div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Welcome to
              <br />
              <span className="text-primary">IMAS</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              You&apos;re almost there. Tell us how you&apos;d like to use the platform so we can tailor the experience for you.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: "Smart Matching", desc: "AI connects you with the right partners" },
              { title: "Secure Platform", desc: "End-to-end encrypted communications" },
              { title: "Real-time Analytics", desc: "Track your portfolio or fundraising progress" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3.5 rounded-xs border border-border bg-background p-4"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "var(--primary)" }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} IMAS. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-14 bg-background">
        <div className="w-full max-w-[460px] space-y-8">
          <div className="lg:hidden flex justify-center">
            <div className="inline-flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--primary)" }}
              >
                <Zap className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <span className="text-xl font-bold text-foreground">IMAS</span>
            </div>
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">Choose your path</h1>
            <p className="text-sm text-muted-foreground">
              Select how you want to use IMAS. You can always update this later.
            </p>
          </div>

          <div className="grid gap-4">
            {([
              {
                value: "ENTREPRENEUR",
                icon: Briefcase,
                title: "Entrepreneur",
                desc: "I want to raise funds for my venture and connect with investors",
                features: ["Create and manage projects", "Pitch to potential investors", "Track fundraising progress"],
              },
              {
                value: "INVESTOR",
                icon: TrendingUp,
                title: "Investor",
                desc: "I want to discover and invest in promising startups",
                features: ["Browse vetted opportunities", "Build a diversified portfolio", "Access detailed analytics"],
              },
            ] as const).map(({ value, icon: Icon, title, desc, features }) => {
              const isSelected = role === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`relative flex items-start gap-5 p-5 rounded-xs border text-left transition-all duration-instant ${
                    isSelected
                      ? "border-ring bg-muted shadow-sm"
                      : "border-border bg-background hover:border-ring hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xs shrink-0 transition-colors duration-instant ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <p className={`text-base font-semibold ${isSelected ? "text-foreground" : "text-foreground"}`}>
                        {title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <div className="space-y-1.5">
                      {features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className={`h-3 w-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  {isSelected && (
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow"
                      style={{ background: "var(--primary)" }}
                    >
                      <Check className="h-3.5 w-3.5" style={{ color: "var(--primary-foreground)" }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xs border border-destructive/30 bg-destructive/10 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!role || saving}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xs text-sm font-semibold transition-all duration-instant disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
