"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useAppState } from "@/hooks/use-app-state" // Update the path as per your project structure
import { queryProjects } from "@/lib/actions/queries/projects"
import { Account, Project, TutorialState } from "@prisma/client"
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
import SmallCard from "./project/small"
import { Skeleton } from "../ui/skeleton"
import Footer from "../global/footer"
import { queryTutorialState } from "@/lib/actions/queries/tutorials"

const ProjectsComp = ({ id }: { id?: string }) => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<
    Partial<Project & { teachers: Account[] }>[]
  >([
    // {
    //   name: "Projekt 1",
    //   description: "Beschreibung 1",
    //   id: "sdjf",
    //   studentsCount: 3,
    //   studentsMax: 8,
    // },
    // {
    //   name: "Projekt 2",
    //   description: "Beschreibung 1",
    //   id: "sdj22f",
    //   studentsCount: 3,
    //   studentsMax: 8,
    // },
    // {
    //   name: "Projekt 3",
    //   description: "Beschreibung 1",
    //   id: "s44djf",
    //   studentsCount: 3,
    //   studentsMax: 8,
    // },
  ])
  const appState = useAppState() // Make sure to import useAppState from the correct path
  const [filtering, setFiltering] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const fetchData = async () => {
      setProjects(await queryProjects())
      setProjectsTutorialState(await queryTutorialState())
      setLoading(false)
    }
    fetchData()
  }, [])

  const [projectsTutorialState, setProjectsTutorialState] = useState<
    TutorialState | undefined
  >()

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
    swipeDismissDistance = window.innerHeight / 8 // Calculate the swipe dismiss distance in pixels
  }
  const y = useMotionValue(0)
  const scale = useTransform(
    y,
    [-swipeDismissDistance, 0, swipeDismissDistance],
    [0.2, 1, 0.2]
  )
  const borderRadius = useTransform(
    y,
    [-swipeDismissDistance, 0, swipeDismissDistance],
    [96, 0, 96]
  )
  return (
    <div className="flex flex-col flex-1">
      {loading || filtering ? (
        // <div className="absolute top-0 bottom-0 w-screen h-screen flex items-center justify-center">
        //   <Loader />
        // </div>
        <div className="flex-1 w-full p-2 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {new Array(24).fill(0).map((_, i) => (
            <div className="w-full h-64" key={i}>
              <Skeleton className="w-full h-full rounded-[24px] bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {searchedProjects.length > 0 && projects.length > 0 ? (
            <div className="w-full">
              <div className="w-full sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto text-4xl drop-shadow-lg font-semibold mt-12">
                <h1 className="ml-8">Projekte</h1>
              </div>
              <div className="w-full p-2 mb-16 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                <div className="relative p-6 bg-white rounded-3xl shadow-2xl flex flex-col justify-between h-full">
                  {/* Light Bulb Emoji */}
                  <span
                    className="absolute text-5xl"
                    style={{ top: "-20px", right: "-20px" }}
                  >
                    💡
                  </span>

                  {/* Card Content */}
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 drop-shadow-md mb-4">
                    {/* Gradient text highlighter */}
                    Über die
                    <span className="relative inline-block ml-2">
                      <span className="absolute inset-0 -skew-x-3 bg-gradient-to-r from-purple-500 to-pink-500 transform -rotate-1"></span>
                      <span className="relative text-white px-1">
                        Aktionstage
                      </span>
                    </span>
                  </h2>

                  {/* Buttons */}
                  <div className="flex flex-col space-y-2 mt-auto">
                    <button className="px-4 py-1.5 border border-slate-500 text-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50">
                      Fertig
                    </button>
                    <button className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50">
                      Mehr
                    </button>
                  </div>
                </div>

                {searchedProjects.map((project, i) => (
                  <div className="w-full h-64" key={project.id}>
                    <SmallCard project={project} index={i} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            noProjectsFound && (
              <div className="flex-1 flex-col mb-16 flex items-center justify-center text-lg drop-shadow-xl min-h-[40vh]">
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
          {/* todo: put motion.div in a separate component */}
          <AnimatePresence>
            {id && (
              <div className="">
                <motion.div
                  className="absolute top-0 left-0 right-0 bottom-0 flex items-center overflow-hidden justify-center bg-white shadow-lg z-[100]"
                  layoutId={`card-container-${id}`}
                  style={{
                    y,
                    scale,
                    willChange: "transform",
                    borderRadius,
                  }}
                  drag={"y"}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
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
      <Footer />
    </div>
  )
}

export default ProjectsComp
