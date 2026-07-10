import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
      role: string
      needsOnboarding?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    needsOnboarding?: boolean
  }
}
