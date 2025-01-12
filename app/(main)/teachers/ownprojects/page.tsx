"use client"
import CreateProjectCard from "@/components/teachers/ownproject-card/create"
import OwnProjectCard from "@/components/teachers/ownproject-card/ownproject-card"
import { queryUser } from "@/lib/actions/queries/accounts"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { auth } from "@/lib/auth/auth"
import { Account, Project } from "@prisma/client"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import { useEffect, useState } from "react"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

type ProjectWithTeachers = Project & { teachers: Account[] }

const OwnProjects = () => {
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
    <div className="relative h-full w-full flex-1">
      <div className="absolute top-0 left-0 h-[30vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]"></div>
      <div className="relative p-16 flex flex-row gap-6 flex-wrap">
        {ownProjects?.map((project) => (
          <OwnProjectCard
            key={project.id}
            title={project.name}
            imageUrl={project.imageUrl}
            day={project.day}
            teachers={project.teachers
              .filter(
                // Filter out the current user
                (teacher) => teacher.id !== id
              )
              .map((teacher) => teacher.name)
              .join(", ")}
          />
        ))}
        <CreateProjectCard />
      </div>
    </div>
  )
}

export default OwnProjects
