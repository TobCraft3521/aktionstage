"use client"
import {
  queryInfiniteProjects,
  queryProjects,
} from "@/lib/actions/queries/projects"
import { Account, Project } from "@prisma/client"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { queryTutorialComplete } from "@/lib/actions/queries/tutorials"
import { cn } from "@/lib/utils"
import { DM_Sans } from "next/font/google"
import { useRouter } from "next/navigation"
import Footer from "../global/footer"
import AboutTutorial from "../tutorials/about"
import { Skeleton } from "../ui/skeleton"
import ProjectComp from "./project/project"
import SmallCard from "./project/small"
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query"
import { getRandomNoResultsJoke } from "@/lib/helpers/jokes"
import { Button } from "../ui/button"
import { useSearchState } from "@/stores/use-app-state"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ProjectsComp = ({ id }: { id?: string }) => {
  const searchState = useSearchState()
  const [filtering, setFiltering] = useState(false)
  const [aboutTutorialDone, setAboutTutorialDone] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const fetchData = async () => {
      setAboutTutorialDone(await queryTutorialComplete("about"))
    }
    fetchData()
  }, [])

  const fetchProjects = async ({ pageParam }: { pageParam?: string }) => {
    const data = await queryInfiniteProjects({ pageParam })
    return data
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    status,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["infinite-projects"], // Specific query key
    queryFn: fetchProjects,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })

  // Auto-fetch next page when new data arrives, decrease lcp time
  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  )

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === id),
    [projects, id]
  )

  id && !selectedProject && !isPending && router.push("/projects")

  const [searchedProjects, setSearchedProjects] = useState<Project[]>([])

  useEffect(() => {
    setFiltering(true)
    const filtered = projects.filter(
      (project) =>
        (project.name
          ?.toLowerCase()
          .includes(searchState.search?.query?.toLowerCase() || "") ||
          project.description
            ?.toLowerCase()
            .includes(searchState.search?.query?.toLowerCase() || "")) &&
        (!searchState.search.day || searchState.search.day === project.day) &&
        (!searchState.search.grade ||
          (searchState.search.grade >= (project.minGrade || 5) &&
            searchState.search.grade <= (project.maxGrade || 11))) &&
        (!searchState.search.teacher ||
          project.participants?.some(
            (teacher) =>
              teacher.name.toLowerCase() ===
              searchState.search.teacher?.toLocaleLowerCase()
          ))
    )
    setSearchedProjects(filtered)
    setFiltering(false)
  }, [projects, searchState])

  const noProjectsFound =
    !(status === "pending") &&
    !filtering &&
    searchedProjects.length === 0 &&
    projects.length > 0

  const randomNothingFoundJoke = getRandomNoResultsJoke()

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

  if (isPending)
    return (
      <div className="flex flex-col flex-1">
        <div
          className={cn(
            "w-full sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto text-4xl tracking-tighter font-bold mt-12 text-slate-800 drop-shadow-lg",
            dmSans.className
          )}
        >
          Projekte
        </div>
        <div className="flex-1 w-full p-2 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {new Array(24).fill(0).map((_, i) => (
            <div className="w-full h-64" key={i}>
              <Skeleton className="w-full h-full rounded-[24px] bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  if (status && status === "error") return <p>Fehler: {error?.message}</p>
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-1 flex-col">
        {searchedProjects.length > 0 && projects.length > 0 ? (
          <div className="w-full">
            <div className="w-full sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto text-4xl drop-shadow-lg font-bold mt-12">
              <h1
                className={cn(
                  "tracking-tighter text-slate-800",
                  dmSans.className
                )}
              >
                Projekte
              </h1>
            </div>
            <div className="w-full p-2 mb-16 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {!aboutTutorialDone && <AboutTutorial />}

              {searchedProjects.map((project, i) => (
                <div className="w-full h-64" key={project.id}>
                  <SmallCard project={project} index={i} />
                </div>
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center font-bold text-slate-800 mb-16">
                Läd mehr Projekte...
              </div>
            )}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex-col mb-16 flex items-center justify-center text-lg drop-shadow-xl min-h-[40vh] gap-4">
            <div className="text-7xl">🫗</div>
            Nichts im Angebot für dich...
          </div>
        ) : (
          noProjectsFound && (
            <div className="flex-1 flex-col mb-16 flex items-center justify-center text-lg min-h-[40vh] gap-4">
              <div className="flex-col drop-shadow-xl flex items-center justify-center gap-4">
                <div className="text-7xl">{randomNothingFoundJoke.emoji}</div>
                <div className="flex flex-col items-center">
                  {randomNothingFoundJoke.text}
                  <div className="flex flex-col items-end w-full text-slate-500">
                    -ChatGPT
                  </div>
                  {/* <Link
                  href={"https://www.google.com/search?q=snake"}
                  className="underline"
                  >
                  Hier geht&apos;s zu Snake 😉
                  </Link> */}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  searchState.setSearch({})
                }}
              >
                Zurücksetzen
              </Button>
            </div>
          )
        )}
        {/* todo: put motion.div in a separate component */}
        <AnimatePresence>
          {id && selectedProject && (
            <div className="">
              <motion.div
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center overflow-hidden justify-center bg-white shadow-lg z-[120]"
                layoutId={`card-container-${id}`}
                style={{
                  y,
                  scale,
                  willChange: "transform",
                  borderRadius,
                }}
                // reduced motion: enable this and add transition-all and remove layoutId
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1 }}
                // exit={{
                //   opacity: 0,
                // }}
                drag={
                  typeof window !== "undefined" && window.innerWidth > 768
                    ? "y"
                    : false
                }
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
                <ProjectComp project={selectedProject} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

export default ProjectsComp
