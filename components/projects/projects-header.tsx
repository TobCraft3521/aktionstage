"use client"
import { queryTeachers } from "@/lib/actions/queries/accounts"
import { cn } from "@/lib/utils"
import { useSearchState } from "@/stores/use-app-state"
import { Account, Day } from "@prisma/client"
import { motion } from "framer-motion"
import { Check, ChevronsUpDown, ChevronUp, Plus, Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import AnimatedButton from "../global/some-button"
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
import { lookUpDay } from "@/lib/helpers/lookupname"
import { getAktionstageDays } from "@/lib/config/days"

const ProjectsHeader = () => {
  const { search, setSearch } = useSearchState()
  const [teachers, setTeachers] = useState<Partial<Account>[]>([])
  const [teachersOpen, setTeachersOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      setTeachers(await queryTeachers())
    }
    fetchData()
  }, [])
  const scrollToTop = () => {
    document.getElementById("projects-scroll")?.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  const days = useMemo(() => getAktionstageDays(), [])
  return (
    <motion.div
      layoutId="projects-header"
      transition={{ duration: 0.1 }}
      className="w-full flex flex-wrap lg:flex-nowrap p-2 lg:py-0 lg:h-16 bg-slate-100/70 border-b dark:border-b-0 border-slate-200 sticky top-0 items-center px-6 gap-4 dark:drop-shadow-none z-50 dark:bg-zinc-900/90 backdrop-blur-lg"
    >
      <div className="relative flex items-center">
        <Search className="absolute left-2 h-5 w-5 text-gray-500" />
        <input
          id="name"
          type="text"
          placeholder="Suchen"
          className="w-[250px] bg-slate-200 dark:bg-background rounded-lg border-slate-300 dark:border-none py-2 pl-10 pr-4 text-gray-900 focus:outline-none dark:text-primary"
          value={search.query || ""}
          onChange={(e) => {
            scrollToTop()
            setSearch({
              ...search,
              query: e.target.value,
            })
          }}
        />
      </div>
      {!isCollapsed && (
        <>
          <div className="md:hidden">
            <AnimatedButton
              className=""
              onClick={() => {
                scrollToTop()
                setSearch({})
              }}
            >
              Reset
            </AnimatedButton>
          </div>
          <Select
            onValueChange={(value) => {
              scrollToTop()
              setSearch({ ...search, grade: Number(value) })
            }}
            value={search.grade?.toString() || ""}
          >
            <SelectTrigger className="w-[150px] md:w-[250px] focus:ring-0 bg-slate-200 border-slate-300 border-none dark:bg-background">
              <SelectValue placeholder="Jahrgangsstufe" />
            </SelectTrigger>
            <SelectContent
              className="border-slate-200 cursor-pointer dark:bg-background dark:border-neutral-800 dark:text-foreground"
              onTouchStart={(e) => e.preventDefault()}
            >
              <SelectItem
                value="5"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 5 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                5. Klasse
              </SelectItem>
              <SelectItem
                value="6"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 6 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                6. Klasse
              </SelectItem>
              <SelectItem
                value="7"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 7 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                7. Klasse
              </SelectItem>
              <SelectSeparator className="dark:bg-neutral-800 h-[1px]" />
              <SelectItem
                value="8"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 8 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                8. Klasse
              </SelectItem>
              <SelectItem
                value="9"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 9 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                9. Klasse
              </SelectItem>
              <SelectItem
                value="10"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 10 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                10. Klasse
              </SelectItem>
              <SelectSeparator className="dark:bg-neutral-800 h-[1px]" />
              <SelectItem
                value="11"
                className={cn(
                  "cursor-pointer dark:hover:bg-neutral-800",
                  search.grade === 11 &&
                    "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                )}
              >
                11. Klasse
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              scrollToTop()
              setSearch({ ...search, day: value as Day })
            }}
            value={search.day ?? ""}
          >
            <SelectTrigger className="w-[150px] md:w-[250px] focus:ring-0 bg-slate-200 dark:bg-background border-slate-300 border-none">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent
              className="border-slate-200 cursor-pointer z-[60] dark:bg-background dark:border-neutral-800 dark:text-foreground"
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
                    }}
                  >
                    <X className="w-6 h-6 p-1" />
                    Alle Tage
                  </div>
                  <SelectSeparator className="dark:bg-neutral-800" />
                </>
              )}
              {days.map((day) => (
                <SelectItem
                  key={day}
                  value={day}
                  className={cn(
                    "cursor-pointer dark:hover:bg-neutral-800",
                    search.day === day &&
                      "bg-slate-100 dark:bg-primary dark:text-primary-foreground"
                  )}
                >
                  {lookUpDay[day as Day]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover open={teachersOpen} onOpenChange={setTeachersOpen}>
            <PopoverTrigger asChild>
              <span
                className="w-[250px] md:w-[250px] justify-between px-4 transition cursor-pointer text-sm items-center flex rounded-md h-10 bg-slate-200 dark:bg-background hover:bg-slate-300 border text-gray-900 border-slate-300 border-none dark:text-foreground"
                aria-label="Lehrer auswählen"
              >
                {search.teacher
                  ? teachers.find((teacher) => teacher.name === search.teacher)
                      ?.name
                  : "Wähle einen Lehrer..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 dark:border-neutral-800">
              <Command className="dark:bg-background dark:text-foreground">
                <CommandInput
                  placeholder="Lehrer suchen..."
                  className="placeholder:text-primary"
                />
                <CommandEmpty>Kein Lehrer gefunden.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {teachers?.length > 0 &&
                      teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          className="cursor-pointer"
                          value={teacher.name}
                          onSelect={(currentValue) => {
                            scrollToTop()
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
