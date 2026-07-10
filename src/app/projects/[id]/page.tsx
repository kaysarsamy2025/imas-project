import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Zap, ArrowLeft, TrendingUp, DollarSign, Building2, Shield, BadgeCheck } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import InvestButton from "./invest-button"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      entrepreneur: {
        select: { id: true, name: true, email: true, image: true, company: true, bio: true },
      },
      investments: {
        include: {
          investor: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  })

  if (!project) notFound()

  const progressPercent = project.fundingGoal > 0 ? Math.min((project.raisedAmount / project.fundingGoal) * 100, 100) : 0
  const isOwner = session?.user?.id === project.entrepreneurId
  const isInvestor = session?.user?.role === "INVESTOR"

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                <Zap className="h-4 w-4" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <span className="text-lg font-bold text-foreground">IMAS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Projects</Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            </nav>
            {session?.user ? (
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Dashboard</Link>
            ) : (
              <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Hero */}
        <div className="rounded-xs border border-border bg-card overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-4 flex-1 min-w-0">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {project.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
              {project.images?.[0] && (
                <div className="w-32 h-32 rounded-xs border border-border bg-muted overflow-hidden shrink-0">
                  <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xs border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xs flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funding Goal</p>
                <p className="text-xl font-bold text-foreground">${project.fundingGoal.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: "var(--primary)" }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Raised: ${project.raisedAmount.toLocaleString()}</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equity</p>
                <p className="text-xl font-bold text-foreground">{project.equityPercent}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-xs border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-bold text-foreground capitalize">{project.status.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entrepreneur Info */}
        <div className="rounded-xs border border-border bg-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">About the Entrepreneur</h2>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-border shrink-0">
              <AvatarImage src={project.entrepreneur.image || undefined} alt={project.entrepreneur.name || ""} />
              <AvatarFallback style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "14px", fontWeight: 700 }}>
                {project.entrepreneur.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{project.entrepreneur.name || "Anonymous"}</p>
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              {project.entrepreneur.company && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {project.entrepreneur.company}
                </div>
              )}
              {project.entrepreneur.bio && (
                <p className="text-sm text-muted-foreground">{project.entrepreneur.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Investment History */}
        {project.investments.length > 0 && (
          <div className="rounded-xs border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Investment History ({project.investments.length})</h2>
            <div className="space-y-3">
              {project.investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-border shrink-0">
                      <AvatarImage src={inv.investor.image || undefined} alt={inv.investor.name || ""} />
                      <AvatarFallback style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "10px", fontWeight: 700 }}>
                        {inv.investor.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.investor.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{inv.status.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${inv.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{inv.equity}% equity</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invest CTA */}
        {isOwner ? null : isInvestor ? (
          <InvestButton projectId={project.id} projectTitle={project.title} fundingGoal={project.fundingGoal} equityPercent={project.equityPercent} />
        ) : (
          <div className="rounded-xs border border-border bg-card p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Interested in this project?</h3>
            <p className="text-sm text-muted-foreground mb-4">Sign in as an investor to start investing.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xs text-sm font-semibold transition-colors"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Sign In to Invest
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                  <Zap className="h-4 w-4" style={{ color: "var(--primary-foreground)" }} />
                </div>
                <span className="text-lg font-bold text-foreground">IMAS</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Investment Matching & Advisory System — connecting visionary entrepreneurs with strategic investors.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
                <li><Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</Link></li>
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-muted-foreground">Documentation</span></li>
                <li><span className="text-sm text-muted-foreground">API Status</span></li>
                <li><span className="text-sm text-muted-foreground">Support</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 IMAS. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Terms</span>
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Privacy</span>
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
