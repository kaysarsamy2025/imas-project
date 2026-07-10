"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-primary" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Blue glow top-center */}
      <div
        className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full blur-[120px] opacity-15"
        style={{ background: "var(--primary)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-36 pt-28 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Trusted Investment Platform
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              NEW
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            Where{" "}
            <span
              className="relative inline-block"
              style={{ color: "var(--primary)" }}
            >
              Innovation
            </span>
            <br />
            Meets Investment
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Connect visionary entrepreneurs with strategic investors.
            Fuel the next generation of groundbreaking startups on the most trusted platform.
          </p>

          {/* CTAs */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <Link href="/auth/register?role=INVESTOR">
              <Button size="lg" className="h-12 gap-2 px-8 text-base">
                Start Investing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register?role=ENTREPRENEUR">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Submit Your Project
              </Button>
              </Link>
            </div>
        </div>

        {/* Scroll-down indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Scroll
          </span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/30 p-1">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/60 animate-scroll-dot" />
          </div>
        </div>
      </div>
    </section>
  )
}
