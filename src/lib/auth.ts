import NextAuth, { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      if (token.needsOnboarding && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { role: true },
          })
          if (dbUser && dbUser.role !== "GUEST") {
            token.role = dbUser.role
            token.needsOnboarding = false
          }
        } catch {
          // DB unavailable — keep existing needsOnboarding
        }
      }
      if (!token.needsOnboarding) {
        token.needsOnboarding = token.role === "GUEST"
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.needsOnboarding = token.needsOnboarding as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt" as const,
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

function buildSessionFromToken(token: any) {
  if (!token?.email) return null
  return {
    user: {
      id: token.id as string,
      name: token.name as string,
      email: token.email as string,
      image: token.picture as string,
      role: token.role as string,
      needsOnboarding: (token.role as string) === "GUEST",
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function auth(req?: NextRequest) {
  try {
    const cookieStore: { name: string; value: string }[] = []

    if (req) {
      for (const c of req.cookies.getAll()) cookieStore.push(c)
    } else {
      try {
        const session = await getServerSession(authOptions)
        if (session?.user) return session
      } catch {}
      const store = await cookies()
      for (const c of store.getAll()) cookieStore.push(c)
    }

    const cookiesObj: Record<string, string> = {}
    for (const c of cookieStore) cookiesObj[c.name] = c.value

    const raw = cookiesObj["__Secure-next-auth.session-token"] || cookiesObj["next-auth.session-token"]
    if (!raw) return null

    const token = await getToken({
      req: { cookies: cookiesObj } as any,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: cookiesObj["__Secure-next-auth.session-token"] ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    })
    return buildSessionFromToken(token)
  } catch {
    return null
  }
}

export async function getAuthUser() {
  try {
    const session = await auth()
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }
    }
    return null
  } catch {
    return null
  }
}
