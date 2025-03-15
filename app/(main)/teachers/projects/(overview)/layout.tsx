"use client"
import Header from "@/components/header/header"
import TeachersSidebar from "@/components/teachers/teachers-sidebar"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { Account, Project } from "@prisma/client"
import { AnimatePresence } from "motion/react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import { useEffect, useState } from "react"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

type Props = {
  children: React.ReactNode
}

type ProjectWithTeachers = Project & { teachers: Account[] }

const Teachers = ({ children }: Props) => {
  const id = useSession().data?.user?.id
  const [ownProjects, setOwnProjects] = useState<
    ProjectWithTeachers[] | undefined
  >()
  useEffect(() => {
    const fetchOwnProjects = async () => {
      const projects = await queryOwnProjects()
      setOwnProjects(projects)
    }
    fetchOwnProjects()
  }, [])
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <div className="flex flex-1 min-h-0">
        <div className="block">
          <TeachersSidebar />
        </div>
        <div className="flex-1 bg-slate-100 rounded-xl m-2 ml-0 relative overflow-hidden">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Teachers
