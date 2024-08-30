"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Project } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
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
  const cardRef = useRef<any>(null)
  const shadowRef = useRef<any>(null)
  return (
    // add drop-shadow-lg that doesnt render during animation
    <motion.div
      ref={cardRef}
      className={cn(
        styles.loadAni,
        "w-full overflow-hidden flex items-center h-64 justify-center drop-shadow-lg rounded-xl cursor-pointer bg-white group relative will-change-transform"
      )}
      onLayoutAnimationStart={() => {
        if (cardRef.current) {
          cardRef.current.style.filter = "none"
        }
        if (shadowRef.current) {
          shadowRef.current.style.display = "none"
        }
      }}
      onLayoutAnimationComplete={() => {
        if (cardRef.current) {
          cardRef.current.style.filter =
            "var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)"
        }
        if (shadowRef.current) {
          shadowRef.current.style.display = "block"
        }
      }}
      key={project.id}
      layoutId={`card-container-${project.id}`}
      onClick={() => {
        cardRef.current.style.filter = "none"
        router.push("/projects/" + project.id)
      }}
      style={{
        borderRadius: "24px",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Image
        src={project?.imageUrl || "/imgs/asg-logo.jpg"}
        alt={project?.name || "project-image"}
        width={1024}
        height={1024}
        objectFit="cover"
        blurDataURL={project?.imageUrl || "/imgs/asg-logo.jpg"}
        className="brightness transition-all w-full h-full object-cover group-hover:brightness-75 pointer-events-none"
        priority
        placeholder="blur"
      />
      <div className="absolute bottom-[9%] text-white text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-5">
        <motion.h1
          className="truncate max-w-full mx-auto"
          layoutId={`title-${project.id}`}
        >
          {project.name}
        </motion.h1>
        <div className="text-xs font-medium">Teacher</div>
      </div>
      {/* hide when opening to reduce lag ACTUAL PROBLEM HERE 10% ~*/}
      <div
        ref={shadowRef}
        className="absolute top-full bg-white w-[70%] h-[80px] hidden md:block z-20 font-thin"
        style={{
          filter: "drop-shadow(0 -80px 24px rgb(0 0 0 / 0.9))",
        }}
      ></div>
    </motion.div>
  )
}

export default SmallCard
