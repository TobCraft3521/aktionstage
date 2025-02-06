"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import { removeTeacherFromProject } from "@/lib/actions/updates/projects"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import toast from "react-hot-toast"
const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})

const ProjectDetailView = () => {
  const { projectId: id } = useParams() // Get the project ID from the URL
  const userId = useSession().data?.user.id
  const queryClient = useQueryClient()
  const { data: ownProjects } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryOwnProjects(),
  })
  const project = useMemo(
    () => ownProjects?.find((p) => p.id === id),
    [ownProjects, id]
  )
  const teachers = useMemo(() => {
    const allTeachers = project?.teachers || []
    return allTeachers.filter((teacher) => teacher.id !== userId)
  }, [project?.teachers, userId])

  const { mutateAsync: removeTeacher, isPending: isRemovingTeacher } =
    useMutation({
      mutationFn: async ({
        teacherId,
        teacherName,
      }: {
        teacherId: string
        teacherName: string
      }) => removeTeacherFromProject((id as string) || "", teacherId),
      onMutate: async ({ teacherId, teacherName }) => {
        // Optimistically update the UI to remove the teacher
        queryClient.setQueryData(["teacher-projects"], (oldData: any) => {
          const updatedProjects = oldData.map((p: any) => {
            if (p.id === id) {
              // Remove the teacher from the project
              const updatedTeachers = p.teachers.filter(
                (teacher: any) => teacher.id !== teacherId
              )
              return { ...p, teachers: updatedTeachers }
            }
            return p
          })
          return updatedProjects
        })
      },
      onError: (error, variables, context: any) => {
        // Rollback the optimistic update
        queryClient.setQueryData(["teacher-projects"], context?.oldData)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-projects"] })
      },
      onSuccess: (data, { teacherId, teacherName }) => {
        // Display a success toast after the teacher is removed
        toast.success(`${teacherName} erfolgreich entfernt!`)
      },
    })

  return (
    <div className="absolute w-full h-full left-0 top-0 bg-slate-50 p-16">
      <Button variant="ghost" className="">
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
        <div className="mt-4 flex flex-row gap-4 items-center">
          <p className="text-base">mit</p>
          <div className="flex flex-wrap gap-2">
            {teachers.map((teacher) => (
              <Badge
                key={1}
                variant="outline"
                className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-red-100 hover:border-red-500 cursor-no-drop"
                onClick={() => {
                  removeTeacher({
                    teacherId: teacher.id || "",
                    teacherName: teacher.name,
                  })
                }}
              >
                {teacher.name}
                <span className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </span>
              </Badge>
            ))}
            <Badge
              variant="outline"
              className={cn(
                "hover:bg-slate-100",
                teachers.length < 2 ? "cursor-pointer" : "cursor-no-drop"
              )}
            >
              {teachers.length < 2 ? <Plus className="h-4 w-4" /> : "2 / 2"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailView
