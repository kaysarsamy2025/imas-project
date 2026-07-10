"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MailCheck, Loader2, ArrowLeft } from "lucide-react"

export default function VerifyPage() {
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setResent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="gradient-border rounded-2xl">
          <Card className="border-0 shadow-2xl glass rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 text-center pb-2 pt-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-subtle mb-6 mx-auto">
                <MailCheck className="h-8 w-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-sm text-muted-foreground">We&apos;ve sent a verification link to your email</p>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If you don&apos;t see the email, check your spam folder or click below to resend.
                  </p>
                </div>

                {resent && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-600">
                      Verification email resent successfully
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full h-11 border-2 hover:bg-gray-50 transition-all"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MailCheck className="h-4 w-4 mr-2" />
                  )}
                  Resend Email
                </Button>

                <div className="flex justify-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
