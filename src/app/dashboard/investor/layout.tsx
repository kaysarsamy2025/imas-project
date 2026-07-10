"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Search,
  Briefcase,
  History,
  Bookmark,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navLinks = [
  { href: "/dashboard/investor", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/investor/browse", label: "Browse", icon: Search },
  { href: "/dashboard/investor/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/dashboard/investor/history", label: "History", icon: History },
  { href: "/dashboard/investor/saved", label: "Saved", icon: Bookmark },
]

export default function InvestorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "IN"

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-muted border-r border-border transition-transform duration-instant lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary text-sm font-bold text-primary-foreground">
            I
          </div>
          <span className="text-lg font-bold text-foreground">IMAS</span>
          <span className="ml-auto rounded-sm bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary ring-1 ring-primary/20">
            Investor
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4 pt-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard/investor"
                ? pathname === "/dashboard/investor"
                : pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xs px-3 py-2.5 text-sm font-medium transition-colors duration-instant",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-instant", !isActive && "group-hover:scale-110")} />
                <span>{link.label}</span>
                {isActive && <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="mx-4 w-auto bg-border" />

        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xs px-3 py-2.5 transition-colors duration-instant hover:bg-background">
            <Avatar size="sm" className="ring-2 ring-border ring-offset-2 ring-offset-background">
              {user?.image && <AvatarImage src={user.image} alt={user?.name ?? ""} />}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name || "Investor"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "investor@example.com"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-instant"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xs hover:bg-muted"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5 text-muted-foreground" /> : <Menu className="h-5 w-5 text-muted-foreground" />}
          </Button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
