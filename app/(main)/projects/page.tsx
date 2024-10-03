import FeatureTutorial from "@/components/tutorials/features"
import FeaturesTutorial from "@/components/tutorials/features"
import { queryTutorialComplete } from "@/lib/actions/queries/tutorials"
import { auth } from "@/lib/auth/auth"
import { Tutorial } from "@prisma/client"
import { redirect } from "next/navigation"

const Projects = async () => {
  const user = (await auth())?.user
  if (!user) return redirect("/login")
  const showFeaturesTutorial = !(await queryTutorialComplete(Tutorial.FEATURES))

  return <FeatureTutorial show={showFeaturesTutorial} />
}

export default Projects
