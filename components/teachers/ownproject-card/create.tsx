import { ChevronRight, Plus } from "lucide-react"
import Link from "next/link"

type Props = {}

const CreateProjectCard = (props: Props) => {
  return (
    <div className="">
      <Link
        href="/teachers/ownprojects/create"
        className="group flex h-[128px] w-56 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-gray-100 to-gray-200 shadow-neutral-200 shadow-lg transition-all hover:border-slate-300 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 dark:border-[1.5px] dark:border-slate-900 dark:bg-gradient-to-r dark:from-[#0c0b0f] dark:to-gray-900 dark:hover:border-slate-800 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700"
      >
        <div className="relative flex h-full w-1/3 flex-shrink-0 items-center justify-center overflow-hidden rounded-l-lg bg-neutral-300 transition-all dark:bg-gray-800">
          <div className="absolute -bottom-[175%] left-[-30%] h-[160%] w-[160%] rotate-12 transform bg-slate-800 transition-all duration-500 group-hover:bottom-[-10%] dark:bg-[#ea5234]"></div>
          <Plus className="relative z-10 h-6 w-6 text-white transition-all group-hover:h-9 group-hover:w-9" />
        </div>
        <div className="relative flex w-2/3 flex-col justify-center p-6">
          <div className="absolute mt-1 translate-y-[85px] font-semibold leading-tight text-gray-800 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 dark:text-white text-xl">
            🪄🎉
          </div>
          <div className="absolute mt-1 text-sm font-semibold leading-tight text-gray-800 opacity-100 transition-all duration-500 group-hover:-translate-y-[85px] group-hover:opacity-0 dark:text-white">
            Neues Projekt erstellen
          </div>
        </div>
      </Link>
    </div>
  )
}

export default CreateProjectCard
