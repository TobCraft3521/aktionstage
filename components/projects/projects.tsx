// "use client"
import React, { useEffect, useMemo, useState } from "react"
import { useAppState } from "@/hooks/use-app-state" // Update the path as per your project structure
import { queryProjects } from "@/lib/actions/queries/projects"
import { Account, Project } from "@prisma/client"
import Loader from "../global/loader"
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion"
import Link from "next/link"

import styles from "./project/styles.module.css"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import ProjectComp from "./project/project"

const ProjectsComp = ({ id }: { id?: string }) => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<
    Partial<Project & { teachers: Account[] }>[]
  >([
    // {
    //   name: "Projekt 1",
    //   description: "Beschreibung 1",
    // },
  ])
  const controls = useDragControls()
  const appState = useAppState() // Make sure to import useAppState from the correct path
  const [filtering, setFiltering] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const fetchData = async () => {
      setProjects(await queryProjects())
      setLoading(false)
    }
    fetchData()
  }, [])

  const searchedProjects = useMemo(() => {
    setFiltering(true)
    const filtered = projects.filter(
      (project) =>
        (project.name
          ?.toLowerCase()
          .includes(appState.search?.query?.toLowerCase() || "") ||
          project.description
            ?.toLowerCase()
            .includes(appState.search?.query?.toLowerCase() || "")) &&
        (!appState.search.day || appState.search.day === project.day) &&
        (!appState.search.grade ||
          (appState.search.grade >= (project.minGrade || 5) &&
            appState.search.grade <= (project.maxGrade || 11)))
    )
    setFiltering(false)
    return filtered
  }, [projects, appState.search])

  const noProjectsFound =
    !loading &&
    !filtering &&
    searchedProjects.length === 0 &&
    projects.length > 0

  let swipeDismissDistance = 0 // Default value for SSR

  if (typeof window !== "undefined") {
    swipeDismissDistance = (10 * window.innerHeight) / 100 // Calculate the swipe dismiss distance in pixels
  }
  const y = useMotionValue(0)
  const scale = useTransform(
    y,
    [-swipeDismissDistance, 0, swipeDismissDistance],
    [0.2, 1, 0.2]
  )
  return (
    <div className="flex flex-col flex-1">
      {loading || filtering ? (
        <div className="absolute top-0 bottom-0 w-screen h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-1">
          {searchedProjects.length > 0 && projects.length > 0 ? (
            <div className="w-full">
              <div className="w-full p-2 rounded-lg mt-6 gap-4 md:gap-8 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {searchedProjects.map((project, i) => (
                  <div className="w-full h-64" key={project.id}>
                    <motion.div
                      className={cn(
                        styles.loadAni,
                        "w-full overflow-hidden flex items-center h-64 justify-center rounded-xl cursor-pointer drop-shadow-lg group relative"
                      )}
                      key={project.id}
                      layoutId={`card-container-${project.id}`}
                      onClick={() => router.push("/projects/" + project.id)}
                      style={{
                        borderRadius: "24px",
                      }}
                      drag={id === project.id ? "y" : false}
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.3}
                      onDragEnd={(event, info) => {
                        if (
                          info.offset.y > swipeDismissDistance ||
                          info.offset.y < -swipeDismissDistance
                        ) {
                          router.push("/projects")
                        }
                      }}
                    >
                      <Image
                        src={project.imageUrl || "/imgs/asg-logo.jpg"}
                        alt={project.name || "kein Bild vorhanden"}
                        width={16 * 64}
                        height={9 * 64}
                        className="relative object-cover w-full h-full transition-all group-hover:brightness-75"
                      />
                      <div className="absolute bottom-[9%] text-white drop-shadow-md text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-4">
                        <motion.h1
                          className="truncate max-w-full mx-auto"
                          layoutId={`title-${project.id}`}
                        >
                          {project.name}
                        </motion.h1>
                        <div className="text-xs font-medium">Teacher</div>
                      </div>
                      <div
                        className="absolute top-full bg-white w-full h-[5000px] z-20 font-thin"
                        style={{
                          filter: "drop-shadow(0 -96px 32px rgb(0 0 0 / 0.7))",
                        }}
                      ></div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            noProjectsFound && (
              <div className="flex-1 flex-col flex items-center justify-center text-lg drop-shadow-xl">
                😜 Nichts gefunden{" "}
                <Link
                  href={"https://www.google.com/search?q=snake"}
                  className="underline"
                >
                  Hier geht&apos;s zu Snake 😉
                </Link>
              </div>
            )
          )}
          <AnimatePresence>
            {id && (
              <div className="">
                <motion.div
                  className="absolute top-0 left-0 right-0 bottom-0 flex items-center overflow-hidden justify-center bg-white shadow-lg z-[100]"
                  layoutId={`card-container-${id}`}
                  drag="y"
                  style={{
                    y,
                    scale,
                    willChange: "transform",
                  }}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.3}
                  onDrag={(event, info) => {
                    if (
                      info.offset.y > swipeDismissDistance ||
                      info.offset.y < -swipeDismissDistance
                    ) {
                      router.push("/projects")
                    }
                  }}
                >
                  <ProjectComp
                    project={
                      projects.find((project) => project.id === id) || {}
                    }
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ProjectsComp
