// File: /components/ProjectComp.tsx

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { lookUpDay } from "@/lib/helpers/lookupname"
import { cn } from "@/lib/utils"
import { Account, Project, Role } from "@prisma/client"
import { useMutation } from "@tanstack/react-query"
import { ArrowDown, X } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "motion/react"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import SignUpButton from "./sign-up"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})
interface ProjectCompProps {
  project: Partial<
    Project & {
      participants: Account[]
    }
  >
  routePrefix?: string
}

const ProjectComp = ({
  project,
  routePrefix = "/projects/",
}: ProjectCompProps) => {
  const controls = useAnimation()
  const [showContents, setShowContents] = useState(false)
  const router = useRouter()
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    setTimeout(() => setShowContents(true), 400)
  }, [controls])

  let swipeDismissDistance = 0 // Default value for SSR

  if (typeof window !== "undefined") {
    swipeDismissDistance = window.innerHeight / 8 // Calculate the swipe dismiss distance in pixels
  }
  const y = useMotionValue(0)
  const scale = useTransform(
    y,
    [-swipeDismissDistance, 0, swipeDismissDistance],
    [0.2, 1, 0.2]
  )
  const borderRadius = useTransform(
    y,
    [-swipeDismissDistance, 0, swipeDismissDistance],
    [96, 0, 96]
  )

  const projectTeachers = useMemo(
    () =>
      project?.participants?.filter(
        (p) => p.role === "TEACHER" || p.role === "ADMIN"
      ),
    [project.participants]
  )

  const studentsCount = useMemo(() => {
    return project?.participants?.filter(
      (p) => p.role === Role.STUDENT || p.role === Role.VIP
    ).length
  }, [project.participants])

  const id = project.id

  return (
    <motion.div
      className="absolute w-full h-full top-0 left-0 right-0 bottom-0 flex items-center overflow-hidden justify-center bg-white z-[99]"
      layoutId={`card-container-${id}`}
      style={{
        y,
        scale,
        willChange: "transform",
        borderRadius,
      }}
      // reduced motion: enable this and add transition-all and remove layoutId
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{
      //   opacity: 0,
      // }}
      drag={
        typeof window !== "undefined" && window.innerWidth > 768 ? "y" : false
      }
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={(event, info) => {
        if (
          info.offset.y > swipeDismissDistance ||
          info.offset.y < -swipeDismissDistance
        ) {
          router.push(routePrefix)
        }
      }}
    >
      <motion.div
        // initial={{ opacity: 0 }}
        animate={controls}
        className="absolute inset-0"
      >
        {/* {showContents && ( */}
        <Image
          src={project?.imageUrl || "/imgs/asg-logo.jpg"}
          alt={project?.name || "project-image"}
          width={1028}
          height={1028}
          blurDataURL={project?.imageUrl || "/imgs/asg-logo.jpg"}
          className="brightness transition-all w-full h-full object-cover group-hover:brightness-75 pointer-events-none"
          priority
          placeholder="blur"
        />
        {/* )} */}
        {/* lag */}
        {showContents && (
          <div className="top-16 md:top-[40%] left-[0] h-[550px] w-[1028px] blur-[80px] bg-black opacity-80 absolute"></div>
        )}
      </motion.div>
      <motion.div className="absolute md:bottom-16 w-full">
        <motion.h1
          layoutId={"title-" + project.id}
          className={cn(
            "text-4xl md:text-6xl font-extrabold text-white md:leading-[96px] tracking-tighter flex items-center px-8 md:px-20 gap-4",
            dmSans.className
          )}
        >
          <div className="text-2xl md:text-4xl flex justify-center rounded-2xl items-center bg-slate-800 p-4 h-[56px] w-[56px] sm:h-[72px] sm:w-[72px] bg-opacity-65 border-2 border-slate-800">
            {project.emoji}
          </div>
          {project?.name}
        </motion.h1>

        {showContents && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
            >
              <motion.h2
                className={cn(
                  dmSans.className,
                  "text-lg md:text-3xl px-8 md:px-24 text-white mb-4 md:mb-8"
                )}
              >
                {projectTeachers?.map(
                  (teacher, i) =>
                    teacher.name.split(" ")[0].substring(0, 1) +
                    ". " +
                    teacher.name.split(" ")[1] +
                    (i + 1 === projectTeachers?.length ? "" : ", ")
                )}
              </motion.h2>
              <ScrollArea
                className="max-h-[20vh] sm:max-h-[25vh] h-auto text-wrap mb-8 relative ml-8 md:ml-20 inline-block"
                onScrollCapture={(e) => setShowScrollHint(false)}
              >
                <div
                  className={cn(
                    "max-w-[900px] text-base sm:text-xl sm:leading-8 max-h-[25vh] text-slate-200 break-words",
                    (project.description || "").length > 560 &&
                      showScrollHint &&
                      "from-slate-200 bg-gradient-to-b from-50% to-90% bg-clip-text text-transparent"
                  )}
                >
                  {project?.description} Jahrgangsstufen: {project?.minGrade}.
                  Klasse - {project?.maxGrade}. Klasse
                  {/* {"a".repeat(561)} */}
                  <AnimatePresence>
                    {(project.description || "").length > 560 &&
                      showScrollHint && (
                        <div
                          className={cn(
                            "absolute bottom-2 w-full flex items-center justify-center text-slate-200"
                          )}
                        >
                          <motion.div
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{
                              x: {
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              },
                            }}
                            className="p-1 px-4 bg-slate-950 rounded-lg flex items-center justify-center gap-2"
                          >
                            scroll <ArrowDown size={20} />
                          </motion.div>
                        </div>
                      )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
              <div className="w-full flex mx-auto gap-2 md:gap-4 px-8 md:px-20 flex-wrap">
                <SignUpButton
                  project={project}
                  studentsCount={studentsCount || 0}
                />
                {[
                  {
                    icon: "🙋🏻",
                    text: `${studentsCount}/${project.maxStudents}`,
                  },
                  { icon: "📍", text: project.location },
                  {
                    icon: "🕑",
                    text: lookUpDay[project.day || "MON"] + " " + project.time,
                  },
                  { icon: "💵", text: project.price + "€" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="w-full sm:w-[154px] h-[43px] bg-slate-800 gap-2 flex items-center justify-center text-white rounded-xl border-2 border-slate-800 bg-opacity-75 hover:bg-opacity-90 transition-all"
                  >
                    {item.icon}
                    <div
                      className={(item.text || "").length > 10 ? "text-xs" : ""}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
      {showContents && (
        <div
          className="absolute top-8 md:top-12 right-8 md:right-12 border-slate-800 border-2 rounded-full p-2 cursor-pointer bg-slate-800 bg-opacity-65"
          onClick={() => {
            setShowContents(false)
            router.push(routePrefix)
          }}
        >
          <X className="text-white" size={24} strokeWidth={3} />
        </div>
      )}
    </motion.div>
  )
}

export default ProjectComp
