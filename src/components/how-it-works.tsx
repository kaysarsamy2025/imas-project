"use client"

import { UserPlus, Search, MessageSquare, TrendingUp, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up as an entrepreneur or investor and complete your verified profile in minutes.",
  },
  {
    icon: Search,
    title: "Submit or Browse",
    description: "Entrepreneurs submit projects with detailed pitches. Investors explore curated opportunities.",
  },
  {
    icon: MessageSquare,
    title: "Connect & Evaluate",
    description: "Chat directly, review pitch decks, and evaluate potential investments with full transparency.",
  },
  {
    icon: TrendingUp,
    title: "Invest & Grow",
    description: "Secure funding, track portfolio performance, and grow your business together seamlessly.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-muted py-24">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#2563eb" }}>
            Simple Process
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            From discovery to funding in four simple steps
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-border sm:hidden" />
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-border sm:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="group relative flex sm:flex-col">
                  <div className="relative z-10 flex sm:flex-col items-start gap-5 sm:gap-0">
                    <div className="relative flex shrink-0 items-center justify-center">
                      <div
                        className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                        style={{ background: "#2563eb" }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div
                          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-md ring-2 ring-background"
                          style={{ background: "#2563eb", color: "#fff" }}
                        >
                        {index + 1}
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="flex items-center sm:hidden flex-1 h-full min-h-[2rem]">
                        <div className="w-px flex-1 bg-border" />
                      </div>
                    )}

                    <div className="flex-1 pt-1 sm:pt-6 sm:text-center">
                      <div className="hidden sm:flex justify-center mb-4">
                        <ArrowRight
                          className={`h-5 w-5 transition-all duration-300 ${index < steps.length - 1 ? "text-muted-foreground/40" : "text-transparent"}`}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xs sm:mx-auto">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
