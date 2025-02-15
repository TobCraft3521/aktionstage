"use client"
import { StudentsOverview } from "@/components/teachers/projects/printable"
import TeachersList from "@/components/teachers/projects/teachers-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
import { queryProjectStudents } from "@/lib/actions/queries/accounts"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { leaveProject } from "@/lib/actions/updates/projects"
import { cn } from "@/lib/utils"
import { useConfirmModal } from "@/stores/confirm-modal"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronLeft,
  DoorOpen,
  Edit,
  Loader2,
  Plus,
  Printer,
  Trash2,
} from "lucide-react"
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
  const { data: ownProjects } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryOwnProjects(),
  })
  const project = useMemo(
    () => ownProjects?.find((p) => p.id === id),
    [ownProjects, id]
  )
  const { data: students, isPending: isStudentsLoading } = useQuery({
    queryKey: ["students", project?.id],
    queryFn: () => queryProjectStudents(project?.id || ""),
    refetchInterval: 5000,
  })
  const { mutateAsync: deleteProjectMutation, isPending: isDeletingProject } =
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

  const { mutateAsync: leaveProjectMutation } = useMutation({
    mutationFn: async ({}: { projectName: string }) =>
      leaveProject(id as string),
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
            Anmeldungen ({students?.length || 0})
          </h1>
          <ScrollArea className="bg-slate-100 h-full rounded-xl border border-slate-200 w-screen max-w-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Nr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Klasse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((s, i) => (
                  <TableRow key={i} className={`animate-fade-in`}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-right">{s.grade}</TableCell>
                  </TableRow>
                ))}
                {isStudentsLoading &&
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
                {!students?.length && !isStudentsLoading && (
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
            onClick={() => {
              posthog.capture("print_project_signups", {
                project_id: project?.id,
              })
              print()
            }}
          >
            <Printer className="h-4 w-4" /> Ausdrucken
          </Button>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Bearbeiten
          </Button>
          {(project?.teachers?.length || 0) > 1 ? (
            <Button
              className="flex items-center gap-2 w-full"
              onClick={handleLeave}
            >
              <DoorOpen className="h-4 w-4" /> Verlassen
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="w-full">
                  <Button
                    className="flex items-center gap-2 w-full"
                    onClick={handleLeave}
                    disabled
                  >
                    <DoorOpen className="h-4 w-4" /> Verlassen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {(project?.teachers?.length || 0) <= 1
                    ? "Keine weiteren Lehrer"
                    : null}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            Löschen
          </Button>
        </div>
      </div>

      {/* printable students overview (only shown when clicking print) */}
      <div className="hidden">
        <StudentsOverview ref={printableRef} projectId={project?.id || ""} />
      </div>
    </div>
  )
}

export default ProjectDetailView
