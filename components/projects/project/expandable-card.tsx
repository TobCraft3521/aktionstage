"use client"
import { cn } from "@/lib/utils"
import { LayoutGroup, motion, useMotionValue } from "framer-motion"
import Image from "next/image"
import { useRef, useState } from "react"
import styles from "./styles.module.css"
import { Project } from "@prisma/client"
import Overlay from "@/components/global/overlay"
import { useScrollConstraints } from "@/lib/utils/use-scroll-constraints"
import { useWheelScroll } from "@/lib/utils/use-wheel-scroll"
import { useAppState } from "@/hooks/use-app-state"
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
  const onClose = () => {
    setIsSelected(false)
  }
  const y = useMotionValue(0)
  const zIndex = useMotionValue(isSelected ? 2 : 0)

  // We'll use the opened card element to calculate the scroll constraints
  const cardRef = useRef(null)
  const constraints = useScrollConstraints(cardRef, isSelected)

  function checkSwipeToDismiss() {
    if (y.get() > dismissDistance) {
      setIsSelected(false)
      appState.setSelectedProject(null)
      y.set(0)
    }
  }

  function checkZIndex(latest: any) {
    if (isSelected) {
      zIndex.set(2)
    } else if (!isSelected && latest.scaleX < 1.01) {
      zIndex.set(0)
    }
  }

  // When this card is selected, attach a wheel event listener
  const containerRef = useRef(null)
  useWheelScroll(containerRef, y, constraints, checkSwipeToDismiss, isSelected)
  return (
    <div className="w-full h-64" ref={containerRef}>
      <Overlay isEnabled={isSelected} onClose={onClose} />
      <div className={isSelected ? "fixed top-0 right-0 left-0 z-20" : ""}>
        <motion.div
          layoutId={animationId}
          ref={cardRef}
          style={{
            animationDelay: `${i * 35}ms`,
            zIndex,
            y,
          }}
          drag={isSelected ? "y" : false}
          dragConstraints={constraints}
          onDrag={checkSwipeToDismiss}
          onUpdate={checkZIndex}
          className={cn(
            !isSelected
              ? "w-full overflow-hidden flex items-center h-64 justify-center rounded-lg cursor-pointer drop-shadow-lg group"
              : "",
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
              className={isSelected ? "h-64 w-full" : "h-full w-full"}
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
                  filter: "drop-shadow(0 -96px 32px rgb(0 0 0 / 0.6))",
                }}
              ></div>
            </div>
          ) : (
            <div className="h-screen bg-black w-screen">test</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
