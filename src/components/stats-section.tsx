"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, Users, Globe, FolderOpen } from "lucide-react"

const stats = [
  { value: 150, suffix: "+", label: "Projects Funded",  icon: FolderOpen, desc: "Across all sectors" },
  { value: 2500, suffix: "+", label: "Active Investors", icon: Users,     desc: "From 30+ countries" },
  { value: 45,  prefix: "$", suffix: "M+", label: "Total Funding", icon: TrendingUp, desc: "Deployed to date" },
  { value: 30,  suffix: "+", label: "Countries",         icon: Globe,     desc: "Global reach" },
]

export default function StatsSection() {
  const [counts, setCounts] = useState(stats.map(() => 0))
  const sectionRef = useRef<HTMLElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasAnimated) setHasAnimated(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return
    const durations = [2000, 2500, 2200, 1800]
    const startTime = Date.now()
    const timers = stats.map((stat, i) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / durations[i], 1)
        setCounts(prev => { const next = [...prev]; next[i] = Math.floor(progress * stat.value); return next })
        if (progress >= 1) clearInterval(interval)
      }, Math.max(Math.floor(durations[i] / stat.value), 16))
      return interval
    })
    return () => timers.forEach(clearInterval)
  }, [hasAnimated])

  return (
    /* Yellow-tinted muted section — strong visual break */
    <section ref={sectionRef} className="relative overflow-hidden bg-muted py-20">
      {/* Yellow accent line top */}
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-primary opacity-60" />

      {/* Yellow glow */}
      <div
        className="absolute left-1/2 top-1/2 h-64 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] opacity-8"
        style={{ background: "var(--primary)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="group text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xs border border-border bg-background transition-colors duration-instant group-hover:border-primary"
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-4xl font-bold sm:text-5xl lg:text-6xl" style={{ color: "var(--primary)" }}>
                  {stat.prefix ?? ""}{counts[i]}{stat.suffix}
                </div>
                <div className="mt-1.5 text-sm font-semibold text-foreground">{stat.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Yellow accent line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-60" />
    </section>
  )
}
