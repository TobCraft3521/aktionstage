"use client"
import AdminTable from "@/components/admin/data/table"
import ManageProjectActions from "@/components/admin/manage/project"
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
    projectId: string
  }
  searchParams: {
    queryKey: string
  }
}

const ManageProject = ({
  params: { projectId },
  searchParams: { queryKey },
}: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const queryClient = useQueryClient()
  const user = useSession().data?.user
  const userLoading = useSession().status === "loading"
  const router = useRouter()

  const { data: projects, isPending } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => await queryProjects(),
  })

  const project = useMemo(() => {
    return projects?.find((a) => a.id === projectId)
  }, [projectId, projects])

  if (!project && !isPending) {
    router.push("/admin")
  }

  const { mutateAsync: kickStudentAsync } = useMutation({
    mutationFn: async (accountId: string) => {
      return await kickAccount(projectId, accountId)
    },
    onMutate: (accountId: string) => {
      toast.loading("Schüler wird entfernt...", {
        id: "kick-student",
      })
      queryClient.setQueryData(["accounts", projectId], (oldData: any) => {
        return oldData.filter((a: any) => a.id !== accountId)
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["accounts", projectId],
      })
      toast.success("Schüler wurde entfernt!", {
        id: "kick-student",
        icon: "👋",
      })
    },
    onError: (error) => {
      toast.error("Fehler beim Entfernen des Schülers!", {
        id: "kick-student",
      })
      queryClient.invalidateQueries({
        queryKey: ["accounts", projectId],
      })
    },
  })

  const tabs = [
    {
      title: "Verwalten",
      content: project && <ManageProjectActions project={project} />,
    },
    {
      title: "Schüler",
      content: (
        <AdminTable
          title="Schüler"
          queryKey={["students", projectId]}
          queryFn={() => queryStudentsForProject(projectId)}
          columns={[
            {
              label: "Name",
              render: (s) => (
                <motion.h1
                  layoutId={`account-h1-${s.id}`}
                  className="flex flex-row gap-2 items-center"
                >
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
                </motion.h1>
              ),
            },
            { label: "Klasse", render: (s) => s.grade },
            { label: "Projekte", render: (s) => s.projects?.length || 0 },
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
                      await kickStudentAsync(p.id)
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
              label: "Klasse",
              render: (value, setValue) => (
                <Select value={value} onValueChange={setValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Klasse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Klassen</SelectLabel>
                      {[...Array(12)].map((_, i) => {
                        if (i < 5) return null // Assuming grades start from 5
                        const base = i.toString()
                        return (
                          <>
                            <SelectItem
                              key={i}
                              className="cursor-pointer"
                              value={base}
                            >
                              {base}. Klasse
                            </SelectItem>
                            <SelectItem
                              key={`${i}a`}
                              className="cursor-pointer"
                              value={`${base}a`}
                            >
                              {base}a
                            </SelectItem>
                            <SelectItem
                              key={`${i}b`}
                              className="cursor-pointer"
                              value={`${base}b`}
                            >
                              {base}b
                            </SelectItem>
                            <SelectItem
                              key={`${i}c`}
                              className="cursor-pointer"
                              value={`${base}c`}
                            >
                              {base}c
                            </SelectItem>
                          </>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ),
              filterFn: (row, value) => {
                return value ? row.grade?.includes(value) || false : true
              },
            },
          ]}
          manageItem="accounts"
        />
      ),
    },
    {
      title: "Lehrer",
      content: (
        <AdminTable
          title="Lehrer"
          queryKey={["teachers", projectId]}
          queryFn={() => queryTeachersForProject(projectId)}
          columns={[
            {
              label: "Name",
              render: (a) => (
                <motion.h1
                  layoutId={`account-h1-${a.id}`}
                  className="flex flex-row gap-2 items-center"
                >
                  <p>{a?.name || `Noname`}</p>
                  {a.role === Role.ADMIN && (
                    <span className="bg-gradient-to-r from-red-500 to-yellow-500 rounded-xl p-0.5 px-2 text-xs text-white font-extrabold flex items-center">
                      💥 Admin 💥
                    </span>
                  )}
                </motion.h1>
              ),
            },
            { label: "Projekte", render: (s) => s.projects?.length || 0 },
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
                      await kickStudentAsync(p.id)
                    }}
                  >
                    <Link2Off size={16} />
                  </Button>
                </div>
              ),
              noPadding: true,
            },
          ]}
          manageItem="accounts"
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
            layoutId={`project-h1-${projectId}`}
            className="text-xl font-semibold flex flex-row gap-2 items-center"
          >
            {project?.name ? (
              <div className="flex flex-row gap-2 items-center">
                <p
                  className={cn(
                    project.name === "Tobias Hackenberg" && "text-orange-500"
                  )}
                >
                  {project?.name || `1`}
                </p>
              </div>
            ) : (
              <Skeleton className="w-[146px] h-[25px] bg-slate-300" />
            )}
          </motion.h1>
          <p className="text-slate-400">
            Hier kannst du {project?.name} verwalten.
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
