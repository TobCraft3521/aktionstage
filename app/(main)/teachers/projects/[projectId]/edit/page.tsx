"use client"
import Loader from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectEditSchema } from "@/lib/form-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { PartyPopper } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type Props = {}

type FormData = z.infer<typeof ProjectEditSchema>

const ProjectEditor = (props: Props) => {
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof ProjectEditSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProjectEditSchema),
    defaultValues: {
      // fetch
    },
  })

  const onSubmit = async (data: FormData) => {
    return new Promise((resolve) => setTimeout(resolve, 1000))
  }
  console.log(errors)

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
        <div className="">
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
                  // onChange={handleFileChange}
                />
                {/* fileTooLarge is also validated server side */}
                <Button
                // disabled={
                //   !file || fileTooLarge || isUploading || fileUploadSuccess
                // }
                // onClick={handleUpload}
                >
                  {/* {!fileUploadSuccess &&
                      !fileUploadError &&
                      !isUploading &&
                      "Hochladen"}
                    {fileUploadError && "Fehler"}
                    {fileUploadSuccess && <Check />}
                    {isUploading && <Loader2Icon className="animate-spin" />} */}
                </Button>
              </div>
              {/* {fileTooLarge && (
                  <p className="text-yellow-500">
                    ⚠️ Datei darf nicht über 5MB sein
                  </p>
                )}
                {fileUploadError && (
                  <p className="text-red-500">‼️ Fehler beim Hochladen</p>
                )} */}
            </TabsContent>
            <TabsContent value="url">
              <Input
                placeholder="Banner URL"
                title="Banner URL"
                type="url"
                // onChange={handleImgUrlChange}
                className="mb-2"
              />
              {/* {imgError && <p className="text-yellow-500">{imgError}</p>} */}
            </TabsContent>
          </Tabs>
        </div>
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
