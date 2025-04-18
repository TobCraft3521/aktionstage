"use client"
import { Countdown } from "@/components/global/countdown"
import Header from "@/components/header/header"
import ChosenProjects from "@/components/projects/chosen/chosen-projects"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const id = useParams().id as string

  return (
    <ScrollArea className="flex h-screen relative">
      <Countdown />
      <Header variant="main" />
      <ChosenProjects id={id} />
    </ScrollArea>
  )
}

export default Layout
