"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User, Mail, Lock, Eye, EyeOff,
  Briefcase, TrendingUp, Loader2, ArrowRight, Check, Zap,
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"ENTREPRENEUR" | "INVESTOR" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!role) { setError("Please select a role to continue"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return }
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) { router.push("/auth/login"); return }
      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-14 bg-muted border-r border-border">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,250,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Yellow glow */}
        <div
          className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-[140px] opacity-25"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[100px] opacity-10"
          style={{ background: "var(--primary)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: "var(--primary)" }}
            >
              <Zap className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">IMAS</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground leading-snug">
              Start your
              <br />
              <span className="text-primary">investment journey</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Whether you&apos;re raising funds or deploying capital, IMAS gives you the tools to succeed.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: "Smart Matching", desc: "AI connects you with the right partners" },
              { title: "Secure Platform", desc: "End-to-end encrypted communications" },
              { title: "Expert Guidance", desc: "Advisory support at every stage" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3.5 rounded-xs border border-border bg-background p-4 transition-colors duration-instant hover:border-ring"
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
          © {new Date().getFullYear()} IMAS. All rights reserved.
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-14 bg-background overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--primary)" }}
              >
                <Zap className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <span className="text-xl font-bold text-foreground">IMAS</span>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join thousands of entrepreneurs and investors</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xs border border-border bg-muted text-sm font-medium text-foreground hover:border-ring hover:bg-muted/80 transition-colors duration-instant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or register with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 pl-10 rounded-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 pl-10 rounded-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  className="h-11 pl-10 pr-11 rounded-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-instant"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">I want to join as</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["ENTREPRENEUR", "INVESTOR"] as const).map((r) => {
                  const isSelected = role === r
                  const Icon = r === "ENTREPRENEUR" ? Briefcase : TrendingUp
                  const label = r === "ENTREPRENEUR" ? "Entrepreneur" : "Investor"
                  const desc = r === "ENTREPRENEUR" ? "Raise funds for your venture" : "Discover opportunities"
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xs border text-center transition-colors duration-instant ${
                        isSelected
                          ? "border-ring bg-muted"
                          : "border-border bg-background hover:border-ring hover:bg-muted"
                      }`}
                    >
                      {/* Icon box */}
                      <div
                        className="p-2.5 rounded-xs transition-colors duration-instant"
                        style={
                          isSelected
                            ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                            : { background: "var(--muted)", color: "var(--muted-foreground)" }
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">{desc}</p>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow"
                          style={{ background: "var(--primary)" }}
                        >
                          <Check className="h-3 w-3" style={{ color: "var(--primary-foreground)" }} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xs border border-destructive/30 bg-destructive/10 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xs text-sm font-semibold transition-colors duration-instant disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition-colors duration-instant"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
