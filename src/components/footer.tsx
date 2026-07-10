"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const navigation = {
  platform: [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Browse", href: "/projects" },
    { name: "Dashboard", href: "/dashboard/entrepreneur" },
  ],
  account: [
    { name: "Get Started", href: "/auth/register" },
    { name: "Sign In", href: "/auth/login" },
  ],
}

const socials = [
  { name: "Facebook", href: "#", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { name: "Twitter", href: "#", icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
  { name: "LinkedIn", href: "#", icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { name: "GitHub", href: "#", icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">

      {/* Yellow CTA strip */}
      <div className="bg-primary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">Ready to get started?</h3>
              <p className="mt-1 text-sm text-primary-foreground/70">Join thousands of entrepreneurs and investors on IMAS.</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/auth/register?role=INVESTOR">
                <Button size="lg" className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors duration-instant">
                  Start Investing
                </Button>
              </Link>
              <Link href="/auth/register?role=ENTREPRENEUR">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors duration-instant">
                  Submit Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">

          {/* Newsletter */}
          <div className="mx-auto mb-14 max-w-2xl rounded-xs border border-border bg-muted p-8 text-center md:p-10">
            <h3 className="mb-2 text-2xl font-bold text-foreground">
              Stay Ahead with <span style={{ color: "var(--primary)" }}>IMAS</span>
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Get the latest updates on projects and investment opportunities.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button type="submit" className="shrink-0">Subscribe</Button>
            </form>
          </div>

          {/* Nav grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="mb-4 inline-block text-2xl font-bold text-foreground">
                IMAS
              </Link>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Investment Matching &amp; Advisory System — connecting visionary entrepreneurs with strategic investors.
              </p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.name} href={s.href} aria-label={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-xs border border-border bg-muted text-muted-foreground transition-colors duration-instant hover:border-ring hover:text-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d={s.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">Platform</h4>
              <ul className="space-y-3">
                {navigation.platform.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground transition-colors duration-instant hover:text-foreground">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">Account</h4>
              <ul className="space-y-3">
                {navigation.account.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground transition-colors duration-instant hover:text-foreground">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} IMAS. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="#" className="transition-colors duration-instant hover:text-foreground">Terms</Link>
              <Link href="#" className="transition-colors duration-instant hover:text-foreground">Privacy</Link>
              <Link href="#" className="transition-colors duration-instant hover:text-foreground">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
