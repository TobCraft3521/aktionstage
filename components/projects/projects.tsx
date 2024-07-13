"use client"

import { queryProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import Image from "next/image"
import { cache, memo, useEffect, useMemo, useState } from "react"
import { Skeleton } from "../ui/skeleton"
import { Separator } from "../ui/separator"
import styles from "./project/styles.module.css"
import { cn } from "@/lib/utils"
import { useAppState } from "@/hooks/use-app-state"
import Loader from "../global/loader"
import { ExpandableCard } from "./project/expandable-card"

const ProjectsComp = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Partial<Project>[]>([])
  const appState = useAppState()
  useEffect(() => {
    const fetchData = async () => {
      setProjects(await queryProjects())
    }
    fetchData()
    setLoading(false)
  }, [])
  const searchedProjects = useMemo(
    () =>
      projects.filter(
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
      ),
    [projects, appState.search]
  )
  return (
    <div className="flex flex-col flex-1">
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader />
        </div>
      ) : (
        <div className="w-full p-2 rounded-lg mt-6 gap-4 px-8 xl:px-0 lg:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {searchedProjects.length > 0 ? (
            <>
              {searchedProjects.map((project, i) => (
                <ExpandableCard
                  animationId={project.id || Math.random().toString()}
                  key={project.id}
                  i={i}
                  project={project}
                />
              ))}
            </>
          ) : (
            <></>
          )}
          <div />
        </div>
      )}
    </div>
  )
}

export default ProjectsComp
