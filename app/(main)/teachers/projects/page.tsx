"use client"
import CreateProjectCard from "@/components/teachers/ownproject-card/create"
import OwnProjectCard from "@/components/teachers/ownproject-card/ownproject-card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryUser } from "@/lib/actions/queries/accounts"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { auth } from "@/lib/auth/auth"
import { Account, Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

type Props = {}

const OwnProjects = (props: Props) => {
  const id = useSession().data?.user?.id
  const { data: ownProjects, isLoading } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryOwnProjects(), // Fetch projects from the API
  })

  return (
    <div className="relative h-full w-full flex-1">
      <div className="absolute top-0 left-0 h-[30vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]"></div>
      <div className="relative p-16 flex flex-row gap-6 flex-wrap">
        {!ownProjects &&
          new Array(3).fill(0).map((a, i) => (
            <Skeleton
              className="w-56 h-[128px] bg-slate-100 rounded-lg shadow-lg"
              key={i}
            >
              <Skeleton className="w-16 ml-2 mt-4 h-4 bg-slate-200" />
              <Skeleton className="w-32 ml-2 mt-2 h-4 bg-slate-200" />
            </Skeleton>
          ))}
        {ownProjects?.map((project) => (
          <OwnProjectCard
            key={project.id}
            id={project.id}
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
