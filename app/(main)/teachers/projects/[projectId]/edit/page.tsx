"use client"
import Loader from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebounce } from "@/hooks/use-debounce"
import { queryProject } from "@/lib/actions/queries/projects"
import { ProjectEditSchema } from "@/lib/form-schemas"
import { isValidImage } from "@/lib/helpers/image"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { DM_Sans } from "next/font/google"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["800"],
})

type Props = {}

type FormData = z.infer<typeof ProjectEditSchema>

const ProjectEditor = ({}: Props) => {
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fileTooLarge, setFileTooLarge] = useState(false)
  const [replacingImage, setReplacingImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  // Custom image URL logic
  const [imgUrl, setImgUrl] = useState<string | undefined>()
  const debouncedUrl = useDebounce(imgUrl, 500)
  const [imgError, setImgError] = useState<string | undefined>()

  const { projectId } = useParams() as { projectId: string }

  const { data: project, isPending } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const project = await queryProject(projectId)
      setPreviewUrl(project?.imageUrl)
      return project
    },
  })

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof ProjectEditSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProjectEditSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (project) {
      setValue("title", project.name)
      setValue("description", project.description)
      setValue("banner", project.imageUrl)
      setValue("emoji", project.emoji)
      setValue(
        "teachers",
        project.teachers.map((t) => t.id)
      )
      setValue("maxStudents", project.maxStudents)
      setValue("minGrade", project.minGrade)
    }
  }, [project, reset, setValue])

  const onSubmit = async (data: FormData) => {
    return new Promise((resolve) => setTimeout(resolve, 1000))
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

  const handleEmojiSelect = (emoji: string) => {
    setValue("emoji", emoji) // Update the form value for the emoji field
  }

  if (isPending)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
      </div>
    )

  // For live updates, eg preview image and title
  watch()

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-xl font-bold mb-4">Projekt bearbeiten</h1>
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2">Titel</h2>
          <Input {...register("title")} placeholder="Titel" />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2">Beschreibung</h2>
          <Input {...register("description")} placeholder="Beschreibung" />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        {/* Image change (or leave) */}
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2">Bild Upload</h2>
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
                type="button"
                onClick={() => {
                  setReplacingImage(true)
                  setPreviewUrl(undefined)
                }}
                className="mt-4 w-32"
              >
                Bild ersetzen
              </Button>
            </div>
          )}
        </div>
        {/* emojiii */}
        <div className="">
          <h2 className="text-lg font-semibold mt-4 mb-2">Emoji</h2>
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
        <Alert className="border-yellow-500 text-yellow-500">
          <Info className="h-4 w-4" color="#eab308" />
          <AlertTitle>Änderungen</AlertTitle>
          <AlertDescription>
            Es wurden die Felder Titel, Beschreibung und Emoji geändert.
          </AlertDescription>
        </Alert>
        <div className="flex justify-between mt-8">
          <Button variant={"secondary"} type="button">
            Abbrechen
          </Button>
          <Button
            className="flex items-center gap-2"
            type="submit"
            disabled={isSubmitting}
          >
            {!isSubmitting ? "Speichern" : <Loader />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProjectEditor
