"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { redirect, useRouter } from "next/navigation"

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
  if(user) return redirect("/projects")
  return redirect("/login")
}
