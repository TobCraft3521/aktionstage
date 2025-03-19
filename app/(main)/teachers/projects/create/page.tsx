"use client"

import Loader from "@/components/global/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDebounce } from "@/hooks/use-debounce"
import { suggestEmoji } from "@/lib/actions/ai/emoji-sug"
import {
  queryAllTeacherLoads,
  queryTeachers,
} from "@/lib/actions/queries/accounts"
import { queryRooms } from "@/lib/actions/queries/rooms"
import { CreateProjectSchema } from "@/lib/form-schemas"
import {
  isCurrentUser,
  isTeacherAlreadyAdded,
  isTeacherAvailable,
} from "@/lib/helpers/availability"
import { isValidImage } from "@/lib/helpers/image"
import { cn } from "@/lib/utils"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Account, Day, Project, Role, Room } from "@prisma/client"
import {
  Ban,
  Check,
  ChevronsUpDown,
  PartyPopper,
  Plus,
  Trash2,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import { useRouter } from "next/navigation"
import posthog from "posthog-js"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import RangeSlider from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"
import { v4 as uuid } from "uuid"
import { z } from "zod"
import "./range-slider-styles.css"
import { RoomWithProjectsWithParticipants } from "@/lib/types"

const dmSans = DM_Sans({
  weight: "800",
  subsets: ["latin"],
})
type FormData = z.infer<typeof CreateProjectSchema>

const MultiStepForm = () => {
  // Multi step form logic
  const [step, setStep] = useState(0)
  const validPages = useRef<boolean[]>(new Array(5).fill(false)) // Track valid pages
  // Custom image URL logic
  const [imgUrl, setImgUrl] = useState<string | undefined>()
  const debouncedUrl = useDebounce(imgUrl, 500)
  const [imgError, setImgError] = useState<string | undefined>()
  // File upload logic
  const [fileTooLarge, setFileTooLarge] = useState(false)
  // Other banner logic
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  // Teacher adding logic
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false)
  const [addedTeachers, setAddedTeachers] = useState<Account[]>([])
  const [teachers, setTeachers] = useState<Account[]>([])
  // Time logic
  const [timeFrom, setTimeFrom] = useState("")
  const [timeTo, setTimeTo] = useState("")
  // Front end day validation (whether or not already a project on each day)
  const [allTeacherLoads, setAllTeacherLoads] = useState<Record<
    string,
    Day[]
  > | null>(null)
  const [personalLoad, setPersonalLoad] = useState<Day[] | null>(null)
  const [day, setDay] = useState<Day | undefined>()
  // Room logic
  const [rooms, setRooms] = useState<RoomWithProjectsWithParticipants[]>([])
  const [isRoomSelectOpen, setIsRoomSelectOpen] = useState(false)
  const [room, setRoom] = useState<
    RoomWithProjectsWithParticipants | undefined
  >()
  // auth
  const user = useSession()
  // other
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Analytics
  const [sessionTracker, setSessionTracker] = useState<string | undefined>()
  useEffect(() => {
    // Provide a unique session tracker for each project creation session
    if (sessionTracker) return
    const sessionTrackerL = uuid()
    setSessionTracker(sessionTrackerL)
    posthog.capture("project_creation_session_started", {
      sessionTrackerL,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps: { label: string; fields: (keyof FormData)[] }[] = [
    { label: "Titel", fields: ["title"] },
    { label: "Details", fields: ["description", "banner"] },
    { label: "Emoji", fields: ["emoji"] },
    {
      label: "Zeit und Ort",
      fields: ["date", "time", "location"],
    },
    { label: "Lehrer", fields: ["teachers"] },
    {
      label: "Sonstiges",
      fields: ["price", "maxStudents", "minGrade", "maxGrade"],
    },
  ]

  // Dynamically handle forms for each step
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(CreateProjectSchema),
    mode: "onTouched",
    defaultValues: {
      // otherwise not set unless touched
      minGrade: 5,
      maxGrade: 11,
    },
  })

  // Handle Next button click
  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const isValidStep = await trigger(steps[step].fields) // Validate current step fields
    if (isValidStep) {
      // Auto suggest emoji after the first step
      if (step === 0) {
        setTimeout(async () => {
          try {
            validPages.current[2] = false // Mark the emoji step as invalid
            const res = await suggestEmoji(getValues("title") || "")
            const randomAlternative = Math.random() > 0.5 ? "🔮" : "🤗"
            let suggestedEmoji = res.emoji || randomAlternative
            setValue("emoji", suggestedEmoji)
            validPages.current[2] = true // Mark the emoji step as valid
          } catch (error) {
            console.error("Failed to suggest emoji:", error)
          }
        }, 1)
      }

      // Update the valid pages state
      validPages.current[step] = true // Mark the current page as valid
      setStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  // Handle Previous button click
  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setStep((prev) => Math.max(prev - 1, 0))
  }

  // Handle clicking step titles to navigate
  const handleStepClick = (index: number) => {
    if (validPages.current[index]) {
      setStep(index) // You can navigate to any valid step now
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("emoji", data.emoji)
    formData.append("date", data.date)
    formData.append("time", data.time)
    formData.append("location", data.location)
    formData.append("price", data.price.toString())
    formData.append("maxStudents", data.maxStudents.toString())
    formData.append("minGrade", data.minGrade.toString())
    formData.append("maxGrade", data.maxGrade.toString())
    formData.append("banner", data.banner)
    formData.append("teachers", (data.teachers || []).join(","))
    formData.append("room", room?.id || "")

    formData.append("sessionTracker", sessionTracker || "")

    const res = await fetch("/api/projects", {
      method: "POST",
      body: formData,
    })
    const { redirectUrl } = await res.json()
    if (redirectUrl) {
      router.push(redirectUrl)
    }

    // redirects to projects page anyway
    setIsSubmitting(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    setValue("emoji", emoji) // Update the form value for the emoji field
    validPages.current[2] = true // Mark the emoji step as valid
  }

  // Handle URL input change
  const handleImgUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgUrl(e.target.value)
  }

  // Validate URL asynchronously
  useEffect(() => {
    const validateUrl = async () => {
      if (debouncedUrl) {
        const isValid = await isValidImage(debouncedUrl)
        if (isValid) {
          // Register the valid URL with react-hook-form
          setValue("banner", debouncedUrl, { shouldValidate: true })
          setPreviewUrl(debouncedUrl)
          // Reset the error message
          setImgError(undefined)
        } else {
          // Set error message if the URL is invalid
          setImgError("Ungültiger Bild Link")
          setValue("banner", "", {
            shouldValidate: true,
          })
          setPreviewUrl(undefined)
        }
      }
    }
    // Trigger the validation after the debounced URL is updated
    if (debouncedUrl) {
      validateUrl()
    }
  }, [debouncedUrl, setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cFile = e.target.files?.[0]
    if (!cFile) return

    // Check file size (limit to 5MB) - also checked through presigned POST (server side)
    const MAX_SIZE_MB = 5
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    if (cFile.size > MAX_SIZE_BYTES) {
      setFileTooLarge(true)
      setValue("banner", "", {
        shouldValidate: true,
      })
      setPreviewUrl(undefined)
      return
    }

    setFileTooLarge(false)
    setValue("banner", cFile, {
      shouldValidate: true,
    })
    setPreviewUrl(URL.createObjectURL(cFile))
  }

  // Add a teacher
  const addTeacher = (teacher: Account) => {
    if (!addedTeachers.find((t) => t.id === teacher.id)) {
      setAddedTeachers((prev) => [...prev, teacher])
    }
    setValue(
      "teachers",
      // addition is needed as the state update is async
      [...addedTeachers, teacher].map(
        (t) => t.id || "should have been fetched with id"
      )
    )
  }

  // Remove a teacher
  const removeTeacher = (id: string) => {
    setAddedTeachers((prev) => prev.filter((t) => t.id !== id))
    setValue(
      "teachers",
      addedTeachers
        // filter is needed as the state update is async
        .filter((t) => t.id !== id)
        .map((t) => t.id || "should have been fetched with id")
    )
  }

  // Fetch teachers from the server
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await queryTeachers()
      setTeachers(teachers)
    }
    fetchTeachers()
  }, [])

  // Handle time input
  const handleTime = (from: string, to: string) => {
    // combine the two time inputs
    if (from.length === 0 || to.length === 0) {
      // smart no-error-on-initial-load approach: look at the "old" combined value -> thats only empty on initial load
      if (!getValues("time")) return
      setValue("time", "", {
        shouldValidate: true,
      })
      return
    }
    const time = `${from}-${to}`
    setValue("time", time, {
      shouldValidate: true,
    })
  }

  useEffect(() => {
    handleTime(timeFrom, timeTo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrom, timeTo])

  // Fetch teacher load for each day (front end validation, server side validation on submit)
  useEffect(() => {
    const fetchAllTeacherLoads = async () => {
      // query whether or not a teacher already has a project on each day of the Aktionstage
      const teacherLoads = await queryAllTeacherLoads()
      setAllTeacherLoads(teacherLoads)
      // personal teacher load, filter teacher load by current teacher by auth
      const currentTeacherLoad = teacherLoads?.[user.data?.user.id] || []
      setPersonalLoad(currentTeacherLoad)
    }
    fetchAllTeacherLoads()
  }, [user.data?.user.id])

  // Fetch rooms from the server
  const isStep4 = step === 4
  useEffect(() => {
    const fetchRooms = async () => {
      // query rooms
      const rooms = await queryRooms()
      setRooms(rooms)
    }
    fetchRooms()
    // fresh data on page load
  }, [isStep4])

  // Watch for form changes to keep the button disabled state correct
  const isCurrentStepValid = () => {
    const name = getValues("title") || "" // Default to empty string
    const description = getValues("description") || "" // Default to empty string
    const emoji = getValues("emoji") || "" // Default to empty string
    const maxStudents = getValues("maxStudents") || 0
    const minGrade = getValues("minGrade") || 5
    const maxGrade = getValues("maxGrade") || 11
    const location = getValues("location") || "" // Default to empty string
    const time = getValues("time") || "" // Default to empty string
    const date = getValues("date") || "" // Default to empty string
    const price = getValues("price") >= 0 ? getValues("price") : 0 // Ensure price is valid
    const banner = getValues("banner") || "" // Default to empty string
    if (Object.entries(errors).length > 0) return false
    if (step === 0) {
      // Front end validation for the name is enough - only teachers have access to this page and they can be trusted or at least blamed for hacking.
      const valid = name.length > 0 && name.length <= 32
      if (valid) {
        validPages.current[0] = true
      }
      return valid
    }
    if (step === 1) {
      const valid =
        description.length > 0 &&
        (typeof banner === "string"
          ? banner.length > 0
          : banner instanceof File)
      validPages.current[1] = valid
      return valid
    }
    if (step === 2) {
      const valid = emoji.length > 0
      validPages.current[2] = valid
      return valid
    }
    if (step === 3) {
      // Check date
      const valid =
        date.length > 0 &&
        time.length > 0 &&
        timeFrom.length > 0 &&
        timeTo.length > 0 &&
        location.length > 0
      validPages.current[4] = valid
      return valid
    }
    if (step === 4) {
      validPages.current[3] = true
      return true // No other teachers required [current teacher added server side]
    }
    if (step === 5) {
      // Check price, maxStudents, minGrade, maxGrade
      const valid =
        price >= 0 && maxStudents > 0 && minGrade >= 5 && maxGrade <= 11
      validPages.current[5] = valid
      return valid
    }
    return false
  }

  // Watch for form changes to keep the button disabled state correct
  const currentStepErrors = watch(steps[step].fields)
  const emoji = watch("emoji")

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5">
      <h1 className="text-xl font-bold mb-4">Projekt erstellen</h1>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={(step / (steps.length - 1)) * 100} />
      </div>

      {/* Step Titles */}
      <div className="flex justify-between text-sm mb-8">
        {steps.map((stepObj, index) => (
          <button
            key={index}
            className={`text-xs ${
              index === step
                ? "font-extrabold"
                : validPages.current[index]
                ? "font-bold text-slate-700"
                : "text-slate-500"
            }`}
            onClick={() => handleStepClick(index)}
          >
            {stepObj.label}
          </button>
        ))}
      </div>

      {/* Form Fields for the Current Step */}
      <form onSubmit={(e) => e.preventDefault()}>
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Name des Projekts</h2>
            <p className="text-gray-500 mb-4">
              Bitte auf eine schöne Formatierung achten und kürzere Namen
              bevorzugen <u>(Am besten nur ein Wort, zB Tennis)</u>. In der
              Beschreibung ist genug Platz.
            </p>
            <Input
              placeholder="Benenne dein Projekt"
              {...register("title")}
              className="mb-2"
              maxLength={32}
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
            <div className="w-[200px] h-[256px] bg-slate-900 rounded-[24px] mt-8 mx-auto drop-shadow-lg relative overflow-hidden">
              <Image
                // hard coded example banner
                src="https://images.pexels.com/photos/22484280/pexels-photo-22484280/free-photo-of-aerial-view-of-tennis-courts-and-park-in-miraflores-peru.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Example banner"
                width={200}
                height={256}
                className="object-cover rounded-[24px] w-full h-full"
                priority
              ></Image>
              <div className="absolute bottom-[9%] text-white text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-5">
                <h1
                  // split too long text into two lines
                  className={cn(
                    "max-w-[150px] break-words text-center",
                    dmSans.className
                  )}
                >
                  {getValues("title") || "Vorschau"}
                </h1>
                <div className="text-sm font-medium opacity-90">Vorschau</div>
              </div>
              <div
                className="absolute top-full bg-white w-[80%] h-[90px] block z-20 font-thin"
                style={{
                  filter: "drop-shadow(0 -85px 24px rgb(0 0 0 / 1))",
                }}
              ></div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Projekt Beschreibung
            </h2>
            <div className="mb-4">
              <Textarea
                placeholder="Description"
                {...register("description")}
                className="mb-2"
              />
              {errors.description && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>

            <h2 className="text-lg font-semibold mb-2">Bild Upload</h2>
            <p className="text-gray-500 mb-4">
              Bitte Mühe geben,{" "}
              <u>ein schönes, buntes und scharfes Bild zu wählen</u>, die Bilder
              stellen einen großen Teil der Seite dar.
            </p>
            {/* either url or upload */}
            <Tabs defaultValue="upload" className="w-[400px] mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="upload"
                  onClick={() => {
                    setImgUrl(undefined)
                    setValue("banner", "")
                    setPreviewUrl(undefined)
                  }}
                >
                  Hochladen
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  onClick={() => {
                    setValue("banner", "")
                    setPreviewUrl(undefined)
                    setFileTooLarge(false)
                  }}
                >
                  URL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <div className="flex flex-row gap-2">
                  <Input
                    title="Banner"
                    type="file"
                    accept="image/*"
                    className="mb-2"
                    onChange={handleFileChange}
                  />
                </div>
                {fileTooLarge && (
                  <p className="text-yellow-500">
                    ⚠️ Datei darf nicht über 5MB sein
                  </p>
                )}
              </TabsContent>
              <TabsContent value="url">
                <Input
                  placeholder="Banner URL"
                  title="Banner URL"
                  type="url"
                  onChange={handleImgUrlChange}
                  className="mb-2"
                />
                {imgError && <p className="text-yellow-500">{imgError}</p>}
              </TabsContent>
            </Tabs>

            {/* Preview of title + image */}
            {previewUrl && (
              <div className="w-[200px] h-[256px] bg-slate-900 rounded-[24px] mt-8 mx-auto drop-shadow-lg relative overflow-hidden">
                <Image
                  // hard coded example banner
                  src={previewUrl}
                  alt="Example banner"
                  width={200}
                  height={256}
                  className="object-cover rounded-[24px] w-full h-full"
                  priority
                ></Image>
                <div className="absolute bottom-[9%] text-white text-lg z-30 font-semibold w-full px-2 flex flex-col items-center leading-5">
                  <h1
                    // split too long text into two lines
                    className={cn(
                      "max-w-[150px] break-words text-center",
                      dmSans.className
                    )}
                  >
                    {getValues("title") || "Vorschau"}
                  </h1>
                  <div className="text-sm font-medium opacity-90">Vorschau</div>
                </div>
                <div
                  className="absolute top-full bg-white w-[80%] h-[90px] block z-20 font-thin"
                  style={{
                    filter: "drop-shadow(0 -85px 24px rgb(0 0 0 / 1))",
                  }}
                ></div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Wähle einen Emoji</h2>
            <p className="text-gray-500 mb-8">
              Oder wähle den, den die KI gewählt hat
            </p>
            <div className="relative flex justify-center items-center mb-4">
              <Popover>
                <PopoverTrigger>
                  <div className="cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center bg-gray-100">
                    <span className="text-3xl">{emoji || "⌛"}</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  sideOffset={40}
                  className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) =>
                      handleEmojiSelect(emoji.native)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.emoji && (
              <p className="text-red-500">{errors.emoji.message}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            {/* TODO: custom MON / TUE / WED picker */}
            <h2 className="text-lg font-semibold mt-4 mb-2">Tag</h2>
            <div className="p-4 border-slate-200 border rounded-lg inline-block mb-2">
              <ToggleGroup
                type="single"
                onValueChange={(value) => {
                  setDay(value as Day)
                  // reset room choice
                  setRoom(undefined)
                  setValue("location", "") // reset custom location
                  setValue("date", value as Day, { shouldValidate: true })
                  // reset added teachers
                  setAddedTeachers([])
                  setValue("teachers", [])
                }} // non empty
                value={getValues("date")}
              >
                {Object.values(Day).map((day) => {
                  const dayNames = {
                    [Day.MON]: "Montag",
                    [Day.TUE]: "Dienstag",
                    [Day.WED]: "Mittwoch",
                  }
                  return (
                    <div
                      key={day}
                      // blur on hover when already a project on that day
                      // className={personalLoad?.indexOf(day) === undefined ? "hover:blur-[1px]" : ""}
                      style={{
                        cursor: personalLoad?.includes(day)
                          ? "not-allowed"
                          : undefined,
                      }}
                    >
                      <ToggleGroupItem
                        value={day}
                        aria-label={`Wechseln zu ${dayNames[day]}`}
                        disabled={personalLoad?.includes(day)}
                      >
                        {dayNames[day]}
                      </ToggleGroupItem>
                    </div>
                  )
                })}
              </ToggleGroup>
            </div>

            {errors.date && (
              <p className="text-red-500">{errors.date.message}</p>
            )}

            <h2 className="text-lg font-semibold mb-2 mt-4">Zeitraum</h2>
            <div className="flex gap-4 items-center">
              <p className="">Von</p>
              <Input
                placeholder="zB. 7:55"
                onChange={(e) => {
                  setTimeFrom(e.target.value)
                }}
                value={timeFrom}
                className=""
              />
              <p className="">bis</p>
              <Input
                placeholder="zB. 12:55"
                onChange={(e) => {
                  setTimeTo(e.target.value)
                }}
                value={timeTo}
                className=""
              />
            </div>
            {errors.time && (
              <p className="text-red-500 mt-2">
                In beiden Zeitraum-feldern ist eine Eingabe benötigt.{" "}
              </p>
            )}

            <h2 className="text-lg font-semibold mt-4 mb-2">Ort</h2>
            <Tabs defaultValue="room" className="w-[400px] mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="room"
                  onClick={() => {
                    setValue("location", "") // reset custom location
                    setRoom(undefined)
                  }}
                >
                  Am ASG
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => {
                    setValue("location", "") // reset custom location
                    setRoom(undefined)
                  }}
                  value="custom"
                >
                  Freie Eingabe
                </TabsTrigger>
              </TabsList>
              <TabsContent value="room">
                <Card className="w-[400px]">
                  <CardHeader>
                    <CardTitle>Raum</CardTitle>
                    <CardDescription>Wähle einen Raum am ASG</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Popover
                      open={isRoomSelectOpen}
                      onOpenChange={setIsRoomSelectOpen}
                    >
                      <PopoverTrigger asChild className="w-full">
                        <Button
                          role="combobox"
                          className="w-[250px] md:w-full justify-between bg-slate-200 dark:bg-foreground hover:bg-slate-300 border text-gray-900 border-slate-300 border-none"
                        >
                          {room
                            ? rooms.find((cRoom) => cRoom.name === room.name)
                                ?.name
                            : "Wähle einen Raum..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" side="top">
                        <Command>
                          <CommandInput placeholder="Raum suchen..." />
                          <CommandEmpty>
                            Kein passender Raum gefunden.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {rooms?.length > 0 &&
                                rooms.map(
                                  (cRoom: RoomWithProjectsWithParticipants) => (
                                    <CommandItem
                                      key={cRoom.id}
                                      className={cn(
                                        "cursor-pointer",
                                        cRoom.id === room?.id ||
                                          cRoom.projects?.find(
                                            (p) => p.day === day
                                          ) /* selected or taken */
                                          ? "opacity-50 pointer-events-none"
                                          : ""
                                      )}
                                      value={cRoom.name}
                                      onSelect={(currentValue) => {
                                        setRoom(
                                          rooms.find(
                                            (r) => r.name === currentValue
                                          )
                                        )
                                        // rerendered server side (in case of room taken -> just asg)
                                        setValue(
                                          "location",
                                          "ASG " + cRoom.name
                                        )
                                        setIsRoomSelectOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          cRoom.id === room?.id ? "" : "hidden"
                                        )}
                                      />
                                      <Ban
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          cRoom.projects?.find(
                                            (p) => p.day === day
                                          )
                                            ? ""
                                            : "hidden"
                                        )}
                                      />
                                      {cRoom.name}
                                      {cRoom.projects?.find(
                                        (p) => p.day === day
                                      ) &&
                                        " (belegt: " +
                                          cRoom.projects?.find(
                                            (p) => p.day === day
                                          )?.name +
                                          ", " +
                                          (cRoom.projects
                                            ?.find((p) => p.day === day)
                                            ?.participants?.filter(
                                              (p) =>
                                                p.role === Role.TEACHER ||
                                                p.role === Role.ADMIN
                                            )?.[0]?.name || "unbekannt") +
                                          ")"}
                                    </CommandItem>
                                  )
                                )}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="custom">
                <Input
                  placeholder="Ort zB. unterwasser (beim Uboot fahren ;) )"
                  {...register("location")}
                  className="mb-2"
                />
              </TabsContent>
            </Tabs>

            {errors.location && (
              <p className="text-red-500">{errors.location?.message}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Lehrer Hinzufügen</h2>
            {/* Display Added Teachers */}
            <div className="flex flex-wrap gap-2 mb-3">
              {addedTeachers.length > 0 ? (
                addedTeachers.map((teacher) => (
                  <Badge
                    key={teacher.id}
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1 transition-all hover:bg-red-100 hover:border-red-500 cursor-no-drop"
                    onClick={() => removeTeacher(teacher.id || "")}
                  >
                    {teacher.name}
                    <span className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500">Noch keine anderen Lehrer.</p>
              )}
            </div>
            {/* Teacher Search Popover */}
            <Popover
              open={isTeacherSelectOpen}
              onOpenChange={setIsTeacherSelectOpen}
            >
              <PopoverTrigger
                className={cn("", addedTeachers.length < 2 && "w-8")}
                disabled={addedTeachers.length >= 2}
              >
                {addedTeachers.length < 2 ? (
                  <Button className="rounded-lg px-4 bg-slate-100 p-2 cursor-pointer hover:bg-slate-200">
                    <Plus className="text-slate-500" />
                  </Button>
                ) : (
                  // 2/2 reached
                  <span className="bg-slate-100 p-2 mt-2 rounded-lg text-sm">
                    ⚠️ 2/2 weiteren Lehrern
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search teachers..." />
                  <CommandEmpty>No teachers found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {teachers.length > 0 &&
                        teachers.map((teacher: Account) => {
                          const { id, name } = teacher
                          if (!id || !allTeacherLoads || !day) {
                            return null // Skip rendering if there's no valid ID
                          }
                          // Check if the teacher is unavailable, already added, or assigned
                          const isDisabled =
                            isTeacherAlreadyAdded(id, addedTeachers) ||
                            !isTeacherAvailable(id, day, allTeacherLoads)
                          // Using the isTeacherFreeOnDay helper
                          isCurrentUser(id, user.data?.user.id)

                          return (
                            <CommandItem
                              key={id}
                              disabled={isDisabled} // Use disabled prop
                              value={name}
                              onSelect={(currentValue) => {
                                if (currentValue === name) {
                                  addTeacher(teacher)
                                  setIsTeacherSelectOpen(false)
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isTeacherAlreadyAdded(id, addedTeachers)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {name}
                            </CommandItem>
                          )
                        })}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.teachers && (
              <p className="text-red-500">{errors.teachers.message}</p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            {/* min/max grade */}
            <h2 className="text-lg font-semibold mt-4 mb-2">Jahrgangsstufen</h2>
            <p className="text-gray-500 mb-8">
              Wähle die Jahrgangsstufen für dein Projekt
            </p>
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
              <div className="flex justify-between mx-2">
                <span>{getValues("minGrade") || 5}. Klasse</span>
                <span>{getValues("maxGrade") || 11}. Klasse</span>
              </div>
              <div className="w-full">
                <RangeSlider
                  min={5}
                  max={11}
                  step={1}
                  // keep default values in sync with the form values when switching steps
                  defaultValue={[
                    getValues("minGrade") || 5,
                    getValues("maxGrade") || 11,
                  ]}
                  id="rangeSlider"
                  onInput={(values: any) => {
                    setValue("minGrade", values[0])
                    setValue("maxGrade", values[1])
                  }}
                />
              </div>
            </div>
            {(errors.minGrade || errors.maxGrade) && (
              <p className="text-red-500">
                {errors.minGrade?.message || errors.maxGrade?.message}
              </p>
            )}

            {/* max students */}
            <h2 className="text-lg font-semibold mt-8 mb-2">Schülerlimit</h2>
            <Input
              placeholder="Maximale Schüleranzahl"
              {...register("maxStudents", { valueAsNumber: true })}
              type="number"
              className="mb-2"
            />
            {errors.maxStudents && (
              <p className="text-red-500">{errors.maxStudents.message}</p>
            )}

            {/* price */}
            <h2 className="text-lg font-semibold mt-8 mb-2">Kosten</h2>
            <Input
              placeholder="Preis"
              {...register("price", { valueAsNumber: true })}
              type="number"
              className="mb-2"
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button onClick={handlePrev} variant="secondary" type="button">
              Zurück
            </Button>
          ) : (
            <Button
              onClick={() => router.back()}
              variant="secondary"
              type="button"
            >
              Zurück
            </Button>
          )}

          {step === steps.length - 1 ? (
            <Button
              onClick={() => onSubmit(getValues())}
              disabled={
                !isCurrentStepValid() ||
                !validPages.current.every((v) => v) ||
                Object.entries(errors).length > 0 ||
                isSubmitting
              }
              className="flex items-center gap-2"
            >
              {!isSubmitting ? (
                <>
                  Fertig <PartyPopper size={16} />
                </>
              ) : (
                <Loader />
              )}
            </Button>
          ) : (
            <Button
              disabled={!isCurrentStepValid()}
              onClick={handleNext}
              type="button"
            >
              Weiter
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default MultiStepForm
