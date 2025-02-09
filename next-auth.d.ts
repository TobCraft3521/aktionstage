// next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      role: string // Add role here
      grade: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name: string
    role: string // Add role here
    grade: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string // Add role here
    grade: string | null
  }
}
