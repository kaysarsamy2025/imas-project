"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, TrendingUp, Users, DollarSign, Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError("")
    try {
      await signIn("google", { callbackUrl: "/dashboard", redirect: false }).then((result) => {
        if (result?.error) {
          setError(`Google sign-in failed: ${result.error}`)
          setLoading(false)
        } else if (result?.url) {
          window.location.href = result.url
        }
      })
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14 bg-muted border-r border-border">
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,250,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* blue glow blob */}
        <div
          className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-[160px] opacity-20"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[120px] opacity-10"
          style={{ background: "var(--primary)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: "var(--primary)" }}
            >
              <Zap className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">IMAS</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Trusted by 10,000+ users worldwide
            </div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Where capital meets
              <br />
              <span className="text-primary">innovation</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              Connect with visionary entrepreneurs and strategic investors on the most trusted investment platform.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: DollarSign, value: "$50M+", label: "Funding Raised" },
              { icon: Users, value: "500+", label: "Entrepreneurs" },
              { icon: TrendingUp, value: "200+", label: "Investors" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xs border border-border bg-background p-4 text-center transition-colors duration-instant hover:border-ring"
              >
                <stat.icon className="h-4 w-4 mx-auto mb-2 text-primary" />
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "AI-powered investor–entrepreneur matching",
              "Secure end-to-end encrypted messaging",
              "Real-time portfolio analytics & insights",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} IMAS. All rights reserved.
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-14 bg-background">
        <div className="w-full max-w-[400px] space-y-8">

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
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your IMAS account</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-instant"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-11 rounded-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition-colors duration-instant"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
