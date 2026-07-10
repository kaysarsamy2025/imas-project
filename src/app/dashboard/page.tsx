import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  let user
  try {
    const session = await auth()
    if (session?.user) {
      user = session.user
    }
  } catch {}

  if (!user) redirect("/auth/login?error=session_expired")

  if (user.role === "GUEST") redirect("/auth/onboarding")
  if (user.role === "ADMIN") redirect("/dashboard/admin")
  if (user.role === "INVESTOR") redirect("/dashboard/investor")

  redirect("/dashboard/entrepreneur")
}
