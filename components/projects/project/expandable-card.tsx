"use client"
import { cn } from "@/lib/utils"
import { LayoutGroup, motion, MotionValue, useMotionValue } from "framer-motion"
import Image from "next/image"
import { useRef, useState } from "react"
import styles from "./styles.module.css"
import { Project } from "@prisma/client"
import Overlay from "@/components/global/overlay"
import { useAppState } from "@/hooks/use-app-state"
import { useWheelScroll } from "@/lib/utils/use-wheel-scroll"
import { useScrollConstraints } from "@/lib/utils/use-scroll-constraints"
import { closeSpring, openSpring } from "@/lib/utils/animations"
import { useInvertedBorderRadius } from "@/lib/utils/use-inverted-border-radius"
const dismissDistance = 75
export const ExpandableCard = ({
  animationId,
  i,
  project,
}: {
  animationId: string
  i: number
  project: Partial<Project>
}) => {
  const [isSelected, setIsSelected] = useState(false)
  const appState = useAppState()

  return (
    <div className="w-full h-64">
      <div className={isSelected ? "fixed top-0 right-0 left-0 z-20" : ""}>
        <motion.div
          layoutId={animationId}
          style={{
            animationDelay: `${i * 35}ms`,
          }}
          className={cn(
            !isSelected
              ? "w-full overflow-hidden flex items-center h-64 justify-center rounded-xl cursor-pointer drop-shadow-lg group"
              : "rounded-lg",
            styles.loadAni
          )}
        >
          {!isSelected ? (
            <div
              onClick={() => {
                if (appState.selectedProject) return
                setIsSelected(true)
                appState.setSelectedProject(project)
              }}
              className={!isSelected ? "h-64 w-full" : ""}
            >
              <Image
                src={project.imageUrl || "/imgs/asg-logo.jpg"}
                alt={project.name || "kein Bild vorhanden"}
                width={16 * 20}
                height={9 * 20}
                className="relative object-cover w-full h-full transition-all group-hover:brightness-75"
              />
              <div className="absolute bottom-[9%] text-white drop-shadow-md text-xl z-30 font-semibold w-full px-2 flex flex-col items-center leading-4">
                <div className="truncate max-w-full mx-auto">
                  {project.name}
                </div>
                <div className="text-base font-medium">Teacher</div>
              </div>
              <div
                className="absolute top-full bg-white w-full h-[5000px] z-20 font-thin"
                style={{
                  filter: "drop-shadow(0 -96px 32px rgb(0 0 0 / 0.7))",
                }}
              ></div>
            </div>
          ) : (
            <div
              className="h-screen bg-black w-screen md:rounded-lg"
              onClick={() => {
                setIsSelected(false)
                appState.setSelectedProject(null)
              }}
            >
              test
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
