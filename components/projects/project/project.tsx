// File: /components/ProjectComp.tsx

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Account, Day, Project } from "@prisma/client"
import { AnimatePresence, motion, spring, useAnimation } from "motion/react"
import Image from "next/image"
import { ArrowDown, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DM_Sans } from "next/font/google"
import { cn } from "@/lib/utils"

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
}

const dayToGerman: Record<Day, string> = {
  [Day.MON]: "Montag",
  [Day.TUE]: "Dienstag",
  [Day.WED]: "Mittwoch",
}

const ProjectComp = ({ project }: ProjectCompProps) => {
  const controls = useAnimation()
  const [showContents, setShowContents] = useState(false)
  const router = useRouter()
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    setTimeout(() => setShowContents(true), 400)
  }, [controls])

  const projectTeachers = useMemo(
    () =>
      project?.participants?.filter(
        (p) => p.role === "TEACHER" || p.role === "ADMIN"
      ),
    [project.participants]
  )

  return (
    <div className="relative h-full w-full">
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
          <div className="top-64 md:top-[40%] left-[0] h-[550px] w-[1028px] blur-[80px] bg-black opacity-80 absolute"></div>
        )}
      </motion.div>
      <motion.div className="absolute bottom-8 md:bottom-16 w-full">
        <motion.h1
          layoutId={"title-" + project.id}
          className={cn(
            "text-5xl md:text-6xl font-extrabold text-white md:leading-[96px] tracking-tighter flex items-center px-8 md:px-20 gap-4",
            dmSans.className
          )}
        >
          <div className="text-2xl md:text-4xl flex justify-center rounded-2xl items-center bg-slate-800 p-4 h-[72px] w-[72px] bg-opacity-65 border-2 border-slate-800">
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
                  "text-base md:text-3xl px-8 md:px-24 text-white mb-4 md:mb-8"
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
                className="max-h-[25vh] h-auto text-wrap mb-8 relative ml-8 md:ml-20 inline-block"
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
                {(project.studentsCount || 0) < (project.maxStudents || 0) ? (
                  <Button className="w-full sm:w-[154px] h-[43px] rounded-xl">
                    Anmelden
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-[154px] h-[43px] rounded-xl"
                    disabled
                  >
                    Voll 😭
                  </Button>
                )}
                {[
                  {
                    icon: "🙋🏻",
                    text: `${project.studentsCount}/${project.maxStudents}`,
                  },
                  { icon: "📍", text: project.location },
                  {
                    icon: "🕑",
                    text:
                      dayToGerman[project.day || "MON"] + " " + project.time,
                  },
                  { icon: "💵", text: "2€" },
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
            router.push("/projects")
          }}
        >
          <X className="text-white" size={24} strokeWidth={3} />
        </div>
      )}
    </div>
  )
}

export default ProjectComp
