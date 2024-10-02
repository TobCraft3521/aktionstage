"use client"
import Header from "@/components/header/header"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppState } from "@/hooks/use-app-state"
import { queryProjects } from "@/lib/actions/queries/projects"
import { Project } from "@prisma/client"
import { useParams } from "next/navigation"
import { useEffect } from "react"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const id = useParams().id as string
  const appState = useAppState()
  // useEffect(() => {
  //   const preload = async () => {
  //     const projects = await queryProjects()

  //     projects.forEach((project: Partial<Project>) => {
  //       const link = document.createElement("link")
  //       link.rel = "preload"
  //       link.as = "image"
  //       link.href = project.imageUrl || "/imgs/asg-logo.jpg"
  //       document.head.appendChild(link)
  //     })
  //   }
  //   preload()
  // }, [])
  return (
    <ScrollArea className="flex h-screen" id="projects-scroll">
      <Header variant="main" />
      <ProjectsHeader />
      <ProjectsComp id={id} />
      {children}
    </ScrollArea>
  )
}

export default Layout
