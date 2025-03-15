"use client"
import Projects from "@/components/admin/projects/projects"
import Students from "@/components/admin/students/students"
import Teachers from "@/components/admin/teachers/teachers"
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"
import { useState } from "react"

type Props = {}

const Overview = (props: Props) => {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [
    {
      title: "Schüler",
      content: <Students />,
    },
    {
      title: "Lehrer",
      content: <Teachers />,
    },
    {
      title: "Projekte",
      content: <Projects />,
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
