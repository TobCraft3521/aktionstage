"use client"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Home() {
  const user = useSession().data?.user
  // const router = useRouter()
  // const login = async () => {
  //   const response = await signIn("credentials", {
  //     username: "Tobias.Hackenberg",
  //     password: "test",
  //     redirect: false,
  //   })
  //   if (response?.ok) {
  //     window.location.reload()
  //   } else {
  //     console.log("error")
  //   }
  // }
  // const logout = () => {
  //   signOut()
  // }
  if (user) return redirect("/projects")
  return redirect("/login")
}
