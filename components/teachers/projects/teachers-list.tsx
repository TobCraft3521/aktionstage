import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  queryAllTeacherLoads,
  queryTeachers,
} from "@/lib/actions/queries/accounts"
import { queryOwnProjects } from "@/lib/actions/queries/projects"
import {
  addTeacherToProject,
  removeTeacherFromProject,
} from "@/lib/actions/updates/project"
import { cn } from "@/lib/utils"
import { Account } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

const TeachersList = () => {
  const { projectId: id } = useParams() // Get the project ID from the URL
  const user = useSession().data?.user
  const queryClient = useQueryClient()
  const { data: ownProjects } = useQuery({
    queryKey: ["teacher-projects"],
    queryFn: () => queryOwnProjects(),
  })
  const { data: allTeacherLoads } = useQuery({
    queryKey: ["teacher-loads"],
    queryFn: () => queryAllTeacherLoads(),
  })
  const { data: allTeachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => queryTeachers(),
  })
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false)
  const project = useMemo(
    () => ownProjects?.find((p) => p.id === id),
    [ownProjects, id]
  )
  const teachers = useMemo(() => {
    const allTeachers = project?.teachers || []
    return allTeachers.filter((teacher) => teacher.id !== user?.id)
  }, [project?.teachers, user?.id])

  const { mutateAsync: removeTeacher, isPending: isRemovingTeacher } =
    useMutation({
      mutationFn: async ({
        teacherId,
      }: {
        teacherId: string
        teacherName: string
      }) => removeTeacherFromProject((id as string) || "", teacherId),
      onMutate: async ({ teacherId }) => {
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
      onError: (_error, _variables, context: any) => {
        // Rollback the optimistic update
        toast.error("Fehler beim Entfernen des Lehrers!")
        queryClient.setQueryData(["teacher-projects"], context?.oldData)
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-projects"] })
        queryClient.invalidateQueries({ queryKey: ["teacher-loads"] })
      },
      onSuccess: (_data, { teacherName }) => {
        // Display a success toast after the teacher is removed
        toast.success(`${teacherName} erfolgreich entfernt!`)
      },
    })

  const { mutateAsync: addTeacher, isPending: isAddingTeacher } = useMutation({
    mutationFn: async ({
      teacherId,
    }: {
      teacherId: string
      teacherName: string
    }) => addTeacherToProject((id as string) || "", teacherId),
    onMutate: async ({ teacherId, teacherName }) => {
      // Optimistically update the UI to add the teacher
      queryClient.setQueryData(["teacher-projects"], (oldData: any) => {
        const updatedProjects = oldData.map((p: any) => {
          if (p.id === id) {
            // Add the teacher to the project
            const updatedTeachers = [
              ...p.teachers,
              { id: teacherId, name: teacherName },
            ]
            return { ...p, teachers: updatedTeachers }
          }
          return p
        })
        return updatedProjects
      })
    },
    onError: (_error, _variables, context: any) => {
      // Rollback the optimistic update
      toast.error("Fehler beim Hinzufügen des Lehrers!")
      queryClient.setQueryData(["teacher-projects"], context?.oldData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-projects"] })
      queryClient.invalidateQueries({ queryKey: ["teacher-loads"] })
    },
    onSuccess: (_data, { teacherName }) => {
      // Display a success toast after the teacher is added
      toast.success(`${teacherName} erfolgreich hinzugefügt!`)
    },
  })

  return (
    <div className="mt-4 flex flex-row gap-4 items-center">
      <p className="text-base">mit</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {teachers.map((teacher) => (
          <Badge
            key={1}
            variant="outline"
            className="flex items-center border-slate-300 h-[25px] gap-2 px-3 py-1 transition-all hover:bg-red-100 hover:border-red-500 cursor-no-drop"
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
        <Popover
          open={isTeacherSelectOpen}
          onOpenChange={setIsTeacherSelectOpen}
        >
          <PopoverTrigger disabled={teachers.length >= 2}>
            <Badge
              variant="outline"
              className={cn(
                "hover:bg-slate-100 border-slate-300 h-[25px]",
                teachers.length < 2 ? "cursor-pointer" : "cursor-no-drop"
              )}
            >
              {teachers.length < 2 ? <Plus className="h-4 w-4" /> : "2 / 2"}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput placeholder="Search teachers..." />
              <CommandEmpty>No teachers found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {allTeachers.length > 0 &&
                    allTeachers.map((teacher: Partial<Account>) => (
                      <CommandItem
                        key={teacher.id}
                        className={cn(
                          "cursor-pointer",
                          teachers.find((t) => t.id === teacher.id) ||
                            project?.day === undefined ||
                            allTeacherLoads?.[teacher.id || ""]?.includes(
                              project?.day
                            ) ||
                            teacher.id === user.data?.user.id
                            ? "opacity-50 pointer-events-none"
                            : ""
                        )}
                        value={teacher.name}
                        onSelect={(currentValue) => {
                          if (currentValue === teacher.name) {
                            addTeacher({
                              teacherId: teacher.id || "",
                              teacherName: teacher.name,
                            })
                            setIsTeacherSelectOpen(false)
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            teachers.find((t) => t.id === teacher.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {teacher.name}
                      </CommandItem>
                    ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default TeachersList
