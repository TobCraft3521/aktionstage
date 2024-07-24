import { Button } from "@/components/ui/button"
import { Account, Project } from "@prisma/client"
import { motion, useDragControls } from "framer-motion"
import { User } from "lucide-react"
import Image from "next/image"
import { Istok_Web } from "next/font/google"
import { cn } from "@/lib/utils"

interface ProjectCompProps {
  project: Partial<
    Project & {
      teachers: Account[]
    }
  >
  borderRadius: any
}

const istokWeb = Istok_Web({
  weight: "700",
  subsets: ["latin"],
})

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
        <div className="top-64 md:top-[50%] left-[5%] h-48 w-96 blur-[100px] bg-black absolute"></div>
        <div className="absolute bottom-8 md:bottom-16 w-full">
          <motion.h1
            layoutId={"title-" + project.id}
            className={cn(
              "text-5xl md:text-9xl px-8 md:px-20 font-semibold text-white md:leading-[96px] drop-shadow-lg",
              istokWeb.className
            )}
          >
            {project?.name}
          </motion.h1>
          <motion.h2 className="text-base md:text-4xl px-8 md:px-24 text-white mb-4 md:mb-8 drop-shadow-2xl">
            {project?.teachers?.map(
              (teacher, i) =>
                teacher.name.split(" ")[0].substring(0, 1) +
                ". " +
                teacher.name.split(" ")[1] +
                (i + 1 === project?.teachers?.length ? "" : ", ")
            )}
          </motion.h2>
          <div className="max-w-[775px] text-xs sm:text-base text-slate-200 px-8 md:px-20 mb-8 md:mb-16">
            {project?.description}
          </div>

          <div className="w-full flex mx-auto gap-4 px-8 md:px-20 flex-wrap">
            <Button className="w-full sm:w-[154px] h-[43px] bg-[#2c2c2c] rounded-xl">
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
        </div>
      </div>
    </>
  )
}

export default ProjectComp
