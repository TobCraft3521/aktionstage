"use client"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useAppState } from "@/hooks/use-app-state"

const ProjectsHeader = () => {
    const appState = useAppState()

  return (
    <div className="w-full h-16 bg-slate-50 border-b-2 border-slate-100 sticky top-0 flex items-center px-6 gap-4">
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-5 w-5 text-gray-500" />
        <input
          id="name"
          type="text"
          placeholder="Suchen"
          className="w-[250px] bg-white rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-slate-400"
        />
      </div>
      <Select>
        <SelectTrigger className="w-[250px] focus:ring-0 bg-white border-slate-300">
          <SelectValue placeholder="Jahrgangsstufe" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 cursor-pointer">
          <SelectItem value="5" className="cursor-pointer">
            5. Klasse
          </SelectItem>
          <SelectItem value="6" className="cursor-pointer">
            6. Klasse
          </SelectItem>
          <SelectItem value="7" className="cursor-pointer">
            7. Klasse
          </SelectItem>
          <SelectItem value="8" className="cursor-pointer">
            8. Klasse
          </SelectItem>
          <SelectItem value="9" className="cursor-pointer">
            9. Klasse
          </SelectItem>
          <SelectItem value="10" className="cursor-pointer">
            10. Klasse
          </SelectItem>
          <SelectItem value="11" className="cursor-pointer">
            11. Klasse
          </SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[250px] focus:ring-0 bg-white border-slate-300">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 cursor-pointer">
          <SelectItem value="MON">Montag</SelectItem>
          <SelectItem value="TUE">Dienstag</SelectItem>
          <SelectItem value="WED">Mittwoch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default ProjectsHeader
