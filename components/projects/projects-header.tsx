"use client"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Search as SearchType, useAppState } from "@/hooks/use-app-state"
import { useEffect, useState } from "react"
import { Account, Day } from "@prisma/client"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import { cn } from "@/lib/utils"
import { queryTeachers } from "@/lib/actions/queries/accounts"

const ProjectsHeader = () => {
  const { search, setSearch } = useAppState()
  const [teachers, setTeachers] = useState<Partial<Account>[]>([])
  const [teachersOpen, setTeachersOpen] = useState(false)
  const [dayRenderKey, setDayRenderKey] = useState(+new Date())
  useEffect(() => {
    const fetchData = async () => {
      setTeachers(await queryTeachers())
    }
    fetchData()
  }, [])
  return (
    <div className="w-full h-16 bg-slate-50 border-b-2 border-slate-100 sticky top-0 flex items-center px-6 gap-4">
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-5 w-5 text-gray-500" />
        <input
          id="name"
          type="text"
          placeholder="Suchen"
          className="w-[250px] bg-slate-200 rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-slate-400"
          value={search.query}
          onChange={(e) =>
            setSearch({
              ...search,
              query: e.target.value,
            })
          }
        />
      </div>
      <Select
        onValueChange={(value) =>
          setSearch({ ...search, grade: Number(value) })
        }
        value={search.grade?.toString()}
      >
        <SelectTrigger className="w-[250px] focus:ring-0 bg-slate-200 border-slate-300">
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
      <Select
        onValueChange={(value) => setSearch({ ...search, day: value as Day })}
        value={search.day}
        key={dayRenderKey}
      >
        <SelectTrigger className="w-[250px] focus:ring-0 bg-slate-200 border-slate-300">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200 cursor-pointer">
          {search.day && (
            <>
              <div
                className="flex gap-2 text-sm items-center"
                onClick={(e) => {
                  setSearch({ ...search, day: undefined })
                  setDayRenderKey(+new Date())
                }}
              >
                <X className="w-6 h-6 p-1" />
                Alle Tage
              </div>
              <SelectSeparator />
            </>
          )}
          <SelectItem value="MON" className="cursor-pointer">
            Montag
          </SelectItem>
          <SelectItem value="TUE" className="cursor-pointer">
            Dienstag
          </SelectItem>
          <SelectItem value="WED" className="cursor-pointer">
            Mittwoch
          </SelectItem>
        </SelectContent>
      </Select>
      <Popover open={teachersOpen} onOpenChange={setTeachersOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            className="w-[200px] justify-between bg-slate-200 hover:bg-slate-300 border text-gray-900 border-slate-300"
          >
            {search.teacher
              ? teachers.find((teacher) => teacher.name === search.teacher)
                  ?.name
              : "Wähle einen Lehrer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Lehrer suchen..." />
            <CommandEmpty>Kein Lehrer gefunden.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {teachers.length > 0 &&
                  teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      className="cursor-pointer"
                      value={teacher.name}
                      onSelect={(currentValue) => {
                        setSearch({
                          ...search,
                          teacher:
                            currentValue === search.teacher ? "" : currentValue,
                        })
                        setTeachersOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          search.teacher === teacher.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {teacher.name}
                    </CommandItem>
                  ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ProjectsHeader