"use client"

import { Button } from "@/components/ui/button"
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
import { Separator } from "@/components/ui/separator"
import { deleteProject } from "@/lib/actions/delete/project"
import { queryAcccountsComplete } from "@/lib/actions/queries/accounts"
import { assignAccount } from "@/lib/actions/queries/projects"
import { assignProjectToRoom, queryRooms } from "@/lib/actions/queries/rooms"
import { lookUpDay } from "@/lib/helpers/lookupname"
import {
  AccountWithProjects,
  ProjectWithParticipants,
  RoomWithProjects,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { useConfirmModal } from "@/stores/confirm-modal"
import { RestoreObjectCommand } from "@aws-sdk/client-s3"
import { Role, Room } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronsUpDown, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

type Props = {
  project: ProjectWithParticipants
}

const ManageProjectActions: React.FC<Props> = ({ project }) => {
  const router = useRouter()
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false)
  const [isAssignRoomOpen, setIsAssignRoomOpen] = useState(false)
  const { openConfirmModal } = useConfirmModal()
  const queryClient = useQueryClient()

  const { data: accounts, isPending } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => queryAcccountsComplete(),
  })

  const { data: rooms, isPending: isRoomsPending } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => queryRooms(),
  })

  const room = useMemo(() => {
    return rooms?.find((r) => r.id === project?.roomId)
  }, [project?.roomId, rooms])

  const teacherCount = useMemo(() => {
    return accounts?.filter(
      (a) =>
        (a.role === Role.TEACHER || a.role === Role.ADMIN) &&
        a.projects.find((p) => p.id === project?.id)
    ).length
  }, [accounts, project?.id])

  const studentCount = useMemo(() => {
    return accounts?.filter(
      (a) =>
        (a.role === Role.STUDENT || a.role === Role.VIP) &&
        a.projects.find((p) => p.id === project?.id)
    ).length
  }, [accounts, project?.id])

  const { mutateAsync: deleteProjectFn } = useMutation({
    mutationFn: () => deleteProject(project?.id || ""),
    onSuccess: () => {
      toast.success("Projekt gelöscht", {
        id: "delete-project",
      })
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Projekts", {
        id: "delete-project",
      })
      router.push(`/admin/projects/${project?.id}`)
    },
    onMutate: () => {
      router.push("/admin")
      toast.loading("Projekt wird gelöscht", {
        id: "delete-project",
      })
    },
  })

  const { mutateAsync: assignAccountFn } = useMutation({
    mutationFn: async (accountId: string) => {
      if (!project?.id) return
      if (!accountId) return
      toast.loading("Projekt wird zugewiesen", {
        id: "assign-project",
      })
      const { error } = await assignAccount(project.id, accountId)
      return { error }
    },
    onMutate: (accountId: string) => {
      queryClient.setQueryData(["accounts"], (old: AccountWithProjects[]) => {
        return old.map((account) => {
          if (account.id === accountId) {
            return {
              ...account,
              projects: [...(account.projects || []), project],
            }
          }
          return project
        })
      })
    },
    onSuccess: () => {
      toast.success("Projekt zugewiesen", {
        id: "assign-project",
      })
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
    },
    onError: () => {
      toast.error("Fehler beim Zuweisen des Projekts", {
        id: "assign-project",
      })
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      })
    },
  })

  const { mutateAsync: assignRoomFn } = useMutation({
    mutationFn: async (roomId: string) => {
      if (!project?.id) return
      if (!roomId) return
      toast.loading("Raum wird zugewiesen", {
        id: "assign-room",
      })
      const { error } = await assignProjectToRoom(project.id, roomId)
      return { error }
    },
    onMutate: (roomId: string) => {
      queryClient.setQueryData(["rooms"], (old: RoomWithProjects[]) => {
        return old.map((room) => {
          if (room.id === roomId) {
            return {
              ...room,
              projects: [...(room.projects || []), project],
            }
          }
          return room
        })
      })
    },
    onSuccess: () => {
      toast.success("Raum zugewiesen", {
        id: "assign-room",
      })
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      })
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      })
    },

    onError: () => {
      toast.error("Fehler beim Zuweisen des Raums", {
        id: "assign-room",
      })
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      })
    },
  })

  const accountsWithConflicts = useMemo(() => {
    if (!accounts || !project?.day) return new Set()

    return new Set(
      accounts
        .filter((account) =>
          account.projects?.some(
            (assignedProject) => assignedProject.day === project.day
          )
        )
        .map((account) => account.id)
    )
  }, [accounts, project?.day])

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-2">
        <Popover open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
          <PopoverTrigger asChild className="w-full">
            <Button
              role="combobox"
              className="w-[250px] md:w-full justify-between bg-slate-200 dark:bg-foreground hover:bg-slate-300 border text-gray-900 border-slate-300 border-none"
            >
              Accounts zuweißen
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" side="top">
            {isPending ? (
              <div className="p-8">
                Wow bist du schnell, die Accounts laden noch...
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Accounts suchen" />
                <CommandEmpty>Keine Accounts gefunden</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {accounts?.map((account) => {
                      const hasConflict = accountsWithConflicts.has(account.id)
                      return (
                        <CommandItem
                          key={account.id}
                          className={cn("cursor-pointer")}
                          value={account.name}
                          onSelect={() => assignAccountFn(account.id)}
                          // Check no duplicate projects on each day Day.MON Day.TUE Day.WED
                          disabled={hasConflict}
                        >
                          {account.name}
                        </CommandItem>
                      )
                    })}
                  </CommandList>
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>

        <Popover open={isAssignRoomOpen} onOpenChange={setIsAssignRoomOpen}>
          <PopoverTrigger asChild className="w-full">
            <Button
              role="combobox"
              className="w-[250px] md:w-full justify-between bg-slate-200 dark:bg-foreground hover:bg-slate-300 border text-gray-900 border-slate-300 border-none"
            >
              Raum zuweißen
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" side="top">
            {isRoomsPending ? (
              <div className="p-8">
                Wow bist du schnell, die Räume laden noch...
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Räume suchen" />
                <CommandEmpty>Keine Räume gefunden</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {rooms?.map((room) => (
                      <CommandItem
                        key={room.id}
                        className={cn("cursor-pointer")}
                        value={room.name}
                        disabled={room?.projects?.some(
                          (p) => p.day === project.day
                        )}
                        onSelect={() => {
                          assignRoomFn(room.id)
                        }}
                      >
                        {room.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>

        <Button
          className="flex flex-row items-center gap-2"
          onClick={() => router.push(`/teachers/projects/${project?.id}/edit`)}
        >
          <Edit className="h-4" />
          Bearbeiten
        </Button>

        <Button
          className="flex items-center gap-2"
          variant="destructive"
          onClick={() =>
            project?.id &&
            openConfirmModal({
              message: "Projekt wirklich löschen?",
              confirmCallback: deleteProjectFn,
              title: "Projekt löschen",
            })
          }
        >
          <Trash2 size={16} />
          Löschen
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <div className="">
          <div className="bg-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 w-36 h-full">
            <div className="text-2xl font-black text-slate-800">
              {studentCount || 0}
            </div>
            <Separator className="bg-slate-300 w-full" />
            <div className="text-sm text-slate-600 font-medium">Schüler</div>
          </div>
        </div>
        <div className="">
          <div className="bg-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 w-36 h-full">
            <div className="text-2xl font-black text-slate-800">
              {teacherCount || 0}
            </div>
            <Separator className="bg-slate-300 w-full" />
            <div className="text-sm text-slate-600 font-medium">Lehrer</div>
          </div>
        </div>
        <div className="">
          <div className="bg-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 w-36 h-full">
            <div className="font-black text-slate-800">
              {project?.day ? lookUpDay[project.day] : "Kein Tag"}
            </div>
            <Separator className="bg-slate-300 w-full" />
            <div className="text-sm text-slate-600 font-medium">Tag</div>
          </div>
        </div>
        <div className="">
          <div className="bg-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 w-36 h-full">
            <div className="font-black text-slate-800 text-center">
              {room?.name || project.location}
            </div>
            <Separator className="bg-slate-300 w-full" />
            <div className="text-sm text-slate-600 font-medium">
              {room?.name ? "Raum" : "Ort"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageProjectActions
