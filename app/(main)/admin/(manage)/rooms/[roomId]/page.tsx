"use client"
import AdminTable from "@/components/admin/data/table"
import ManageProjectActions from "@/components/admin/manage/project"
import ManageRoomActions from "@/components/admin/manage/room"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  kickAccount,
  queryProjects,
  queryStudentsForProject,
  queryTeachersForProject,
} from "@/lib/actions/queries/projects"
import { kickProjectFromRoom, queryRooms } from "@/lib/actions/queries/rooms"
import { lookUpDay } from "@/lib/helpers/lookupname"
import { RoomWithProjectsWithParticipants } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Link2Off } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { title } from "process"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

type Props = {
  params: {
    roomId: string
  }
  searchParams: {
    queryKey: string
  }
}

const ManageProject = ({
  params: { roomId },
  searchParams: { queryKey },
}: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const queryClient = useQueryClient()
  const user = useSession().data?.user
  const userLoading = useSession().status === "loading"
  const router = useRouter()

  const { data: rooms, isPending } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => await queryRooms(),
  })

  const room = useMemo(() => {
    return rooms?.find((r) => r.id === roomId)
  }, [roomId, rooms])

  if (!room && !isPending) {
    router.push("/admin")
  }

  const { mutateAsync: kickProject } = useMutation({
    mutationFn: async (projectId: string) =>
      await kickProjectFromRoom(projectId, roomId),
    onMutate: (projectId: string) => {
      toast.loading("Projekt wird entfernt...", {
        id: "kick-project",
      })
      queryClient.setQueryData(["projects", roomId], (oldData: any) => {
        return oldData.filter((p: any) => p.id !== projectId)
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", roomId],
      })
      toast.success("Projekt wurde entfernt!", {
        id: "kick-project",
        icon: "👋",
      })
    },
    onError: (error) => {
      toast.error("Fehler beim Entfernen des Projekts!", {
        id: "kick-project",
      })
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      })
    },
  })

  const tabs = [
    {
      title: "Verwalten",
      content: room && <ManageRoomActions room={room} />,
    },
    {
      title: "Projekte",
      content: (
        <AdminTable
          title="Projekte"
          queryKey={["projects", roomId]}
          queryFn={async () => room?.projects || []}
          columns={[
            {
              label: "Name",
              render: (p) => (
                <motion.h1
                  layoutId={`project-h1-${p.id}`}
                  className="flex flex-row gap-2 items-center"
                >
                  <p className="">{p?.name || `Noname`}</p>
                </motion.h1>
              ),
            },
            { label: "Tag", render: (p) => lookUpDay[p.day] },
            {
              label: "Aktionen",
              render: (p) => (
                <div className="flex flex-row gap-2">
                  <Button
                    variant="secondary"
                    className="hover:bg-red-500 hover:text-white bg-slate-200"
                    size="sm"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await kickProject(p.id)
                    }}
                  >
                    <Link2Off size={16} />
                  </Button>
                </div>
              ),
              noPadding: true,
            },
          ]}
          filters={[
            {
              label: "Tag",
              render: (value, setValue) => (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tage</SelectLabel>
                      {Object.keys(lookUpDay).map((day) => (
                        <SelectItem key={day} value={day}>
                          {lookUpDay[day as keyof typeof lookUpDay]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ),
              filterFn: (row, value) => {
                return value ? row.day === value : true
              },
            },
          ]}
          manageItem="projects"
        />
      ),
    },
  ]

  if (!userLoading && user?.role !== Role.ADMIN)
    // This is just for UX: Everything is back-end protected
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        Halt 🫷🏻🛑! Kleiner Hacker oder großer Software Bug 🪳🪲🐛?
        <br />
        Ein {user?.role || "rollenloser Nutzer"} hat sich hierher wohl verirrt.
      </div>
    )

  return (
    <div className="relative min-h-0 w-full flex-1 flex flex-col">
      <div className="h-[25vh] w-full flex flex-col pt-16 border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]">
        <div className="w-full max-w-6xl ml-16 2xl:mx-auto space-y-2">
          <Button
            variant="secondary"
            className="h-8"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" /> Zurück
          </Button>
          <motion.h1
            layoutId={`room-h1-${roomId}`}
            className="text-xl font-semibold flex flex-row gap-2 items-center"
          >
            {room?.name ? (
              <div className="flex flex-row gap-2 items-center">
                <p className={cn()}>{room?.name || `Noname`}</p>
              </div>
            ) : (
              <Skeleton className="w-[146px] h-[25px] bg-slate-300" />
            )}
          </motion.h1>
          <p className="text-slate-400">
            Hier kannst du {room?.name} verwalten.
          </p>
        </div>
        <div className="mt-auto flex flex-row gap-4 text-slate-700 w-full max-w-6xl ml-16 2xl:mx-auto">
          {tabs.map((t, i) => (
            <div
              key={i}
              className={cn(
                "pb-1 select-none",
                i === activeTab && "border-b-2 border-slate-500"
              )}
            >
              <div
                className="w-full h-full hover:bg-slate-200 p-1 px-4 rounded-md transition-all cursor-pointer"
                onClick={() => setActiveTab(i)}
              >
                {t.title}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* content */}
      <div className="w-full max-w-6xl px-16 2xl:px-0 2xl:mx-auto flex-1 flex py-8 min-h-0">
        {tabs[activeTab].content}
      </div>
    </div>
  )
}

export default ManageProject
