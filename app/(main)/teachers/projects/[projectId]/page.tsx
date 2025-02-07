"use client"
import TeachersList from "@/components/teachers/projects/teachers-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { removeTeacherFromProject } from "@/lib/actions/updates/projects"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Edit, Plus, Printer, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import toast from "react-hot-toast"
const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ProjectDetailView = () => {
  const { projectId: id } = useParams() // Get the project ID from the URL
  const userId = useSession().data?.user.id
  const router = useRouter()
  const { data: ownProjects } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryOwnProjects(),
  })
  const project = useMemo(
    () => ownProjects?.find((p) => p.id === id),
    [ownProjects, id]
  )

  return (
    <div className="w-full flex-1 min-h-0 left-0 top-0 bg-slate-50 flex flex-col">
      <div className="top-0 left-0 h-[30vh] p-16 w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]">
        <Button
          variant="ghost"
          className=""
          onClick={() => router.push("/teachers/projects")}
        >
          <ChevronLeft className="w-5 h-5" /> Zurück
        </Button>
        <div className="ml-5 mt-4">
          <motion.h1
            layoutId={"title-" + project?.id}
            className={cn(
              "font-extrabold tracking-tighter flex items-center gap-4 text-2xl",
              dmSans.className
            )}
          >
            <div className="flex justify-center rounded-lg items-center bg-slate-800 p-2 bg-opacity-65 border-2 border-slate-800">
              {project?.emoji}
            </div>
            {project?.name}
          </motion.h1>
          <TeachersList />
        </div>
      </div>
      <div className="p-16 px-20 flex flex-row gap-10 flex-1 min-h-0">
        <div className="flex flex-1 flex-col min-h-0 w-screen max-w-[400px]">
          <h1 className={cn(`${dmSans.className} text-2xl mb-4`)}>
            Anmeldungen
          </h1>
          <ScrollArea className="bg-slate-100 h-full rounded-xl border border-slate-200 w-screen max-w-[400px]">
            {[1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3].map(() => (
              <>
                <div className="flex flex-row items-center justify-start p-2 gap-4 px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-200">T</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">Tobias Hackenberg</p>
                </div>
                <Separator />
              </>
            ))}
          </ScrollArea>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className={cn(`${dmSans.className} text-2xl mb-4`)}>Projekt</h1>
          <Button className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Ausdrucken
          </Button>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Bearbeiten
          </Button>
          <Button variant="destructive">Löschen</Button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailView
