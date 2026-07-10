import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("next-auth.session-token")?.value
  const secureToken = request.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken && !secureToken) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
