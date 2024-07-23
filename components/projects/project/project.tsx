import { Project } from "@prisma/client"
import { motion } from "framer-motion"
import Image from "next/image"
interface ProjectCompProps {
  project: Partial<Project>
  borderRadius: any
}
const ProjectComp = ({ project, borderRadius }: ProjectCompProps) => {
  console.log(borderRadius)
  return (
    <>
      <div className="relative h-full w-full" style={{ borderRadius }}>
        <Image
          src={project?.imageUrl || "/imgs/asg-logo.jpg"}
          alt={project?.name || "project-image"}
          width={4400}
          height={2000}
          className="object-cover w-full h-full pointer-events-none"
          style={{ borderRadius }}
        />
        <motion.h2
          className="text-2xl font-bold absolute top-[50%] left-[50%]"
          layoutId={`title-${project.id}`}
        >
          {project?.name}
        </motion.h2>
      </div>
    </>
  )
}

export default ProjectComp
