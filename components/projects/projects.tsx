"use client"
import { queryInfiniteProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import { AnimatePresence } from "motion/react"
import { useEffect, useMemo, useState } from "react"

import { getRandomNoResultsJoke } from "@/lib/helpers/jokes"
import { cn } from "@/lib/utils"
import { useSearchState } from "@/stores/use-app-state"
import { useInfiniteQuery } from "@tanstack/react-query"
import { DM_Sans } from "next/font/google"
import { useRouter } from "next/navigation"
import Footer from "../global/footer"
import { AboutTutorial } from "../tutorials/about"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import ProjectComp from "./project/project"
import SmallCard from "./project/small"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ProjectsComp = ({ id }: { id?: string }) => {
  const searchState = useSearchState()
  const [filtering, setFiltering] = useState(false)
  const router = useRouter()

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

  if (isPending)
    return (
      <div className="flex flex-col flex-1">
        <div className="w-full sm:max-w-2xl md:max-w-5xl lg:max-w-4xl xl:max-w-6xl mx-auto text-4xl drop-shadow-lg font-bold mt-12 px-6 sm:px-0">
          <h1
            className={cn(
              "tracking-tighter text-slate-800 dark:text-primary",
              dmSans.className
            )}
          >
            Projekte
          </h1>
        </div>
        <div className="flex-1 w-full p-2 mt-6 gap-4 md:gap-10 px-4 md:px-8 sm:max-w-2xl md:max-w-5xl xl:px-0 lg:max-w-5xl xl:max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {new Array(24).fill(0).map((_, i) => (
            <div className="w-full h-56 md:h-64" key={i}>
              <Skeleton className="w-full h-full rounded-[24px] bg-slate-200 dark:bg-neutral-800" />
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
            <div className="w-full sm:max-w-2xl md:max-w-5xl lg:max-w-4xl xl:max-w-6xl mx-auto text-4xl drop-shadow-lg font-bold mt-12 px-6 sm:px-0">
              <h1
                className={cn(
                  "tracking-tighter text-slate-800 dark:text-primary",
                  dmSans.className
                )}
              >
                Projekte
              </h1>
            </div>
            <div className="w-full mt-8 mb-16 sm:mb-32 px-6 sm:px-0 sm:max-w-2xl md:max-w-5xl lg:max-w-4xl xl:max-w-6xl mx-auto gap-4 md:gap-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              <AboutTutorial />

              {searchedProjects.map((project, i) => (
                <div className="w-full h-[60vw] sm:h-64" key={project.id}>
                  <SmallCard project={project} index={i} />
                </div>
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center font-bold text-slate-800 mb-16 dark:text-foreground drop-shadow-lg">
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
              <div className="flex-col drop-shadow-xl flex items-center justify-center gap-4 px-8">
                <div className="text-7xl">{randomNothingFoundJoke.emoji}</div>
                <div className="flex flex-col items-center">
                  {randomNothingFoundJoke.text}
                  <div className="flex flex-col items-end w-full text-slate-500 dark:text-neutral-400">
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
              <ProjectComp project={selectedProject} />
            </div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

export default ProjectsComp
