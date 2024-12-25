"use client"

import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
} from "@/components/ui/command"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock teacher database
const mockTeachers = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Emily Johnson" },
  { id: 4, name: "Michael Brown" },
]

export default function TeacherSelector() {
  const [search, setSearch] = useState({ teacher: "" })
  const [teachersOpen, setTeachersOpen] = useState(false)
  const [addedTeachers, setAddedTeachers] = useState<any[]>([])

  // Add a teacher
  const addTeacher = (teacher: any) => {
    if (!addedTeachers.find((t) => t.id === teacher.id)) {
      setAddedTeachers((prev) => [...prev, teacher])
    }
    setSearch({ teacher: "" })
  }

  // Remove a teacher
  const removeTeacher = (id: number) => {
    setAddedTeachers((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Add Co-Working Teachers</h2>

      {/* Display Added Teachers */}
      <div className="flex flex-wrap gap-2">
        {addedTeachers.length > 0 ? (
          addedTeachers.map((teacher) => (
            <Badge
              key={teacher.id}
              variant="outline"
              className="flex items-center gap-2 px-3 py-1"
            >
              {teacher.name}
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => removeTeacher(teacher.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-gray-500">No teachers added yet.</p>
        )}
      </div>

      {/* Teacher Search Popover */}
      <Popover open={teachersOpen} onOpenChange={setTeachersOpen}>
        <PopoverTrigger asChild>
          <Button>Add Teacher</Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search teachers..." />
            <CommandEmpty>No teachers found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {mockTeachers.length > 0 &&
                  mockTeachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      className={cn(
                        "cursor-pointer",
                        addedTeachers.find((t) => t.id === teacher.id)
                          ? "opacity-50 pointer-events-none"
                          : ""
                      )}
                      value={teacher.name}
                      onSelect={(currentValue) => {
                        if (currentValue === teacher.name) {
                          addTeacher(teacher)
                          setTeachersOpen(false)
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          addedTeachers.find((t) => t.id === teacher.id)
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
