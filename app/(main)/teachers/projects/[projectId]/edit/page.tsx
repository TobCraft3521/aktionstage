"use client"
import ChangeHint from "@/components/global/change-hint"
import Loader from "@/components/global/loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDebounce } from "@/hooks/use-debounce"
import {
  queryAllTeacherLoads,
  queryTeachers,
} from "@/lib/actions/queries/accounts"
import { queryProject } from "@/lib/actions/queries/projects"
import { queryRooms } from "@/lib/actions/queries/rooms"
import { ProjectEditSchema } from "@/lib/form-schemas"
import {
  isCurrentUser,
  isTeacherAlreadyAdded,
  isTeacherAvailable,
  wasPreviouslyAdded,
} from "@/lib/helpers/availability"
import { isValidImage } from "@/lib/helpers/image"
import { ChangedFields, getChangedFields } from "@/lib/helpers/projectchanges"
import { cn } from "@/lib/utils"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Account, Day, Project, Role, Room } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { Ban, Check, ChevronsUpDown, Info, Plus, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import RangeSlider from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"
import { z } from "zod"
import "./range-slider-styles.css"
import { RoomWithProjectsWithParticipants } from "@/lib/types"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["800"],
})

type Props = {}

type FormData = z.infer<typeof ProjectEditSchema>

const fieldLabels = {
  title: "Titel",
  description: "Beschreibung",
  banner: "Bild",
  emoji: "Emoji",
  teachers: "Lehrer",
  minGrade: "Jahrgangsstufen (Minimum)",
  maxGrade: "Jahrgangsstufen (Maximum)",
  maxStudents: "Schülerlimit",
  location: "Ort",
  price: "Preis",
  time: "Zeit",
  date: "Tag",
}

