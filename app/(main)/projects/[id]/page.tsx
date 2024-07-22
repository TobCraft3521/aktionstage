"use client"
import Header from "@/components/header/header"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { auth } from "@/lib/auth/auth"
import { getSession } from "next-auth/react"
import { redirect, useParams } from "next/navigation"
import { useEffect, useState } from "react"

const Projects = () => {
  const [user, setUser] = useState<any | null>(null)
  const id = useParams().id as string

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession()
      setUser(session && session.user ? session.user : null)
    }

    fetchUser()
  }, [])
  if (!user) return redirect("/login")
  return <></>
}

export default Projects
