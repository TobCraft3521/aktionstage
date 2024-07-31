import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Project } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useAppState } from "@/hooks/use-app-state"
import styles from "./styles.module.css"

const SmallCard = ({
  project,
  index,
}: {
  project: Partial<Project>
  index: number
}) => {
  const router = useRouter()

  return (
    <motion.div
      className={cn(
        styles.loadAni,
        "w-full overflow-hidden flex items-center h-64 justify-center rounded-xl cursor-pointer drop-shadow-lg bg-white group relative will-change-transform"
      )}
      key={project.id}
      layoutId={`card-container-${project.id}`}
      onClick={() => router.push("/projects/" + project.id)}
      style={{
        borderRadius: "24px",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Image
        src={project.imageUrl || "/imgs/asg-logo.jpg"}
        alt={project.name || "kein Bild vorhanden"}
        width={16 * 64}
        height={9 * 64}
        className="relative object-cover w-full h-full transition-all group-hover:brightness-75 pointer-events-none"
      />
      <div className="absolute bottom-[9%] text-white drop-shadow-md text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-5">
        <motion.h1
          className="truncate max-w-full mx-auto"
          layoutId={`title-${project.id}`}
        >
          {project.name}
        </motion.h1>
        <div className="text-xs font-medium">Teacher</div>
      </div>
      <div
        className="absolute top-full bg-white w-full h-[100px] hidden md:block z-20 font-thin"
        style={{
          filter: "drop-shadow(0 -96px 32px rgb(0 0 0 / 0.8))",
        }}
      ></div>
    </motion.div>
  )
}

export default SmallCard
