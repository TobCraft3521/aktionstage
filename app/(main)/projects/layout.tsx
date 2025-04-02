"use client"
import { Countdown } from "@/components/global/countdown"
import Header from "@/components/header/header"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const id = useParams().id as string

  return (
    <ScrollArea className="flex h-screen relative" id="projects-scroll">
      {/* <div className="w-full h-8 bg-gradient-to-r from-lime-500 to-green-500 flex flex-row justify-center items-center font-semibold text-sm text-white">
        Es geht los 🎉
      </div> */}
      {/* <div className="w-full h-8 bg-gradient-to-r from-yellow-500 to-amber-500 flex flex-row justify-center items-center font-semibold text-sm text-white">
        Noch 53 Minuten
      </div> */}
      <Countdown />
      <Header variant="main" />
      <ProjectsHeader />
      <ProjectsComp id={id} />
      {/* {children} */}
    </ScrollArea>
  )
}

export default Layout
