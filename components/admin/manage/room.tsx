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
import { assignAccount, queryProjects } from "@/lib/actions/queries/projects"
import {
  assignProjectToRoom,
  deleteRoom,
  queryRooms,
} from "@/lib/actions/queries/rooms"
import { lookUpDay } from "@/lib/helpers/lookupname"
import {
  AccountWithProjects,
  ProjectWithParticipants,
  RoomWithProjects,
  RoomWithProjectsWithParticipants,
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
  room: RoomWithProjectsWithParticipants
}

const ManageRoomActions = ({ room }: Props) => {
  const router = useRouter()
  const { openConfirmModal } = useConfirmModal()
  const queryClient = useQueryClient()

  const { data: projects, isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => await queryProjects(),
  })

  const projectCount = room?.projects?.length

  const { mutateAsync: deleteRoomFn } = useMutation({
    mutationFn: async () => {
      await deleteRoom(room.id)
    },
    onMutate: async () => {
      router.push("/admin")
      toast.loading("Raum wird gelöscht...", {
        id: "delete-room",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      })
      toast.success("Raum gelöscht", {
        id: "delete-room",
      })
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Raums", {
        id: "delete-room",
      })
      router.push("/admin/rooms/" + room.id)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-2">
        <Button
          className="flex items-center gap-2"
          variant="destructive"
          onClick={() =>
            room?.id &&
            openConfirmModal({
              message: "Raum wirklich löschen?",
              confirmCallback: deleteRoomFn,
              title: "Raum löschen",
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
              {projectCount || 0}
            </div>
            <Separator className="bg-slate-300 w-full" />
            <div className="text-sm text-slate-600 font-medium">Projekte</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageRoomActions
