"use client"
import Header from "@/components/header/header"
import TeachersSidebar from "@/components/teachers/teachers-sidebar"
import { queryTeachersProjects } from "@/lib/actions/queries/projects"
import { ProjectWithParticipants } from "@/lib/types"
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

const Teachers = ({ children }: Props) => {
  const id = useSession().data?.user?.id
  const [projects, setProjects] = useState<
    ProjectWithParticipants[] | undefined
  >()
  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await queryTeachersProjects()
      setProjects(fetchedProjects)
    }
    fetchProjects()
  }, [])
  return (
    <div className="flex flex-col h-screen">
      <Header variant="main" />
      <div className="flex flex-1 min-h-0">
        <div className="block">
          <TeachersSidebar />
        </div>
        <div className="flex-1 bg-slate-100 dark:bg-accent rounded-xl m-2 ml-0 relative overflow-hidden">
          <AnimatePresence>{children}</AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Teachers
