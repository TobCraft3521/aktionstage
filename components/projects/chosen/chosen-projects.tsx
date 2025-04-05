"use client"
import { AnimatePresence } from "motion/react"
import { useMemo } from "react"

import { cn } from "@/lib/utils"
import { useSearchState } from "@/stores/use-app-state"
import { DM_Sans } from "next/font/google"
import { useRouter } from "next/navigation"
import Footer from "../../global/footer"
import { AboutTutorial } from "../../tutorials/about"
import { Button } from "../../ui/button"
import { Skeleton } from "../../ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { queryChosenProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import SmallCard from "../project/small"
import ProjectComp from "../project/project"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ChosenProjects = ({ id }: { id?: string }) => {
  const router = useRouter()

  // Query projects
  const {
    data: projects,
    isPending,
    error,
  } = useQuery({
    queryKey: ["chosen-projects"],
    queryFn: async () => {
      const res = (await queryChosenProjects()) as
        | { error: boolean }
        | Project[]
      if ("error" in res && res.error) {
        throw new Error("Fehler beim Laden der Projekte")
      }
      if (Array.isArray(res)) return res
    },
  })

  const selectedProject = useMemo(
    () =>
      Array.isArray(projects)
        ? projects.find((project) => project.id === id)
        : undefined,
    [projects, id]
  )

  id && !selectedProject && !isPending && router.push("/chosen")

  if (error)
    return (
      <div className="">
        <h1>Meep! Irgentein Fehler 🙄</h1>
        <a href="mailto:tobias@tobcraft.xyz" className="">
          tobias@tobcraft.xyz
        </a>{" "}
        Bitte mir schreiben...
      </div>
    )

  if (isPending || !projects)
    return (
      <div className="flex flex-col flex-1">
        <div
          className={cn(
            "w-full sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto text-4xl tracking-tighter font-bold mt-12 text-slate-800 drop-shadow-lg",
            dmSans.className
          )}
        >
          Deine Projekte
        </div>
        <div className="flex-1 w-full p-2 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {new Array(3).fill(0).map((_, i) => (
            <div className="w-full h-56 md:h-64" key={i}>
              <Skeleton className="w-full h-full rounded-[24px] bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-1 flex-col">
        {projects.length > 0 && projects.length > 0 ? (
          <div className="w-full">
            <div className="w-full sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto text-4xl drop-shadow-lg font-bold mt-12">
              <h1
                className={cn(
                  "tracking-tighter text-slate-800 ml-4 md:ml-0",
                  dmSans.className
                )}
              >
                Deine Projekte
              </h1>
            </div>
            <div className="w-full p-2 mb-16 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              <AboutTutorial />

              {projects.map((project, i) => (
                <div className="w-full h-[60vw] sm:h-64" key={project.id}>
                  <SmallCard
                    project={project}
                    index={i}
                    routePrefix="/chosen/"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          projects.length === 0 && (
            <div className="flex-1 flex-col mb-16 flex items-center justify-center text-lg drop-shadow-xl min-h-[40vh] gap-4">
              <div className="text-7xl">🫗</div>
              Nichts im Angebot für dich...
            </div>
          )
        )}
        {/* todo: put motion.div in a separate component */}
        <AnimatePresence>
          {id && selectedProject && (
            <div className="">
              <ProjectComp project={selectedProject} routePrefix="/chosen/" />
            </div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

export default ChosenProjects
