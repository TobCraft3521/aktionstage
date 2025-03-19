"use client"
import AdminTable from "@/components/admin/data/table"
import {
  queryAcccountsComplete,
  queryStudentsWithProjects,
  queryTeachersWithProjectsAndPasswords,
} from "@/lib/actions/queries/accounts"
import { queryProjectsWithStudentsAndTeachers } from "@/lib/actions/queries/projects"
import { queryRoomsWithProjectsWithTeachers } from "@/lib/actions/queries/rooms"
import { auth } from "@/lib/auth/auth"
import { importAccounts } from "@/lib/data/import/account"
import { importProjects } from "@/lib/data/import/project"
import { importRooms } from "@/lib/data/import/room"
import {
  exportAccounts,
  exportProjects,
  exportRooms,
} from "@/lib/helpers/data-exports"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { Layers } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { motion } from "motion/react"

type Props = {}

const Overview = (props: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const queryClient = useQueryClient()
  const user = useSession().data?.user
  const tabs = [
    {
      title: "Schüler",
      content: (
        <AdminTable
          title="Schüler"
          queryKey="students"
          queryFn={queryStudentsWithProjects}
          columns={[
            {
              label: "Name",
              render: (s) => (
                <motion.h1 layoutId={`account-h1-${s.id}`}>{s.name}</motion.h1>
              ),
            },
            { label: "Klasse", render: (s) => s.grade },
            { label: "Projekte", render: (s) => s.projects?.length || 0 },
          ]}
          importFn={(data) => {
            importAccounts(data, queryClient)
          }}
          addFn={(data) => {
            importAccounts(data, queryClient, true)
          }}
          exportFn={async () => {
            const accounts = await queryAcccountsComplete()
            exportAccounts(accounts || [])
          }}
          manageItem="accounts"
        />
      ),
    },
    {
      title: "Lehrer",
      content: (
        <AdminTable
          title="Lehrer"
          queryKey="teachers"
          queryFn={queryTeachersWithProjectsAndPasswords}
          columns={[
            { label: "Name", render: (t) => t.name },
            { label: "Kürzel", render: (t) => t.short },
            {
              label: "Rolle",
              render: (t) => {
                return (
                  (
                    {
                      [Role.TEACHER]: "Lehrer",
                      [Role.ADMIN]: "💥 Admin 💥",
                    } as any
                  ) /* only admin and teacher are returned */[t.role] ||
                  "Unbekannt"
                )
              },
            },
            { label: "Projekte", render: (t) => t.projects?.length || 0 },
          ]}
          importFn={(data) => {
            importAccounts(data, queryClient)
          }}
          addFn={(data) => {
            importAccounts(data, queryClient, true)
          }}
          exportFn={async () => {
            const accounts = await queryAcccountsComplete()
            exportAccounts(accounts || [])
          }}
          manageItem="accounts"
        />
      ),
    },
    {
      title: "Projekte",
      content: (
        <AdminTable
          title="Projekte"
          queryKey="projects"
          queryFn={queryProjectsWithStudentsAndTeachers}
          columns={[
            { label: "Name", render: (p) => p.name },
            {
              label: "Lehrer",
              render: (p) =>
                p.participants?.filter(
                  (t) => t.role === Role.TEACHER || t.role === Role.ADMIN
                ).length,
            },
            {
              label: "Schüler",
              render: (p) =>
                p.participants?.filter(
                  (s) => s.role === Role.STUDENT || s.role === Role.VIP
                )?.length,
            },
          ]}
          importFn={(data) => {
            importProjects(data, queryClient)
          }}
          addFn={(data) => {
            importProjects(data, queryClient, true)
          }}
          exportFn={(projects) => exportProjects(projects)}
          manageItem=""
        />
      ),
    },
    {
      title: "Räume",
      content: (
        <AdminTable
          title="Räume"
          queryKey="rooms"
          queryFn={() => queryRoomsWithProjectsWithTeachers()}
          columns={[
            { label: "Name", render: (r) => r.name },
            { label: "Projekte", render: (r) => r.projects?.length },
          ]}
          importFn={(data) => {
            importRooms(data, queryClient)
          }}
          addFn={(data) => {
            importRooms(data, queryClient, true)
          }}
          exportFn={(rooms) => exportRooms(rooms)}
          manageItem=""
        />
      ),
    },
  ]
  if (user?.role && user.role !== Role.ADMIN)
    // This is just for UX: Everything is back-end protected
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        Halt 🫷🏻🛑! Kleiner Hacker oder ein großer Software Bug 🪳🪲🐛?
        <br />
        Ein {user?.role} hat sich hierher wohl verirrt.
      </div>
    )
  return (
    <div className="relative min-h-0 w-full flex-1 flex flex-col">
      <div className="h-[25vh] w-full flex flex-col pt-16 border-b border-zinc-300 from-[#e7e7eb] to-[#f0f2ff] bg-gradient-to-br dark:border-zinc-800 dark:bg-[#111015]">
        <div className="w-full max-w-6xl ml-16 2xl:mx-auto space-y-2">
          <h1 className="text-xl font-semibold flex flex-row gap-2 items-center">
            <Layers className="w-5 h-5" />
            Übersicht
          </h1>
          <p className="text-slate-400">
            Hier siehst du alle Schüler, Lehrer und Projekte.
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

export default Overview
