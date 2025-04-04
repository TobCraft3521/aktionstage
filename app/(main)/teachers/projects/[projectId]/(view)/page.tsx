"use client"
import { StudentsOverview } from "@/components/teachers/projects/printable"
import TeachersList from "@/components/teachers/projects/teachers-list"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { deleteProject } from "@/lib/actions/delete/project"
import { queryProjectParticipants } from "@/lib/actions/queries/accounts"
import { queryTeachersProjects } from "@/lib/actions/queries/projects"
import {
  leaveProject,
  leaveProjectAsTeacher,
} from "@/lib/actions/updates/project"
import { cn } from "@/lib/utils"
import { useConfirmModal } from "@/stores/confirm-modal"
import { Role } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, DoorOpen, Edit, Printer, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import { useParams, useRouter } from "next/navigation"
import posthog from "posthog-js"
import { useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { useReactToPrint } from "react-to-print"
const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ProjectDetailView = () => {
  const { projectId: id } = useParams() // Get the project ID from the URL
  const userId = useSession().data?.user.id
  const router = useRouter()
  const { openConfirmModal } = useConfirmModal()
  const printableRef = useRef<HTMLDivElement>(null)
  const print = useReactToPrint({
    contentRef: printableRef,
    documentTitle: "Print Page Title",
  })
  const queryClient = useQueryClient()
  const { data: projects } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryTeachersProjects(),
  })
  const project = useMemo(
    () => projects?.find((p) => p.id === id),
    [projects, id]
  )
  const { data: participants, isPending: isParticipantsLoading } = useQuery({
    queryKey: ["participants", project?.id],
    queryFn: () => queryProjectParticipants(project?.id || ""),
    refetchInterval: 5000,
  })
  const { mutate: deleteProjectMutation, isPending: isDeletingProject } =
    useMutation({
      mutationFn: async ({}: { projectName: string }) =>
        deleteProject(id as string),
      onSuccess: () => {
        toast.success(`Projekt ${project?.name} erfolgreich gelöscht`)
        router.push("/teachers/projects")
      },
      onError: () => {
        toast.error("Fehler beim Löschen des Projekts")
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["teacher-projects"],
        })
      },
    })
  const handleDelete = () => {
    openConfirmModal({
      title: "Projekt löschen",
      message: "Projekt wirlich löschen?",
      confirmText: "Löschen",
      cancelText: "Abbrechen",
      confirmCallback: () =>
        deleteProjectMutation({
          projectName: project?.name || "",
        }),
    })
  }

  const { mutate: leaveProjectMutation } = useMutation({
    mutationFn: async ({}: { projectName: string }) =>
      leaveProjectAsTeacher(id as string),
    onSuccess: () => {
      toast.success(`Projekt ${project?.name} erfolgreich verlassen`)
      router.push("/teachers/projects")
    },
    onError: () => {
      toast.error("Fehler beim Verlassen des Projekts")
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-projects"],
      })
    },
  })

  const projectTeachers = useMemo(() => {
    return project?.participants?.filter(
      (p) => p.role === Role.TEACHER || p.role === Role.ADMIN
    )
  }, [project?.participants])

  const projectStudents = useMemo(() => {
    return project?.participants?.filter(
      (p) => p.role === "STUDENT" || p.role === "VIP"
    )
  }, [project?.participants])

  const handleLeave = () => {
    openConfirmModal({
      title: "Projekt verlassen",
      message: "Projekt wirklich verlassen?",
      confirmText: "Verlassen",
      cancelText: "Abbrechen",
      confirmCallback: () =>
        leaveProjectMutation({
          projectName: project?.name || "",
        }),
    })
  }

  return (
    <div className="w-full flex-1 min-h-0 left-0 top-0 bg-slate-50 flex flex-col">
      <div className="top-0 left-0 h-[25vh] p-16 pt-12 w-full border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]">
        <Button
          variant="ghost"
          className="h-8"
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
            Anmeldungen ({projectStudents?.length || 0})
          </h1>
          <ScrollArea className="bg-slate-100 h-full rounded-lg border border-slate-200 w-screen max-w-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Nr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Klasse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectStudents?.map((s, i) => (
                  <TableRow key={i} className={`animate-fade-in`}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="h-12 p-0 pl-4">
                      <h1 className="flex flex-row gap-2 items-center">
                        <p
                          className={cn(
                            s.name === "Tobias Hackenberg" &&
                              "text-orange-500 font-extrabold"
                          )}
                        >
                          {s?.name || `Noname`}
                        </p>
                        {s.role === Role.VIP && (
                          <span className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-0.5 px-2 text-xs text-white font-extrabold flex items-center">
                            👑 VIP
                          </span>
                        )}
                        {s.name === "Tobias Hackenberg" && (
                          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-0.5 px-2 text-xs text-white font-extrabold flex items-center">
                            App by ✨ Tobias ✨
                          </span>
                        )}
                      </h1>
                    </TableCell>
                    <TableCell className="text-right">{s.grade}</TableCell>
                  </TableRow>
                ))}
                {isParticipantsLoading &&
                  new Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="bg-slate-200 w-[20px] h-[20px]" />
                      </TableCell>
                      <TableCell className="">
                        <Skeleton className="bg-slate-200 w-full h-[20px]" />
                      </TableCell>
                      <TableCell className="flex justify-end">
                        <Skeleton className="bg-slate-200 w-[40px] h-[20px]" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!projectStudents?.length && !isParticipantsLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>Keine Anmeldungen</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className={cn(`${dmSans.className} text-2xl mb-4`)}>Projekt</h1>
          <Button
            className="flex items-center gap-2"
            variant="secondary"
            onClick={() => {
              posthog.capture("print_project_signups", {
                project_id: project?.id,
              })
              print()
            }}
          >
            <Printer className="h-4 w-4" /> Ausdrucken
          </Button>
          <Button
            className="flex items-center gap-2"
            variant="secondary"
            onClick={() =>
              router.push(`/teachers/projects/${project?.id}/edit`)
            }
          >
            <Edit className="h-4 w-4" /> Bearbeiten
          </Button>
          {(projectTeachers?.length || 0) > 1 ? (
            <Button
              className="flex items-center gap-2 w-full"
              onClick={handleLeave}
              variant="secondary"
            >
              <DoorOpen className="h-4 w-4" /> Verlassen
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="w-full" asChild>
                  <div className="flex items-center gap-2 w-full bg-slate-900/50 text-white justify-center rounded-md p-2 cursor-not-allowed">
                    <DoorOpen className="h-4 w-4" /> Verlassen
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {(projectTeachers?.length || 0) <= 1
                    ? "Keine weiteren Lehrer"
                    : null}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2 w-full"
          >
            <Trash2 className="h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      {/* printable students overview (only shown when clicking print) */}
      <div className="hidden">
        <StudentsOverview
          ref={printableRef}
          projectId={project?.id || ""}
          project={project}
        />
      </div>
    </div>
  )
}

export default ProjectDetailView
