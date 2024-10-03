// File: /components/ProjectComp.tsx

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Account, Project } from "@prisma/client"
import { motion, useAnimation } from "framer-motion"
import Image from "next/image"
import { Istok_Web } from "next/font/google"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProjectCompProps {
  project: Partial<
    Project & {
      teachers: Account[]
    }
  >
}

const istokWeb = Istok_Web({
  weight: "700",
  subsets: ["latin"],
})

const ProjectComp = ({ project }: ProjectCompProps) => {
  const controls = useAnimation()
  const [showContents, setShowContents] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => setShowContents(true), 400)
  }, [controls])

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
            "text-5xl md:text-8xl px-8 md:px-20 font-semibold text-white md:leading-[96px]",
            istokWeb.className
          )}
        >
          {project?.name}
        </motion.h1>
        {showContents && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
            >
              <motion.h2 className="text-base md:text-3xl px-8 md:px-24 text-white mb-4 md:mb-8">
                {project?.teachers?.map(
                  (teacher, i) =>
                    teacher.name.split(" ")[0].substring(0, 1) +
                    ". " +
                    teacher.name.split(" ")[1] +
                    (i + 1 === project?.teachers?.length ? "" : ", ")
                )}
              </motion.h2>
              <ScrollArea>
                <div className="max-w-[900px] text-sm sm:text-lg text-slate-200 px-8 md:px-20 mb-8 md:mb-16 max-h-[40vh]">
                  {project?.description}
                </div>
              </ScrollArea>
              <div className="w-full flex mx-auto gap-2 md:gap-4 px-8 md:px-20 flex-wrap">
                <Button className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] rounded-xl hover:bg-[#1c1c3c]">
                  Anmelden
                </Button>
                <div className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] gap-2 flex items-center justify-center text-white rounded-xl border-2 border-[#2c2c2c] bg-opacity-65 hover:bg-opacity-80 transition-all">
                  🧑‍🦱 {project.studentsCount + "/" + project.studentsMax}
                </div>
                <div className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] gap-2 flex items-center justify-center text-white rounded-xl border-2 border-[#2c2c2c] bg-opacity-65 hover:bg-opacity-80 transition-all">
                  📍 Mo, ASG 102
                </div>
                <div className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] gap-2 flex items-center justify-center text-white rounded-xl border-2 border-[#2c2c2c] bg-opacity-65 hover:bg-opacity-80 transition-all">
                  🕑 8.15-12.00
                </div>
                <div className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] gap-2 flex items-center justify-center text-white rounded-xl border-2 border-[#2c2c2c] bg-opacity-65 hover:bg-opacity-80 transition-all">
                  💳 2€
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
      {showContents && (
        <div
          className="absolute top-8 md:top-12 right-8 md:right-12 border-[#2c2c2c] border-2 rounded-full p-2 cursor-pointer bg-[#2c2c2c] bg-opacity-65"
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
