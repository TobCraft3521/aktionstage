"use client"
import { useAppState } from "@/hooks/use-app-state"
import { queryTeachers } from "@/lib/actions/queries/accounts"
import { cn } from "@/lib/utils"
import { Account, Day } from "@prisma/client"
import { motion } from "framer-motion"
import { Check, ChevronsUpDown, ChevronUp, Plus, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import AnimatedButton from "../global/some-button"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const ProjectsHeader = () => {
  const { search, setSearch } = useAppState()
  const [teachers, setTeachers] = useState<Partial<Account>[]>([])
  const [teachersOpen, setTeachersOpen] = useState(false)
  const [rerenderKey, setRerenderKey] = useState(+new Date())
  const [isCollapsed, setIsCollapsed] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching teachers")
      setTeachers(await queryTeachers())
    }
    fetchData()
  }, [])
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }, [])
  return (
    <motion.div
      layoutId="projects-header"
      transition={{ duration: 0.1 }}
      key={rerenderKey}
      className="w-full flex flex-wrap lg:flex-nowrap p-2 lg:py-0 lg:h-16 bg-slate-50 border-b-2 dark:border-b-0 border-slate-100 sticky top-0 items-center px-6 gap-4 drop-shadow-lg dark:drop-shadow-none z-50 dark:bg-card"
    >
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-5 w-5 text-gray-500" />
        <input
          id="name"
          type="text"
          placeholder="Suchen"
          className="w-[250px] bg-slate-200 dark:bg-foreground rounded-lg border-slate-300 dark:border-none py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:border-indigo-400"
          value={search.query}
          onChange={(e) =>
            setSearch({
              ...search,
              query: e.target.value,
            })
          }
        />
      </div>
      {!isCollapsed && (
        <>
          <div className="md:hidden">
            <AnimatedButton
              className=""
              onClick={() => {
                setSearch({})
                setRerenderKey(+new Date())
              }}
            >
              Reset
            </AnimatedButton>
          </div>
          <Select
            onValueChange={(value) =>
              setSearch({ ...search, grade: Number(value) })
            }
            value={search.grade?.toString()}
          >
            <SelectTrigger className="w-[150px] md:w-[250px] focus:ring-0 bg-slate-200 dark:bg-foreground border-slate-300 border-none">
              <SelectValue placeholder="Jahrgangsstufe" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 cursor-pointer">
              <SelectItem
                value="5"
                className={cn(
                  "cursor-pointer",
                  search.grade === 5 && "bg-slate-100"
                )}
              >
                5. Klasse
              </SelectItem>
              <SelectItem
                value="6"
                className={cn(
                  "cursor-pointer",
                  search.grade === 6 && "bg-slate-100"
                )}
              >
                6. Klasse
              </SelectItem>
              <SelectItem
                value="7"
                className={cn(
                  "cursor-pointer",
                  search.grade === 7 && "bg-slate-100"
                )}
              >
                7. Klasse
              </SelectItem>
              <SelectSeparator />
              <SelectItem
                value="8"
                className={cn(
                  "cursor-pointer",
                  search.grade === 8 && "bg-slate-100"
                )}
              >
                8. Klasse
              </SelectItem>
              <SelectItem
                value="9"
                className={cn(
                  "cursor-pointer",
                  search.grade === 9 && "bg-slate-100"
                )}
              >
                9. Klasse
              </SelectItem>
              <SelectItem
                value="10"
                className={cn(
                  "cursor-pointer",
                  search.grade === 10 && "bg-slate-100"
                )}
              >
                10. Klasse
              </SelectItem>
              <SelectSeparator />
              <SelectItem
                value="11"
                className={cn(
                  "cursor-pointer",
                  search.grade === 11 && "bg-slate-100"
                )}
              >
                11. Klasse
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setSearch({ ...search, day: value as Day })
            }
            value={search.day}
          >
            <SelectTrigger className="w-[150px] md:w-[250px] focus:ring-0 bg-slate-200 dark:bg-foreground border-slate-300 border-none">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent
              className="bg-white border-slate-200 cursor-pointer z-[60]"
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {search.day && (
                <>
                  <div
                    className="flex gap-2 text-sm items-center"
                    onClick={(e) => {
                      setSearch({ ...search, day: undefined })
                      setRerenderKey(+new Date())
                    }}
                  >
                    <X className="w-6 h-6 p-1" />
                    Alle Tage
                  </div>
                  <SelectSeparator />
                </>
              )}
              <SelectItem
                value="MON"
                className={cn(
                  "cursor-pointer",
                  search.day === Day.MON && "bg-slate-100"
                )}
              >
                Montag
              </SelectItem>
              <SelectItem
                value="TUE"
                className={cn(
                  "cursor-pointer",
                  search.day === Day.TUE && "bg-slate-100"
                )}
              >
                Dienstag
              </SelectItem>
              <SelectItem
                value="WED"
                className={cn(
                  "cursor-pointer",
                  search.day === Day.WED && "bg-slate-100"
                )}
              >
                Mittwoch
              </SelectItem>
            </SelectContent>
          </Select>
          <Popover open={teachersOpen} onOpenChange={setTeachersOpen}>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                className="w-[250px] md:w-[250px] justify-between bg-slate-200 dark:bg-foreground hover:bg-slate-300 border text-gray-900 border-slate-300 border-none"
              >
                {search.teacher
                  ? teachers.find((teacher) => teacher.name === search.teacher)
                      ?.name
                  : "Wähle einen Lehrer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
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
                                currentValue === search.teacher
                                  ? ""
                                  : currentValue,
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
          <div className="hidden md:block">
            <AnimatedButton
              className=""
              onClick={() => {
                setSearch({})
                setRerenderKey(+new Date())
              }}
            >
              Reset
            </AnimatedButton>
          </div>
        </>
      )}
      <div className="md:hidden">
        {isCollapsed ? (
          <Plus className="h-5 w-5" onClick={() => setIsCollapsed(false)} />
        ) : (
          <ChevronUp className="h-5 w-5" onClick={() => setIsCollapsed(true)} />
        )}
      </div>
    </motion.div>
  )
}

export default ProjectsHeader
