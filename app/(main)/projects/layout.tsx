"use client"
import Header from "@/components/header/header"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"

const Layout = () => {
  const id = useParams().id as string
  return (
    <ScrollArea className="flex flex-1 h-screen">
      <Header variant="main" />
      <ProjectsHeader />
      <ProjectsComp id={id} />
    </ScrollArea>
  )
}

export default Layout
