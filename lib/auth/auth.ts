import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "../db"
import md5 from "md5"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: any): Promise<any> => {
        if (!credentials?.username || !credentials?.password) return false
        try {
          const user = await db.account.findUnique({
            where: {
              userName: credentials.username,
              password: md5(credentials.password),
            },
          })
          if (!user) return false

          return {
            id: user.id,
            name: user.name,
            role: user.role, // Add role property to the user object returned
          }
        } catch (error) {
          // handle error
          console.error("Authorization error:", error)
        }
        return false
      },
    }),
  ],
  logger: {
    error: (error) => {
      if (error.name === "CredentialsSignin") return
      console.log(error)
    },
    warn: () => {},
    debug: () => {},
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user exists, add the user ID and role to the token
      if (user) {
        token.id = user.id
        token.role = user.role // Store role in the token
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID and role from the token to the session
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string // Add role to the session
      }
      return session
    },
  },
})
