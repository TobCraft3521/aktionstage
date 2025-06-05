"use client"
import CreateProjectCard from "@/components/teachers/ownproject-card/create"
import OwnProjectCard from "@/components/teachers/ownproject-card/ownproject-card"
import { Skeleton } from "@/components/ui/skeleton"
import { queryTeachersProjects } from "@/lib/actions/queries/projects"
import { getAktionstageDays } from "@/lib/config/days"
import { ProjectWithParticipants } from "@/lib/types"
import { Role } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

type Props = {}

const TeacherProjects = (props: Props) => {
  const id = useSession().data?.user?.id
  const { data: projects, isLoading } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryTeachersProjects(), // Fetch projects from the API
  })

  return (
    <div className="relative h-full w-full flex-1">
      <div className="absolute top-0 left-0 h-[25vh] w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:bg-none dark:border-zinc-800 dark:bg-background"></div>
      <div className="relative p-16 flex flex-row gap-6 flex-wrap">
        {!projects &&
          new Array(3).fill(0).map((a, i) => (
            <Skeleton
              className="w-56 h-[128px] bg-slate-100 rounded-lg shadow-lg dark:bg-accent"
              key={i}
            >
              <Skeleton className="w-16 ml-2 mt-4 h-4 bg-slate-200 dark:bg-background" />
              <Skeleton className="w-32 ml-2 mt-2 h-4 bg-slate-200 dark:bg-background" />
            </Skeleton>
          ))}
        {projects?.map((project: ProjectWithParticipants) => (
          <OwnProjectCard
            key={project.id}
            id={project.id}
            title={project.name}
            imageUrl={project.imageUrl}
            day={project.day}
            teachers={project.participants
              .filter(
                // Filter out the current user
                (teacher) =>
                  teacher.id !== id &&
                  (teacher.role === Role.TEACHER || teacher.role === Role.ADMIN)
              )
              .map((teacher) => teacher.name)
              .join(", ")}
          />
        ))}
<<<<<<< HEAD
<<<<<<< Updated upstream
        {(projects?.length || 3) < 3 && <CreateProjectCard />}
=======
        {(projects?.length || 0) < getAktionstageDays().length && (
          <CreateProjectCard />
        )}
>>>>>>> Stashed changes
=======
        {(projects?.length || 0) < 3 && <CreateProjectCard />}
>>>>>>> 00ec37fdb56f261eb8e7d0619de3cb75620bc374
      </div>
    </div>
  )
}

export default TeacherProjects