const ProjectEditor = ({}: Props) => {
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fileTooLarge, setFileTooLarge] = useState(false)
  const [replacingImage, setReplacingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  // Custom image URL logic
  const [imgUrl, setImgUrl] = useState<string | undefined>()
  const debouncedUrl = useDebounce<string | undefined>(imgUrl, 500)
  const [imgError, setImgError] = useState<string | undefined>()
  // Preview changed fields
  const [changedFields, setChangedFields] = useState<
    ChangedFields | undefined
  >()
  // Front end day validation (whether or not already a project on each day)
  const [allTeacherLoads, setAllTeacherLoads] = useState<Record<
    string,
    Day[]
  > | null>(null)
  const [day, setDay] = useState<Day | undefined>()
  // Room logic
  const [rooms, setRooms] = useState<RoomWithProjectsWithParticipants[]>([])
  const [isRoomSelectOpen, setIsRoomSelectOpen] = useState(false)
  const [room, setRoom] = useState<
    RoomWithProjectsWithParticipants | undefined
  >()

  const [replacingLocation, setReplacingLocation] = useState(false)
  // Teacher adding logic
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false)
  const [addedTeachers, setAddedTeachers] = useState<Account[]>([])
  const [teachers, setTeachers] = useState<Account[]>([])
  // Time logic
  const [timeFrom, setTimeFrom] = useState("")
  const [timeTo, setTimeTo] = useState("")
  // auth
  const user = useSession()
  // Because otherwise every button triggers a submit, even the ones from external libraries
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { projectId } = useParams() as { projectId: string }
  const router = useRouter()

  const { data: project, isPending } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const project = await queryProject(projectId)
      if (!project) return null
      setValue("title", project.name)
      setValue("description", project.description)
      setValue("banner", project.imageUrl) // Only takes effect when overwritten, otherwise ignored on backend
      setValue("emoji", project.emoji)
      setValue("maxStudents", project.maxStudents)
      setValue("minGrade", project.minGrade)
      setValue("maxGrade", project.maxGrade)
      setValue("location", project.location)
      setValue("price", project.price)
      setValue("date", project.day)
      setValue("time", project.time)
      setPreviewUrl(project?.imageUrl)
      setTimeFrom(project.time.split("-")[0])
      setTimeTo(project.time.split("-")[1])
      setDay(project.day)
      // exclude the current teacher from the list of teachers
      const otherTeachers = project.participants.filter((t) => {
        return (
          t.id !== user.data?.user.id &&
          (t.role === "TEACHER" || t.role === "ADMIN")
        )
      })
      setAddedTeachers(otherTeachers)
      // the form value teachers includes the current teacher, the rendered teachers list does not (addedTeachers)
      setValue(
        "teachers",
        project.participants
          .filter((t) => t.role === Role.TEACHER || t.role == Role.ADMIN)
          .map((t) => t.id || "should have been fetched with id")
      )
      return project
    },
    // otherwise runs before session is loaded
    enabled: user.status === "authenticated",
  })

  const {
    // handleSubmit, // doesnt work because all external ui elements would trigger a submit -> custom submit
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof ProjectEditSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProjectEditSchema),
    defaultValues: {},
  })

  // Fetch teachers from the server
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await queryTeachers()
      setTeachers(teachers)
    }
    fetchTeachers()
  }, [])

  // Fetch teacher load for each day (front end validation, server side validation on submit)
  useEffect(() => {
    const fetchAllTeacherLoads = async () => {
      // query whether or not a teacher already has a project on each day of the Aktionstage
      const teacherLoads = await queryAllTeacherLoads()
      setAllTeacherLoads(teacherLoads)
    }
    fetchAllTeacherLoads()
  }, [])

  useEffect(() => {
    const fetchRooms = async () => {
      // query rooms
      const rooms = await queryRooms()
      setRooms(rooms)
    }
    fetchRooms()
    // fresh data on page load
  }, [])

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

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      body: formData,
    })
    const { redirectUrl } = await res.json()
    if (redirectUrl) {
      router.push(redirectUrl)
    }
    // Redirects anyways
    setIsSubmitting(false)
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

  const handleEmojiSelect = (emoji: string) => {
    setValue("emoji", emoji) // Update the form value for the emoji field
  }

  // For live updates, eg preview image and title + for live changes preview
  const formValues = watch()

  const debouncedFormValues = useDebounce(formValues, 500)

  useEffect(() => {
    if (!debouncedFormValues) return
    if (!project) return
    const changedFields = getChangedFields(project, debouncedFormValues)
    setChangedFields(changedFields)
  }, [debouncedFormValues, project])

  // Add a teacher
  const addTeacher = (teacher: Account) => {
    if (!addedTeachers.find((t) => t.id === teacher.id)) {
      setAddedTeachers((prev) => [...prev, teacher])
    }
    setValue(
      "teachers",
      // addition is needed as the state update is async
      [
        ...addedTeachers,
        teacher,
        // current teacher
        ...(project?.participants || []).filter(
          (t) => t.id === user.data?.user.id
        ),
      ].map((t) => t.id || "should have been fetched with id")
    )
  }

  // Remove a teacher
  const removeTeacher = (id: string) => {
    setAddedTeachers((prev) => prev.filter((t) => t.id !== id))
    setValue(
      "teachers",
      [
        ...addedTeachers,
        // current teacher
        ...(project?.participants || []).filter(
          (t) => t.id === user.data?.user.id
        ),
      ]
        // filter is needed as the state update is async
        .filter((t) => t.id !== id)
        .map((t) => t.id || "should have been fetched with id")
    )
  }

  const hasChanges = Object.values(changedFields ?? {}).includes(true)

  if (isPending)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5 mb-10">
      <form onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-xl font-bold mb-4">Projekt bearbeiten</h1>
        <Separator className="my-8 h-[0.5px]" />
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Titel
            {changedFields?.title && <ChangeHint>Änderung</ChangeHint>}
          </h2>
          <Input {...register("title")} placeholder="Titel" />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Beschreibung
            {changedFields?.description && <ChangeHint>Änderung</ChangeHint>}
          </h2>
          <Textarea {...register("description")} placeholder="Beschreibung" />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        {/* Image change (or leave) */}
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Bild Upload
            {changedFields?.banner && <ChangeHint>Änderung</ChangeHint>}
          </h2>
          {replacingImage && (
            // either url or upload
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
                {/* fileTooLarge is also validated server side */}
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
              {replacingImage && (
                <div className="">
                  ℹ️ Das alte Bild wird nach dem Speichern ersetzt.
                </div>
              )}
            </Tabs>
          )}
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
          {!replacingImage && (
            <div className="mx-auto w-32">
              <Button
                onClick={() => {
                  setReplacingImage(true)
                  setValue("banner", "")
                  setPreviewUrl(undefined)
                }}
                className="mt-4 w-32"
              >
                Bild ersetzen
              </Button>
            </div>
          )}
        </div>
        <Separator className="my-8 h-[0.5px]" />
        {/* emojiii */}
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Emoji
            {changedFields?.emoji && <ChangeHint>Änderung</ChangeHint>}
          </h2>
          <div className="relative flex justify-center items-center mb-4">
            <Popover>
              <PopoverTrigger>
                <div className="cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center bg-gray-100">
                  <span className="text-3xl">{getValues("emoji") || "⌛"}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                side="right"
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
            <p className="text-red-500 text-sm mt-1">{errors.emoji.message}</p>
          )}
        </div>
        <Separator className="my-8 h-[0.5px]" />
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Tag {changedFields?.date && <ChangeHint>Änderung</ChangeHint>}
          </h2>
          <div className="p-4 border-slate-200 border rounded-lg inline-block mb-2">
            <ToggleGroup
              type="single"
              onValueChange={(value) => {
                setDay(value as Day)
                // reset room choice
                setRoom(undefined)
                setValue("location", "", { shouldValidate: true }) // reset custom location
                setReplacingLocation(true)
                setValue("date", value as Day, { shouldValidate: true })
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
                    className={
                      !getValues("teachers")?.every((teacher) => {
                        const isFree = isTeacherAvailable(
                          teacher,
                          day,
                          allTeacherLoads ?? {}
                        )
                        // console.log(isFree, teacher.name, day)
                        return isFree
                      })
                        ? "cursor-not-allowed"
                        : ""
                    }
                  >
                    <ToggleGroupItem
                      value={day}
                      aria-label={`Wechseln zu ${dayNames[day]}`}
                      disabled={
                        !getValues("teachers")?.every((teacher) =>
                          isTeacherAvailable(
                            teacher,
                            day,
                            allTeacherLoads ?? {}
                          )
                        )
                      } // allow to change back to the same day
                    >
                      {dayNames[day]}
                    </ToggleGroupItem>
                  </div>
                )
              })}
            </ToggleGroup>
          </div>
          <p className="">
            ℹ️ Verfügbarkeit der Lehrer beachten, falls nötig weitere Lehrer
            entfernen.
          </p>
        </div>

        {errors.date && <p className="text-red-500">{errors.date.message}</p>}
        <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
          Zeitraum {changedFields?.time && <ChangeHint>Änderung</ChangeHint>}
        </h2>
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

        <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
          Ort {changedFields?.location && <ChangeHint>Änderung</ChangeHint>}
        </h2>
        {replacingLocation ? (
          <Tabs defaultValue="room" className="w-[400px] mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="room"
                onClick={() => {
                  setValue("location", "", {
                    shouldValidate: true,
                  }) // reset custom location
                  setRoom(undefined)
                }}
              >
                Am ASG
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  setValue("location", "", {
                    shouldValidate: true,
                  }) // reset custom location
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
                                          (p) =>
                                            p.day === day &&
                                            !(p.id === project?.id)
                                        ) /* selected or taken by (other) project */
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
                                        "ASG " + cRoom.name,
                                        {
                                          shouldValidate: true,
                                        }
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
                                          (p) =>
                                            p.day === day &&
                                            !(p.id === project?.id)
                                        )
                                          ? ""
                                          : "hidden"
                                      )}
                                    />
                                    {cRoom.name}
                                    {cRoom.projects?.find(
                                      (p) =>
                                        p.day === day && !(p.id === project?.id)
                                    ) &&
                                      " (belegt: " +
                                        cRoom.projects?.find(
                                          (p) => p.day === day
                                        )?.name +
                                        ", " +
                                        (cRoom.projects
                                          ?.find((p) => p.day === day)
                                          ?.participants.filter(
                                            (p) =>
                                              p.role === Role.TEACHER ||
                                              p.role === Role.ADMIN
                                          )?.[0]?.name || "unbekannt") +
                                        ")"}
                                    {cRoom.projects?.find(
                                      (p) =>
                                        p.id === project?.id && p.day === day
                                    ) && " (bisheriger Raum)"}
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
        ) : (
          <Button onClick={() => setReplacingLocation(true)}>Ort ändern</Button>
        )}
        <Separator className="my-8 h-[0.5px]" />
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Lehrer{" "}
            {changedFields?.teachers && <ChangeHint>Änderung</ChangeHint>}
          </h2>
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
              <p className="text-slate-500">Keine anderen Lehrer mehr.</p>
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
                          ((isTeacherAlreadyAdded(id, addedTeachers) ||
                            !isTeacherAvailable(id, day, allTeacherLoads)) && // Using the isTeacherFreeOnDay helper
                            !wasPreviouslyAdded(
                              id,
                              project?.participants || [],
                              addedTeachers
                            )) ||
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
                                  ? // To keep spacing consistent
                                    "opacity-100"
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
        <Separator className="my-8 h-[0.5px]" />
        {/* Details */}
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Jahrgangsstufen{" "}
            {(changedFields?.minGrade || changedFields?.maxGrade) && (
              <ChangeHint>Änderung</ChangeHint>
            )}
          </h2>
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
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Schülerlimit{" "}
            {changedFields?.maxStudents && <ChangeHint>Änderung</ChangeHint>}
          </h2>
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
          <h2 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
            Kosten {changedFields?.price && <ChangeHint>Änderung</ChangeHint>}
          </h2>
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
        <Separator className="my-8 h-[0.5px]" />
        {hasChanges && (
          <Alert className="border-yellow-500 text-yellow-500">
            <Info className="h-4 w-4" color="#eab308" />
            <AlertTitle>Änderungen</AlertTitle>
            <AlertDescription>
              Es wurden die Felder{" "}
              {Object.entries(changedFields ?? {})
                .filter(([field, changed]) => changed)
                .map(
                  ([field]) => fieldLabels[field as keyof typeof fieldLabels]
                )
                .join(", ")}{" "}
              geändert.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mt-8">
          <Button variant={"secondary"}>Abbrechen</Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              onSubmit(getValues())
              // console.log(errors)
            }}
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {!isSubmitting ? "Speichern" : <Loader />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProjectEditor
