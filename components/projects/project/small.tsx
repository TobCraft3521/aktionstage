"use client"
import { motion } from "motion/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Account, Project, Role } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./styles.module.css"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const SmallCard = ({
  project,
  index,
  routePrefix = "/projects/",
}: {
  project: Partial<
    Project & {
      participants: Account[]
    }
  >
  index: number
  routePrefix?: string
}) => {
  const router = useRouter()
  const cardRef = useRef<any>(null)
  const shadowRef = useRef<any>(null)
  const imageRef = useRef<any>(null)
  const projectTeachers = useMemo(
    () =>
      project?.participants?.filter(
        (p) => p.role === Role.TEACHER || p.role === Role.ADMIN
      ),
    [project.participants]
  )
  const studentsCount = useMemo(
    () =>
      project?.participants?.filter(
        (p) => p.role === Role.STUDENT || p.role === Role.VIP
      ).length,
    [project.participants]
  )
  return (
    // add drop-shadow-lg that doesnt render during animation
    <motion.div
      ref={cardRef}
      initial={{
        transform: "translateZ(0)",
      }}
      className={cn(
        styles.loadAni,
        "w-full overflow-hidden flex items-center group h-[60vw] sm:h-64 justify-center shadow-2xl cursor-pointer bg-white group relative will-change-transform"
      )}
      onLayoutAnimationStart={() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow = "none"
        }
        if (shadowRef.current) {
          shadowRef.current.style.display = "none"
        }
        // if (imageRef.current) {
        //   imageRef.current.style.display = "none"
        // }
      }}
      onLayoutAnimationComplete={() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow =
            "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);"
        }
        if (shadowRef.current) {
          shadowRef.current.style.display = "block"
        }
        // if (imageRef.current) {
        //   imageRef.current.style.display = "block"
        // }
      }}
      key={project.id}
      layoutId={`card-container-${project.id}`}
      onClick={() => {
        cardRef.current.style.filter = "none"
        router.push(routePrefix + project.id)
      }}
      style={{
        borderRadius: "24px",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Image
        src={project?.imageUrl || "/imgs/asg-logo.jpg"}
        alt={project?.name || "project-image"}
        width={256}
        height={256}
        blurDataURL={project?.imageUrl || "/imgs/asg-logo.jpg"}
        className="brightness transition-all duration-300 w-full h-full object-cover pointer-events-none group-hover:brightness-75 group-hover:scale-[102%]"
        priority
        placeholder="blur"
        ref={imageRef}
      />
      <div className="absolute bottom-[9%] text-white text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-5">
        <motion.h1
          // split too long text into two lines
          className={cn(
            "max-w-[150px] break-words text-center",
            dmSans.className
          )}
          layoutId={`title-${project.id}`}
        >
          {project.name}
        </motion.h1>
        <div className="text-xs font-medium opacity-90">
          {projectTeachers?.map((teacher) => teacher.short).join(" ") ||
            "Kein Lehrer"}
          , {studentsCount}/{project.maxStudents}
        </div>
      </div>
      {/* hide when opening to reduce lag ACTUAL PROBLEM HERE 10% ~*/}
      <div
        ref={shadowRef}
        className="absolute bottom-0 bg-black blur-xl w-[80%] h-[80px] block z-20"
        // style={{
        //   filter: "box-shadow(0 -85px 24px rgb(0 0 0 / 1))",
        // }}
      ></div>
    </motion.div>
  )
}

export default SmallCard
