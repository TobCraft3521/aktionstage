import Header from "@/components/header/header"
import ProjectsHeader from "@/components/projects/projects-header"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const Projects = async () => {
  const user = (await auth())?.user
  if (!user) return redirect("/login")
  return (
    <div className="">
      <Header variant="main" />
      <ProjectsHeader />
      <div className="h-[500vh]"></div>
    </div>
  )
}

export default Projects
