"use client"

import { queryProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Skeleton } from "../ui/skeleton"
import { Separator } from "../ui/separator"

const ProjectsComp = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Partial<Project>[]>([])
  useEffect(() => {
    const fetchData = async () => {
      setProjects(await queryProjects())
    }
    fetchData()
    setLoading(false)
  }, [])
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full p-2 rounded-lg mt-6 gap-6 lg:max-w-[80vw] mx-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {loading ? (
          <>
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 p-4">
                <Skeleton className="w-full h-32 bg-slate-200" />
                <Skeleton className="w-1/2 h-4 bg-slate-200" />
                <Skeleton className="w-1/3 h-4 bg-slate-100" />
              </div>
            ))}
          </>
        ) : (
          <>
            {projects.map((project, i) => (
              <div
                className="relative w-full overflow-hidden flex items-center h-60 justify-center rounded-xl cursor-pointer"
                key={i}
              >
                <Image
                  src={project.imageUrl || "/imgs/asg-logo.jpg"}
                  alt={project.name || "kein Bild vorhanden"}
                  width={16 * 20}
                  height={9 * 20}
                  className="relative object-cover w-full h-full transition-all"
                />
                <div className="absolute top-[9%] text-white drop-shadow-md text-xl z-30 font-semibold w-full px-2 flex flex-col items-center leading-4">
                  <div className="truncate max-w-full mx-auto">{project.name}</div>
                  <div className="text-base font-medium">Teacher</div>
                </div>
                <div
                  className="absolute -top-[5000px] bg-white w-full h-[5000px] z-20 font-thin"
                  style={{
                    filter: "drop-shadow(0 25px 25px rgb(0 0 0 / 0.6))",
                  }}
                ></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectsComp
