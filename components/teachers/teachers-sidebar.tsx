import {
    GanttChart
} from "lucide-react"
import Link from "next/link"

const TeachersSidebar = () => {
  return (
    <div className="h-full w-[260px] border-zinc-300">
      <h1 className="p-12 pb-1 text-xl font-semibold">Für Lehrer</h1>
      <h2 className="mt-4 w-full px-12 text-sm font-semibold">
        Eigene Projekte
      </h2>
      <div className="flex w-full flex-col items-center p-2 text-sm font-medium ">
        <Link
          href={"/settings/account"}
          className="flex w-44 flex-row items-center gap-2 rounded-md p-2 text-sm text-slate-400 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <GanttChart className="h-4 w-4 text-slate-400 dark:text-zinc-400" />{" "}
          Projekte
        </Link>
      </div>
    </div>
  )
}

export default TeachersSidebar
