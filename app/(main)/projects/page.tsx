import Header from "@/components/header/header"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const Projects = async () => {
  const user = (await auth())?.user
  if (!user) return redirect("/login")
  return (
    <div className="">
      <Header variant="main" />
    </div>
  )
}

export default Projects
