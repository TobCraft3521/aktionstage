"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useAppState } from "@/hooks/use-app-state" // Update the path as per your project structure
import { queryProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import Loader from "../global/loader"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion"
import Link from "next/link"

import styles from "./project/styles.module.css"
import { cn } from "@/lib/utils"
import Image from "next/image"

const ProjectsComp = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Partial<Project>[]>([])
  const appState = useAppState() // Make sure to import useAppState from the correct path
  const [filtering, setFiltering] = useState(false)
  const [selectedProject, setSelectedProject] =
    useState<Partial<Project> | null>()

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

  // Check if projects are still loading or being filtered
  const noProjectsFound =
    !loading &&
    !filtering &&
    searchedProjects.length === 0 &&
    projects.length > 0

  const y = useMotionValue(0)
  const scale = useTransform(y, [-200, 0, 200], [0.5, 1, 0.5])

  return (
    <div className="flex flex-col flex-1">
      {loading || filtering ? (
        <div className="flex items-center justify-center flex-1">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-1">
          {searchedProjects.length > 0 && projects.length > 0 ? (
            <div className="w-full">
              <div className="w-full p-2 rounded-lg mt-6 gap-6 px-8 xl:px-0 lg:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {searchedProjects.map((project, i) => (
                  <div className="w-full h-64" key={project.id}>
                    <motion.div
                      className={cn(
                        styles.loadAni,
                        "w-full overflow-hidden flex items-center h-64 justify-center rounded-xl cursor-pointer shadow-lg group relative"
                      )}
                      key={project.id}
                      layoutId={`card-container-${project.id}`}
                      onClick={() => setSelectedProject(project)}
                      style={{
                        animationDelay: `${i * 35}ms`,
                      }}
                    >
                      <Image
                        src={project.imageUrl || "/imgs/asg-logo.jpg"}
                        alt={project.name || "kein Bild vorhanden"}
                        width={16 * 20}
                        height={9 * 20}
                        className="relative object-cover w-full h-full transition-all group-hover:brightness-75"
                      />
                      <div className="absolute bottom-[9%] text-white drop-shadow-md text-xl z-30 font-semibold w-full px-2 flex flex-col items-center leading-4">
                        <motion.p
                          className="truncate max-w-full mx-auto"
                          layoutId={`title-${project.id}`}
                        >
                          {project.name}
                        </motion.p>
                        <div className="text-base font-medium">Teacher</div>
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
            // Show message only if no projects were found and initial fetch is completed
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
            {selectedProject && (
              <div className="">
                <motion.div
                  className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white rounded-lg shadow-lg p-8 z-30"
                  layoutId={`card-container-${selectedProject.id}`}
                  onClick={() => setSelectedProject(null)}
                  drag="y"
                  style={{ y, scale }}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDrag={(event, info) => {
                    if (info.offset.y > 200 || info.offset.y < -200) {
                      setSelectedProject(null)
                    }
                  }}
                >
                  <motion.h2
                    className="text-2xl font-bold"
                    layoutId={`title-${selectedProject.id}`}
                  >
                    {selectedProject.name}
                  </motion.h2>
                  <motion.p layoutId={`description-${selectedProject.id}`}>
                    {selectedProject.description}
                  </motion.p>
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
