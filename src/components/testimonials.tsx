"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "David Park",
    role: "Angel Investor",
    company: "Park Capital Ventures",
    quote: "This platform completely transformed how I discover and vet startups. The transparency and direct communication with founders is unparalleled.",
    initials: "DP",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Tech Founder",
    company: "HealthBridge Inc.",
    quote: "As a first-time founder, I was amazed by how seamless the fundraising process was. We connected with our lead investor within two weeks of listing.",
    initials: "ER",
    rating: 5,
    featured: true,
  },
  {
    name: "Michael Thompson",
    role: "VC Partner",
    company: "Thompson & Co.",
    quote: "The quality of startups on this platform is exceptional. We've already made three investments through IMAS and are actively looking for more.",
    initials: "MT",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    /* Background — alternates with the muted stats above */
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-muted-foreground">Real stories from entrepreneurs and investors</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-xs border p-8 transition-all duration-instant hover:-translate-y-1 ${
                t.featured
                  ? "border-primary bg-muted shadow-lg"
                  : "border-border bg-muted hover:border-ring"
              }`}
            >
              {/* Featured badge */}
              {t.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Top Review
                </div>
              )}

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <Avatar className="ring-2 ring-primary/30">
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
