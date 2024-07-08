import { db } from "@/lib/db"
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import md5 from "md5"
export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: {
          label: "Password",
          type: "password",
        },
      },

      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) return null
        const user = await db.account.findUnique({
          where: {
            name_password: {
              name: credentials.username,
              password: md5(credentials.password),
            },
          },
        })
        if (!user) return null
        return {
          id: user.id, // Example ID, adjust as necessary
          name: user.name,
        }
      },
    }),
    // ...add more providers here
  ],
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
