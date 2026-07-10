"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, LayoutDashboard, MessageSquare, LogOut, User, ChevronDown, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Browse Projects" },
  { href: "/#how-it-works", label: "How It Works" },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/dashboard/admin"
      : session?.user?.role === "INVESTOR"
        ? "/dashboard/investor"
        : "/dashboard/entrepreneur"

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-instant ${
      scrolled
        ? "border-b border-border bg-background/80 backdrop-blur-xl"
        : "bg-background"
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            IMAS
          </span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.replace("/#", "/"))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xs px-4 py-2 text-sm font-medium transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-2.5 rounded-md px-3 py-2 hover:bg-muted"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border ring-offset-2 ring-offset-background">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                      {session.user.name?.charAt(0) ?? <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground lg:block">
                    {session.user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform ui-open:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-64 rounded-lg border border-border bg-card p-0 shadow-xl"
              >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <Avatar className="h-9 w-9 ring-2 ring-border ring-offset-1 ring-offset-card shrink-0">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                      {session.user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 focus:bg-muted cursor-pointer">
                    <Link href={dashboardHref} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 focus:bg-muted cursor-pointer">
                    <Link href="/messages" className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Messages</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 focus:bg-muted cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div className="border-t border-border p-1.5">
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="rounded-md px-3 py-2.5 focus:bg-destructive/10 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                        <LogOut className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <span className="text-sm font-medium text-destructive">Sign Out</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm font-medium rounded-md">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild className="rounded-md">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-instant hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-instant ease-in-out md:hidden ${
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-border bg-background px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-instant hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-border pt-4">
            {session?.user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                      {session.user.name?.charAt(0) ?? <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {session.user.name}
                    </span>
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-instant hover:bg-muted hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-instant hover:bg-muted hover:text-foreground"
                >
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messages
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-destructive transition-colors duration-instant hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Button variant="outline" asChild className="w-full rounded-md">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full rounded-md">
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
