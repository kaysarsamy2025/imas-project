"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Menu,
  X,
  Shield,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/dashboard/admin/investments", label: "Investments", icon: DollarSign },
  { href: "/dashboard/admin/reports", label: "Reports", icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD"

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-muted border-r border-border transition-transform duration-instant lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-wide text-foreground">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 pt-6">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xs px-3 py-2.5 text-sm font-medium transition-colors duration-instant",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-instant", !isActive && "group-hover:scale-110")} />
                <span>{item.label}</span>
                {isActive && <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xs px-3 py-2.5 transition-colors duration-instant hover:bg-background">
            <Avatar size="sm" className="ring-2 ring-border ring-offset-2 ring-offset-background">
              {user?.image && <AvatarImage src={user.image} alt={user?.name ?? ""} />}
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">Administrator</p>
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
        <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              Admin Panel
            </span>
          </div>
        </header>

        <main className="flex-1 bg-background p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
