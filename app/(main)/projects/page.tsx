import Header from "@/components/header/header"
import ProjectsComp from "@/components/projects/projects"
import ProjectsHeader from "@/components/projects/projects-header"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const Projects = async () => {
  const user = (await auth())?.user
  if (!user) return redirect("/login")
  return (
    <div className="flex flex-col flex-1">
      <Header variant="main" />
      <ProjectsHeader />
      <ProjectsComp />
    </div>
  )
}

export default Projects
