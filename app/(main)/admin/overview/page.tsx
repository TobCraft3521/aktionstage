"use client"
import AdminTable from "@/components/admin/data/table"
import {
  queryStudentsWithProjectsAndPasswords,
  queryTeachersWithProjectsAndPasswords,
} from "@/lib/actions/queries/accounts"
import { queryProjectsWithStudentsAndTeachers } from "@/lib/actions/queries/projects"
import {
  queryRooms,
  queryRoomsWithProjectsWithTeachers,
} from "@/lib/actions/queries/rooms"
import {
  exportProjects,
  exportRooms,
  exportStudents,
  exportTeachers,
} from "@/lib/helpers/data-exports"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { Layers } from "lucide-react"
import { useState } from "react"

type Props = {}

const Overview = (props: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [
    {
      title: "Schüler",
      content: (
        <AdminTable
          title="Schüler"
          queryKey="students"
          queryFn={queryStudentsWithProjectsAndPasswords}
          columns={[
            { label: "Name", render: (s) => s.name },
            { label: "Klasse", render: (s) => s.grade },
            { label: "Projekte", render: (s) => s.projects.length },
          ]}
          importFn={() => {}}
          addFn={() => {}}
          exportFn={(students) => {
            exportStudents(students)
          }}
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
            { label: "Projekte", render: (t) => t.ownProjects?.length },
          ]}
          importFn={() => {}}
          addFn={() => {}}
          exportFn={(teachers) => {
            exportTeachers(teachers)
          }}
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
            { label: "Lehrer", render: (p) => p.teachers?.length },
            { label: "Schüler", render: (p) => p.students?.length },
          ]}
          importFn={() => {}}
          addFn={() => {}}
          exportFn={(projects) => exportProjects(projects)}
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
          importFn={() => {}}
          addFn={() => {}}
          exportFn={(rooms) => exportRooms(rooms)}
        />
      ),
    },
  ]
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
