"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { suggestEmoji } from "@/lib/actions/ai/emoji-sug"
import { getPresignedUploadPost } from "@/lib/actions/aws/upload"
import { queryTeachers } from "@/lib/actions/queries/accounts"
import { cn } from "@/lib/utils"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Account, Day } from "@prisma/client"
import { Check, Loader2Icon, Plus, Trash, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Define the form schema
const schema = z.object({
  title: z.string().min(1, "Kein Name angegeben"),
  description: z.string().min(1, "Keine Beschreibung angegeben"),
  banner: z.string().min(1, "Kein Bild hochgeladen"),
  emoji: z.string().min(1, "Kein Emoji ausgewählt"),
  teachers: z.array(z.string()).optional().default([]),
  maxStudents: z.number().min(1, "Mindestens 1 Schüler ist erforderlich"),
  minGrade: z.number().min(5, "Ungültige Jahrgangsstufen"),
  maxGrade: z.number().min(11, "Ungültige Jahrgangsstufen"),
  location: z.string().min(1, "Kein Ort angegeben"),
  price: z.number().min(0, "Preis muss größer oder gleich 0 sein"),
  time: z.string().min(1, "Keine Zeit angegeben"),
  date: z.enum([Day.MON, Day.TUE, Day.WED]),
})

type FormData = z.infer<typeof schema>

const MultiStepForm = () => {
  // Multi step form logic
  const [step, setStep] = useState(0)
  const validPages = useRef<boolean[]>(new Array(5).fill(false)) // Track valid pages
  // File upload logic
  const [file, setFile] = useState<File | null>(null)
  const [fileTooLarge, setFileTooLarge] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileUploadError, setFileUploadError] = useState<string | undefined>()
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false)
  // Teacher adding logic
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false)
  const [addedTeachers, setAddedTeachers] = useState<Partial<Account>[]>([])
  const [teachers, setTeachers] = useState<Partial<Account>[]>([])

  const steps: { label: string; fields: (keyof FormData)[] }[] = [
    { label: "Titel", fields: ["title"] },
    { label: "Details", fields: ["description", "banner"] },
    { label: "Emoji", fields: ["emoji"] },
    { label: "Lehrer", fields: ["teachers"] },
    {
      label: "Zeit und Ort",
      fields: ["date", "time", "location"],
    },
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
    resolver: zodResolver(schema),
    mode: "onTouched",
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
            setValue("emoji", "⌛") // Clear the emoji field
            const suggestedEmoji = (
              await suggestEmoji(getValues("title") || "")
            ).emoji
            setValue("emoji", suggestedEmoji)
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

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    alert("Form submitted! Check the console.")
  }

  const handleEmojiSelect = (emoji: string) => {
    setValue("emoji", emoji) // Update the form value for the emoji field
    validPages.current[2] = true // Mark the emoji step as valid
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(undefined)
    setFileUploadSuccess(false)
    const cFile = e.target.files?.[0]

    if (!cFile) return
    setFile(cFile)

    // Check file size (limit to 5MB) - also checked through presigned POST (server side)
    const MAX_SIZE_MB = 5
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    if (cFile.size > MAX_SIZE_BYTES) {
      setFileTooLarge(true)
      return
    }

    setFileTooLarge(false)
  }

  const handleUpload = async () => {
    if (!file) {
      setFileUploadError("[will be replaced]")
      return
    }

    setIsUploading(true)
    setFileUploadError(undefined)

    try {
      // Call the server action to get presigned POST data
      const {
        url,
        fields,
        publicUrl,
        error: serverError,
      } = await getPresignedUploadPost(file.type)

      if (serverError) {
        setFileUploadError("[Failed to get upload URL. - will be replaced]")
        console.error(serverError)
        setIsUploading(false)
        return
      }

      // Prepare form data
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value) // Add all fields from presigned POST
      })
      formData.append("file", file) // Add the file

      // Perform the POST request
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setFileUploadError(`[Upload failed: ${errorText}] - will be replaced`)
        console.error("Upload failed:", errorText)
      } else {
        setFileUploadSuccess(true)
        console.log("File uploaded successfully!")
        setValue("banner", publicUrl)
      }
    } catch (err) {
      console.error(err)
      setFileUploadError(
        "[An error occurred during the upload.] - will be replaced"
      )
    } finally {
      setIsUploading(false)
    }
  }

  // Add a teacher
  const addTeacher = (teacher: Partial<Account>) => {
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
    console.log("test")
    const fetchTeachers = async () => {
      const teachers = await queryTeachers()
      console.log(teachers)
      setTeachers(teachers)
    }
    fetchTeachers()
  }, [])

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

    if (step === 0) {
      const valid = name.length > 0
      if (valid) {
        validPages.current[0] = true
      }
      return valid
    }
    if (step === 1) {
      const valid = description.length > 0 && banner.length > 0
      validPages.current[1] = valid
      return valid
    }
    if (step === 2) {
      const valid = emoji.length > 0
      validPages.current[2] = valid
      return valid
    }
    if (step === 3) {
      validPages.current[3] = true
      return true // No other teachers required
    }
    if (step === 4) {
      // Check date
      const valid = date.length > 0 && time.length > 0 && location.length > 0
      validPages.current[4] = valid
      return valid
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
            <Input
              placeholder="Benenne dein Projekt"
              {...register("title")}
              className="mb-2"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Projekt Beschreibung
            </h2>
            <Textarea
              placeholder="Description"
              {...register("description")}
              className="mb-2"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Banner Upload</h2>
            {/* either url or upload */}
            <Tabs defaultValue="upload" className="w-[400px] mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Hochladen</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
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
                  {/* fileTooLarge is also validated server side */}
                  <Button
                    disabled={
                      !file || fileTooLarge || isUploading || fileUploadSuccess
                    }
                    onClick={handleUpload}
                  >
                    {!fileUploadSuccess &&
                      !fileUploadError &&
                      !isUploading &&
                      "Hochladen"}
                    {fileUploadError && "Fehler"}
                    {fileUploadSuccess && <Check />}
                    {isUploading && <Loader2Icon className="animate-spin" />}
                  </Button>
                </div>
                {fileTooLarge && (
                  <p className="text-yellow-500">
                    ⚠️ Datei darf nicht über 5MB sein
                  </p>
                )}
                {fileUploadError && (
                  <p className="text-red-500">‼️ Fehler beim Hochladen</p>
                )}
              </TabsContent>
              <TabsContent value="url">
                <Input
                  placeholder="Banner URL"
                  title="Banner URL"
                  type="url"
                  {...register("banner")}
                  className="mb-2"
                />
              </TabsContent>
            </Tabs>
            {errors.banner && (
              <p className="text-red-500">{errors.banner.message}</p>
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
                <p className="text-slate-500">Noch keine anderen Leher.</p>
              )}
            </div>
            {/* Teacher Search Popover */}
            <Popover
              open={isTeacherSelectOpen}
              onOpenChange={setIsTeacherSelectOpen}
            >
              <PopoverTrigger asChild className="w-32">
                <div>
                  <Button className="rounded-lg px-4 bg-slate-100 p-2 cursor-pointer transition-all hover:bg-slate-200">
                    <Plus className="text-slate-500" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search teachers..." />
                  <CommandEmpty>No teachers found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {teachers.length > 0 &&
                        teachers.map((teacher: Partial<Account>) => (
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
                                setIsTeacherSelectOpen(false)
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
            {errors.teachers && (
              <p className="text-red-500">{errors.teachers.message}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            {/* TODO: custom MON / TUE / WED picker */}
            <h2 className="text-lg font-semibold mt-4 mb-2">Tag</h2>
            <Input
              placeholder="Date"
              type="text"
              {...register("date")}
              className="mb-2"
            />
            {errors.date && (
              <p className="text-red-500">{errors.date.message}</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Zeitraum</h2>
            <Input placeholder="Time" {...register("time")} className="mb-2" />
            {errors.time && (
              <p className="text-red-500">{errors.time.message}</p>
            )}

            {/* TODO: custom location picker */}
            <h2 className="text-lg font-semibold mt-4 mb-2">Ort</h2>
            <Input
              placeholder="Ort"
              {...register("location")}
              className="mb-2"
            />
            {errors.location && (
              <p className="text-red-500">{errors.location?.message}</p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            {/* min/max grade */}
            <h2 className="text-lg font-semibold mt-4 mb-2">Jahrgangsstufen</h2>
            {/* TODO range selector students */}
            {(errors.minGrade || errors.maxGrade) && (
              <p className="text-red-500">
                {errors.minGrade?.message || errors.maxGrade?.message}
              </p>
            )}

            {/* max students */}
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Maximale Schüleranzahl
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
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button onClick={handlePrev} variant="secondary" type="button">
              Zurück
            </Button>
          ) : (
            <div />
          )}

          {step === steps.length - 1 ? (
            <Button
              onClick={() => onSubmit(getValues())}
              disabled={!isCurrentStepValid()}
            >
              Fertig
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
