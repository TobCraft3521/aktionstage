"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Project } from "@prisma/client"
import { cn } from "@/lib/utils"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const SmallCard = ({
  project = {
    id: "1",
    name: "Test Project",
    imageUrl: "/imgs/asg-logo.jpg",
    location: "School",
    day: "MON",
  },
  index,
}: {
  project: Partial<Project>
  index: number
}) => {
  const router = useRouter()

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center h-64 w-48 m-16 shadow-2xl rounded-xl cursor-pointer bg-white overflow-hidden group"
      )}
      key={project.id}
      layoutId={`card-container-${project.id}`}
      onClick={() => {
        router.push("/projects/" + project.id)
      }}
      style={{
        borderRadius: "24px",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Background Image */}
      <Image
        src={project?.imageUrl || "/imgs/asg-logo.jpg"}
        alt={project?.name || "project-image"}
        width={512}
        height={512}
        blurDataURL={project?.imageUrl || "/imgs/asg-logo.jpg"}
        className="brightness transition-all duration-300 w-full h-full object-cover pointer-events-none group-hover:brightness-75"
        priority
        placeholder="blur"
      />

      {/* Main Content */}
      <div className="flex flex-col items-center w-full px-4 pt-4 pb-2 space-y-1 bg-gradient-to-t from-black/40 to-transparent">
        <motion.h1
          className={cn(
            "truncate text-white text-lg font-bold mb-4",
            dmSans.className
          )}
          layoutId={`title-${project.id}`}
        >
          {project.name}
        </motion.h1>
        <div className="text-sm text-white font-medium">Teacher</div>
      </div>

      {/* Background hover content */}
      <div className="flex flex-col items-center justify-between w-full mt-auto bg-slate-800 rounded-t-xl px-4 py-2 space-y-2 transition-all duration-300">
        {/* Detail Preview Boxes */}
        <div className="flex w-full justify-between space-x-4 text-white text-xs font-medium">
          <div className="flex items-center space-x-1">
            <span role="img" aria-label="Participants">
              🧑🏻
            </span>
            <span>30/40</span>
          </div>
          <div>{project.day}</div>
          <div>{project.location}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default SmallCard
