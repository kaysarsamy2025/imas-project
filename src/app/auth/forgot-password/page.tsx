"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      setSubmitted(true)
      setLoading(false)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="gradient-border rounded-2xl">
          <Card className="border-0 shadow-2xl glass rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 text-center pb-2 pt-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-subtle mb-6 mx-auto">
                <Mail className="h-8 w-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </CardHeader>
            <CardContent className="pb-10">
              {submitted ? (
                <div className="text-center space-y-4 py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSubmitted(false)}
                  >
                    Try another email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-brand hover:opacity-90 text-white shadow-lg shadow-brand-md hover:shadow-brand-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Reset Link
                  </Button>
                </form>
              )}

              <div className="flex justify-center mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
