import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "../db"
import md5 from "md5"
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "Username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials: any) => {
        if (!credentials?.username || !credentials?.password) return null
        const user = await db.account.findUnique({
          where: {
            userName: credentials.username,
            password: md5(credentials.password),
          },
        })
        if (!user) return null
        return {
          id: user.id, // Example ID, adjust as necessary
          name: user.name,
        }
      },
    }),
  ],
})
